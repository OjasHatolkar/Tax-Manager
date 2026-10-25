/**
 * Shared types for the Gemini integration boundary.
 *
 * Shared request and response types for the server-side Gemini boundary.
 */

import type { TaxFacts, TopicEvaluation } from "@/lib/rules/types";

export interface FollowUpRequest {
  facts: TaxFacts;
  evaluations: TopicEvaluation[];
}

export interface FollowUpQuestion {
  /** Which TaxFacts key answering this question would resolve. */
  targetFact: keyof TaxFacts;
  /** Plain-English question to show the user. */
  question: string;
  /** Why this is being asked, shown as supporting copy. */
  rationale: string;
  /** Marks whether this came from the real model or the deterministic
   * fallback — surfaced in the UI so nothing is silently misrepresented. */
  source: "gemini" | "deterministic_fallback";
}

export interface ExplainRequest {
  answers: TaxFacts;
}

export interface ExplainAdvice {
  summary: string;
  actions: { title: string; detail: string }[];
  caveats: string[];
}
