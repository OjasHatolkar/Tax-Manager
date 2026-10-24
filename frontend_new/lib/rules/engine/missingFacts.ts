/**
 * Aggregates missing facts across every evaluated topic so the questionnaire
 * can decide which follow-up question to ask next.
 *
 * This is deliberately separate from evaluateTopic/evaluateRuleSet: the
 * evaluator's job is "what does this topic resolve to", while this module's
 * job is "given everything that's still unresolved, what's the single most
 * useful next question" — a UI/product concern, not a tax-logic concern.
 */

import type { TaxFacts, TopicEvaluation } from "../types";

export interface MissingFactSummary {
  fact: keyof TaxFacts;
  /** How many still-undetermined topics would be affected by this fact. */
  blocksTopics: string[];
}

/**
 * Ranks missing facts by how many pending ("needs_info") topics they would
 * help resolve, so the questionnaire can prioritize the highest-leverage
 * question first instead of asking in a fixed, arbitrary order.
 */
export function rankMissingFacts(evaluations: TopicEvaluation[]): MissingFactSummary[] {
  const byFact = new Map<keyof TaxFacts, string[]>();

  for (const evaluation of evaluations) {
    if (evaluation.status !== "needs_info") continue;
    for (const fact of evaluation.missingFacts) {
      const existing = byFact.get(fact) ?? [];
      existing.push(evaluation.topicId);
      byFact.set(fact, existing);
    }
  }

  return Array.from(byFact.entries())
    .map(([fact, blocksTopics]) => ({ fact, blocksTopics }))
    .sort((a, b) => b.blocksTopics.length - a.blocksTopics.length);
}

/** Convenience: just the next single highest-leverage fact to ask about, if any. */
export function nextMissingFact(evaluations: TopicEvaluation[]): keyof TaxFacts | null {
  const ranked = rankMissingFacts(evaluations);
  return ranked[0]?.fact ?? null;
}

/**
 * Buckets a facts object + its evaluations into a simple provenance-aware
 * shape the UI can render as "Confirmed / Still needed" without re-deriving
 * logic. Source tracking (user-entered vs. document-extracted vs.
 * calculated) is intentionally NOT modeled here yet — see lib/types.ts
 * AssessmentAnswer for where that belongs once the questionnaire exists.
 */
export function summarizeCompleteness(
  facts: TaxFacts,
  evaluations: TopicEvaluation[],
): { resolvedTopics: number; pendingTopics: number; outstandingFacts: MissingFactSummary[] } {
  const resolvedTopics = evaluations.filter((e) => e.status !== "needs_info").length;
  const pendingTopics = evaluations.length - resolvedTopics;
  return {
    resolvedTopics,
    pendingTopics,
    outstandingFacts: rankMissingFacts(evaluations),
  };
}
