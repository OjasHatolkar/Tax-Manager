/**
 * ============================================================================
 * Gemini-backed adaptive follow-up questions with a deterministic fallback.
 * ============================================================================
 *
 * The adaptive route may only select a fact ranked as missing by the rules
 * engine. The API key stays on the server, and all failures use the
 * deterministic question so the questionnaire remains available.
 *
 * IMPORTANT: Gemini must only ever choose WHICH known-missing fact to ask
 * about and HOW to phrase it. It must never invent a new tax rule, a new
 * eligibility condition, or a dollar figure — those come only from
 * lib/rules/. This keeps AI output "grounded," per the hackathon's Gemini
 * judging criteria.
 * ============================================================================
 */

import type { FollowUpQuestion, FollowUpRequest } from "./types";
import { rankMissingFacts } from "@/lib/rules/engine/missingFacts";

const FACT_QUESTION_COPY: Partial<
  Record<keyof FollowUpRequest["facts"], { question: string; rationale: string }>
> = {
  filingStatus: {
    question: "What was your filing status at the end of the tax year?",
    rationale:
      "Several credits and the Pennsylvania Tax Forgiveness income limits depend on filing status.",
  },
  magi: {
    question: "Roughly what was your modified adjusted gross income (MAGI) for the year?",
    rationale:
      "Education credits and the student loan interest deduction phase out at specific MAGI ranges.",
  },
  isClaimedAsDependent: {
    question: "Could someone else claim you as a dependent on their return?",
    rationale:
      "Dependency status changes who — if anyone — can claim certain credits, including for scholarships.",
  },
  paEligibilityIncome: {
    question: "What was your total income from all sources, including nontaxable income?",
    rationale:
      "Pennsylvania Tax Forgiveness uses a broader 'eligibility income' figure than federal taxable income.",
  },
  localJurisdictionEarnedIncome: {
    question: "About how much did you earn specifically while working in that local jurisdiction?",
    rationale:
      "Local Earned Income Tax and the Local Services Tax low-income exemption are based on local earnings.",
  },
};

/**
 * Deterministic, non-AI fallback: picks the single missing fact that would
 * unblock the most topics (via the rules engine's own ranking) and returns
 * a plain-English question for it. Always available, even with Gemini
 * fully wired up, as a safety net for API failures.
 */
export function deterministicFollowUp(request: FollowUpRequest): FollowUpQuestion | null {
  const ranked = rankMissingFacts(request.evaluations);
  if (ranked.length === 0) return null;

  const top = ranked[0];
  if (!top) return null;

  const copy = FACT_QUESTION_COPY[top.fact];
  return {
    targetFact: top.fact,
    question: copy?.question ?? `Could you provide: ${String(top.fact)}?`,
    rationale:
      copy?.rationale ??
      `This affects ${top.blocksTopics.length} topic(s) we're still unsure about.`,
    source: "deterministic_fallback",
  };
}

/**
 * Public entry point called by the questionnaire UI.
 */
export async function getAdaptiveFollowUp(
  request: FollowUpRequest
): Promise<FollowUpQuestion | null> {
  const fallback = deterministicFollowUp(request);
  if (!fallback) return null;

  const allowedFacts = new Set(rankMissingFacts(request.evaluations).map(({ fact }) => fact));
  try {
    const response = await fetch("/api/gemini/adaptive-follow-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) return fallback;

    const payload: unknown = await response.json();
    if (typeof payload !== "object" || payload === null || !("followUp" in payload)) return fallback;
    const followUp = (payload as { followUp: unknown }).followUp;
    if (typeof followUp !== "object" || followUp === null) return fallback;

    const candidate = followUp as Record<string, unknown>;
    if (
      typeof candidate.targetFact !== "string" ||
      !allowedFacts.has(candidate.targetFact as keyof FollowUpRequest["facts"]) ||
      typeof candidate.question !== "string" ||
      candidate.question.trim().length === 0 ||
      candidate.question.length > 240 ||
      typeof candidate.rationale !== "string" ||
      candidate.rationale.trim().length === 0 ||
      candidate.rationale.length > 400 ||
      candidate.source !== "gemini"
    ) return fallback;

    return {
      targetFact: candidate.targetFact as keyof FollowUpRequest["facts"],
      question: candidate.question.trim(),
      rationale: candidate.rationale.trim(),
      source: "gemini",
    };
  } catch {
    return fallback;
  }
}
