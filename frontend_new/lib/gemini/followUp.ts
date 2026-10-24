/**
 * ============================================================================
 * GEMINI INTEGRATION POINT — PLACEHOLDER, NOT YET WIRED TO GEMINI
 * ============================================================================
 *
 * This is the single function the questionnaire UI calls to get an adaptive
 * follow-up question. Today it returns a DETERMINISTIC fallback derived
 * directly from the rules engine's own missing-fact ranking — no AI call
 * happens here yet, and the returned `source: "deterministic_fallback"`
 * flag makes that visible to the UI (see ResultsPanel.tsx) instead of
 * quietly pretending to be AI-generated.
 *
 * TO WIRE UP REAL GEMINI (next step for whoever owns this):
 *   1. Add GEMINI_API_KEY to .env.local (server-only — never prefix with
 *      NEXT_PUBLIC_, never import this key into a "use client" file).
 *   2. Implement app/api/gemini/follow-up/route.ts as a POST handler that
 *      calls the Gemini API server-side with `facts` + `evaluations`,
 *      asking it to pick ONE of the engine's own `missingFacts` entries
 *      and phrase a friendly question + rationale for it.
 *   3. Validate the model's JSON response against the FollowUpQuestion
 *      shape before returning it — reject/fallback on malformed output.
 *   4. Replace the body of `getAdaptiveFollowUp` below with a `fetch("/api/
 *      gemini/follow-up", ...)` call, falling back to
 *      `deterministicFollowUp()` if the request fails or returns invalid
 *      data (keep the fallback — it's a good safety net, not dead code).
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
 * Public entry point the UI calls. Currently always resolves to the
 * deterministic fallback — see the file header for the exact steps to
 * replace this with a real Gemini-backed call.
 */
export async function getAdaptiveFollowUp(
  request: FollowUpRequest
): Promise<FollowUpQuestion | null> {
  return deterministicFollowUp(request);
}
