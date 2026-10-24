/**
 * Shared types for the Gemini integration boundary.
 *
 * TEAMMATE-OWNED FILE AREA: everything under lib/gemini/ and
 * app/api/gemini/ is where Gemini work lives. Nothing in
 * components/questionnaire/ or lib/rules/ needs to change for this
 * integration to go from placeholder to real — only the function bodies
 * in this folder need to be filled in.
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

export interface ExplainTopicRequest {
  evaluation: TopicEvaluation;
  facts: TaxFacts;
}

export interface TopicExplanation {
  /** Plain-English explanation grounded in the rule's own summary/citations
   * — the model should not introduce facts beyond what's passed in. */
  explanation: string;
  source: "gemini" | "deterministic_fallback";
}
