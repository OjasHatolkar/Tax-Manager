import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { POST as adaptiveFollowUpPost } from "@/app/api/gemini/adaptive-follow-up/route";
import { POST as askPost } from "@/app/api/gemini/ask/route";
import { POST as explainPost } from "@/app/api/gemini/explain/route";
import { readJsonRequest, RequestBodyError } from "@/lib/api/request";
import { cleanFacts } from "@/lib/gemini/sanitize";
import { deterministicFollowUp, getAdaptiveFollowUp, MAX_ADAPTIVE_QUESTIONS, parseFollowUpAnswer } from "@/lib/gemini/followUp";
import type { FollowUpRequest } from "@/lib/gemini/types";
import { mapToTaxFacts } from "@/lib/questionnaire/mapToTaxFacts";
import { toggleMultiSelectValue } from "@/components/questionnaire/QuestionField";
import { evaluateCondition } from "@/lib/rules/engine/evaluate";
import { rankMissingFacts } from "@/lib/rules/engine/missingFacts";
import type { TopicEvaluation } from "@/lib/rules/types";
import { checkGeminiRateLimit, getTelemetrySnapshot, trackGeminiCall } from "@/lib/health/telemetry";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

function evaluation(status: TopicEvaluation["status"], missingFacts: TopicEvaluation["missingFacts"], topicId = "topic") {
  return {
    topicId,
    title: topicId,
    summary: "A test rule summary.",
    status,
    missingFacts,
    requiredDocuments: [],
    citations: [],
    ruleSetId: "test",
    ruleSetVersion: "1",
  } satisfies TopicEvaluation;
}

function followUpRequest(): FollowUpRequest {
  return {
    facts: {},
    evaluations: [evaluation("needs_info", ["filingStatus"])],
  };
}

test("fact sanitizer accepts valid known facts and rejects unknown or mistyped fields", () => {
  assert.deepEqual(cleanFacts({ isStudent: true, magi: 42000, filingStatus: "single" }), {
    isStudent: true, magi: 42000, filingStatus: "single",
  });
  assert.equal(cleanFacts({ unexpectedField: true }), null);
  assert.equal(cleanFacts({ isStudent: "yes" }), null);
  assert.equal(cleanFacts({ filingStatus: "divorced" }), null);
  assert.equal(cleanFacts({ magi: Number.POSITIVE_INFINITY }), null);
  assert.equal(cleanFacts({ magi: { amount: 1 } }), null);
});

test("three-valued evaluator retains unknown facts and applies decisive AND/OR branches", () => {
  const andResult = evaluateCondition({
    type: "and",
    conditions: [
      { type: "fact", fact: "magi", op: "lt", value: 50000 },
      { type: "fact", fact: "filingStatus", op: "eq", value: "single" },
    ],
  }, { magi: 60000 });
  assert.equal(andResult.value, "false");
  assert.equal(andResult.unknownFacts.size, 0);

  const orResult = evaluateCondition({
    type: "or",
    conditions: [
      { type: "fact", fact: "magi", op: "gt", value: 10000 },
      { type: "fact", fact: "filingStatus", op: "eq", value: "single" },
    ],
  }, { magi: 20000 });
  assert.equal(orResult.value, "true");
  assert.equal(orResult.unknownFacts.size, 0);
});

test("questionnaire mapping preserves unanswered student and Pennsylvania facts as unknown", () => {
  const emptyFacts = mapToTaxFacts({});
  assert.equal(emptyFacts.isStudent, undefined);
  assert.equal(emptyFacts.isPennsylvaniaResident, undefined);

  const facts = mapToTaxFacts({ educationStatus: "not_a_student", residenceState: "NY" });
  assert.equal(facts.isStudent, false);
  assert.equal(facts.isPennsylvaniaResident, false);
});

test("income multi-select keeps the explicit no-income choice exclusive", () => {
  assert.deepEqual(toggleMultiSelectValue(["w2"], "none"), ["none"]);
  assert.deepEqual(toggleMultiSelectValue(["none"], "freelance_gig"), ["freelance_gig"]);
  assert.deepEqual(toggleMultiSelectValue(["w2", "freelance_gig"], "w2"), ["freelance_gig"]);
});

test("missing-fact ranking counts unresolved topics and ignores resolved topics", () => {
  const ranked = rankMissingFacts([
    evaluation("needs_info", ["magi", "filingStatus"], "a"),
    evaluation("needs_info", ["magi"], "b"),
    evaluation("may_apply", ["filingStatus"], "c"),
  ]);
  assert.deepEqual(ranked.map(({ fact, blocksTopics }) => [fact, blocksTopics.length]), [
    ["magi", 2], ["filingStatus", 1],
  ]);
});

test("adaptive follow-up returns deterministic output when no missing fact exists", async () => {
  const request = { facts: {}, evaluations: [evaluation("may_apply", [])] };
  globalThis.fetch = async () => { throw new Error("fetch should not run"); };
  assert.equal(deterministicFollowUp(request), null);
  assert.equal(await getAdaptiveFollowUp(request), null);
});

test("adaptive follow-up accepts only a response targeting a currently missing fact", async () => {
  const request = followUpRequest();
  globalThis.fetch = async () => Response.json({ followUp: {
    targetFact: "filingStatus",
    question: "Which filing status applies to you?",
    rationale: "Several rules depend on this answer.",
    source: "gemini",
  } });
  assert.equal((await getAdaptiveFollowUp(request))?.source, "gemini");

  globalThis.fetch = async () => Response.json({ followUp: {
    targetFact: "magi",
    question: "Invented target",
    rationale: "Not missing in the rule results.",
    source: "gemini",
  } });
  assert.equal((await getAdaptiveFollowUp(request))?.source, "deterministic_fallback");
});

test("adaptive follow-up falls back after failed HTTP responses", async () => {
  const request = followUpRequest();
  globalThis.fetch = async () => new Response(null, { status: 503 });
  assert.equal((await getAdaptiveFollowUp(request))?.source, "deterministic_fallback");
});

test("adaptive follow-up answers are strictly typed and question count is bounded", () => {
  assert.equal(parseFollowUpAnswer("isStudent", "yes"), true);
  assert.equal(parseFollowUpAnswer("filingStatus", "married_filing_jointly"), "married_filing_jointly");
  assert.equal(parseFollowUpAnswer("magi", "42000.50"), 42000.5);
  assert.equal(parseFollowUpAnswer("numberOfDependents", "1.5"), null);
  assert.equal(parseFollowUpAnswer("magi", "1e20"), null);
  assert.equal(parseFollowUpAnswer("magi", "not_sure"), null);
  assert.equal(MAX_ADAPTIVE_QUESTIONS, 3);
});

test("JSON request reader enforces its byte limit and rejects malformed JSON", async () => {
  await assert.rejects(
    readJsonRequest(new Request("http://localhost", { method: "POST", body: "{" })),
    (error: unknown) => error instanceof RequestBodyError && error.status === 400,
  );
  await assert.rejects(
    readJsonRequest(new Request("http://localhost", { method: "POST", body: "12345" }), 4),
    (error: unknown) => error instanceof RequestBodyError && error.status === 413,
  );
  assert.deepEqual(await readJsonRequest(new Request("http://localhost", {
    method: "POST", headers: { "content-type": "application/json" }, body: '{"ok":true}',
  })), { ok: true });
});

test("Gemini API routes reject malformed and unsupported facts before calling the provider", async () => {
  const invalid = new Request("http://localhost/api/gemini/explain", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers: { nope: true } }),
  });
  assert.equal((await explainPost(invalid)).status, 400);

  const invalidAdaptive = new Request("http://localhost/api/gemini/adaptive-follow-up", {
    method: "POST", headers: { "content-type": "application/json" }, body: "[]",
  });
  assert.equal((await adaptiveFollowUpPost(invalidAdaptive)).status, 400);

  const invalidExcluded = new Request("http://localhost/api/gemini/adaptive-follow-up", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ facts: {}, excludedFacts: ["notATaxFact"] }),
  });
  assert.equal((await adaptiveFollowUpPost(invalidExcluded)).status, 400);

  const invalidAsk = new Request("http://localhost/api/gemini/ask", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: "Hi", answers: { nope: true } }),
  });
  assert.equal((await askPost(invalidAsk)).status, 400);
});

test("Gemini rate limiter returns 429 and Retry-After at the configured boundary", () => {
  const ip = `test-${Date.now()}-${Math.random()}`;
  for (let i = 0; i < 2; i++) {
    const response = checkGeminiRateLimit(new Request("http://localhost", {
      headers: { "x-forwarded-for": ip },
    }), 2, 60_000);
    assert.equal(response, null);
  }
  const limited = checkGeminiRateLimit(new Request("http://localhost", {
    headers: { "x-forwarded-for": ip },
  }), 2, 60_000);
  assert.equal(limited?.status, 429);
  assert.ok(limited?.headers.get("Retry-After"));
});

test("Gemini telemetry records calls, tokens, failures, and duration", async () => {
  const before = getTelemetrySnapshot().endpoints.ask;
  const result = await trackGeminiCall("ask", async () => ({
    usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 4, totalTokenCount: 14 },
  }));
  assert.equal(result.usageMetadata?.totalTokenCount, 14);
  await assert.rejects(trackGeminiCall("ask", async () => {
    throw Object.assign(new Error("provider failed"), { status: 503 });
  }));
  const after = getTelemetrySnapshot().endpoints.ask;
  assert.ok(before && after);
  assert.equal(after.requests, before.requests + 2);
  assert.equal(after.successes, before.successes + 1);
  assert.equal(after.failures, before.failures + 1);
  assert.equal(after.totalTokens, before.totalTokens + 14);
  assert.equal(after.lastErrorStatus, 503);
});
