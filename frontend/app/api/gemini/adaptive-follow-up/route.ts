import { NextResponse } from "next/server";
import { Type } from "@google/genai";
import { rankMissingFacts } from "@/lib/rules/engine/missingFacts";
import { cleanFacts } from "@/lib/gemini/sanitize";
import { getAuthoritativeEvaluations, getGemini, getModel } from "@/lib/gemini/server";
import type { FollowUpQuestion } from "@/lib/gemini/types";
import { FOLLOW_UP_INPUTS, MAX_ADAPTIVE_QUESTIONS } from "@/lib/gemini/followUp";
import { isRecord, readJsonRequest, RequestBodyError } from "@/lib/api/request";
import { checkGeminiRateLimit, trackGeminiCall } from "@/lib/health/telemetry";

const SYSTEM = `You write one helpful follow-up question for a college student or recent graduate completing a tax questionnaire.
Choose exactly one targetFact from ALLOWED MISSING FACTS. Never choose a fact that is not listed.
Ask for the missing information in plain language. The rationale must be based only on the supplied rules results.
Do not provide tax advice, thresholds, rates, deadlines, or eligibility conclusions. Return only the requested JSON.`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    targetFact: { type: Type.STRING },
    question: { type: Type.STRING },
    rationale: { type: Type.STRING },
  },
  required: ["targetFact", "question", "rationale"],
};

export async function POST(req: Request) {
  const rateLimitResponse = checkGeminiRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;
  let body: unknown;
  try {
    body = await readJsonRequest(req);
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid JSON" }, { status });
  }

  if (!isRecord(body)) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const facts = cleanFacts(body.facts);
  if (!facts) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const excludedFacts = body.excludedFacts === undefined ? [] : body.excludedFacts;
  if (!Array.isArray(excludedFacts) || excludedFacts.length > MAX_ADAPTIVE_QUESTIONS ||
      !excludedFacts.every((fact) => typeof fact === "string" && fact in FOLLOW_UP_INPUTS)) {
    return NextResponse.json({ error: "Invalid excluded facts" }, { status: 400 });
  }

  const evaluations = getAuthoritativeEvaluations(facts);
  const excluded = new Set(excludedFacts);
  const ranked = rankMissingFacts(evaluations).filter(({ fact }) => !excluded.has(fact) && fact in FOLLOW_UP_INPUTS);
  if (ranked.length === 0) return NextResponse.json({ followUp: null });

  const allowedFacts = ranked.map(({ fact, blocksTopics }) => ({
    fact,
    topics: evaluations
      .filter((evaluation) => blocksTopics.includes(evaluation.topicId))
      .map(({ title, summary }) => ({ title, summary })),
  }));

  try {
    const result = await trackGeminiCall("adaptive-follow-up", () => getGemini().models.generateContent({
        model: getModel(),
        contents: `CURRENT ANSWERS (context only):\n${JSON.stringify(facts)}\n\nALLOWED MISSING FACTS:\n${JSON.stringify(allowedFacts)}`,
        config: {
          systemInstruction: SYSTEM,
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.2,
          maxOutputTokens: 256,
        },
      }));

    const parsed: unknown = JSON.parse(result.text ?? "");
    if (typeof parsed !== "object" || parsed === null) return NextResponse.json({ followUp: null });
    const candidate = parsed as Record<string, unknown>;
    const target = ranked.find(({ fact }) => fact === candidate.targetFact);
    if (
      !target || typeof candidate.question !== "string" ||
      candidate.question.trim().length === 0 || candidate.question.length > 240 ||
      typeof candidate.rationale !== "string" ||
      candidate.rationale.trim().length === 0 || candidate.rationale.length > 400
    ) return NextResponse.json({ followUp: null });

    const followUp: FollowUpQuestion = {
      targetFact: target.fact,
      question: candidate.question.trim(),
      rationale: candidate.rationale.trim(),
      source: "gemini",
    };
    return NextResponse.json({ followUp });
  } catch (error) {
    console.error("Gemini adaptive follow-up failed:", error);
    return NextResponse.json(
      { error: "Gemini is temporarily unavailable", followUp: null },
      { status: 503 }
    );
  }
}
