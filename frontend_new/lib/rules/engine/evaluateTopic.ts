/**
 * Turns a single TopicRule + TaxFacts into a TopicEvaluation.
 *
 * Status mapping (deliberately conservative â€” see product requirement that
 * this app must never claim confirmed eligibility):
 *   - Any exception condition is true   -> "does_not_apply"
 *   - Main condition is true (and no exception is true/unknown) -> "may_apply"
 *   - Main condition is false            -> "does_not_apply"
 *   - Anything unresolved                -> "needs_info", with the exact
 *                                           list of missing facts attached.
 */

import type { TaxFacts, TopicEvaluation, TopicRule } from "../types";
import { evaluateCondition } from "./evaluate";

export function evaluateTopic(
  topic: TopicRule,
  facts: TaxFacts,
  ruleSetId: string,
  ruleSetVersion: string,
): TopicEvaluation {
  const base = {
    topicId: topic.id,
    title: topic.title,
    summary: topic.summary,
    requiredDocuments: topic.requiredDocuments,
    citations: topic.citations,
    ruleSetId,
    ruleSetVersion,
  };

  // Hard bars are checked first. If any is definitely true, nothing else
  // matters â€” the topic does not apply, full stop.
  for (const exception of topic.exceptionConditions ?? []) {
    const result = evaluateCondition(exception, facts);
    if (result.value === "true") {
      return { ...base, status: "does_not_apply", missingFacts: [] };
    }
  }

  // If any exception is still unknown, we can't be sure it won't fire, so we
  // need that fact too, even if the main condition is otherwise satisfied.
  const unresolvedExceptionFacts = new Set<keyof TaxFacts>();
  for (const exception of topic.exceptionConditions ?? []) {
    const result = evaluateCondition(exception, facts);
    if (result.value === "unknown") {
      result.unknownFacts.forEach((f) => unresolvedExceptionFacts.add(f));
    }
  }

  const main = evaluateCondition(topic.eligibilityCondition, facts);

  if (main.value === "false") {
    return { ...base, status: "does_not_apply", missingFacts: [] };
  }

  if (main.value === "true" && unresolvedExceptionFacts.size === 0) {
    return { ...base, status: "may_apply", missingFacts: [] };
  }

  // Either the main condition is unknown, or an exception is unresolved.
  const missing = new Set<keyof TaxFacts>([...main.unknownFacts, ...unresolvedExceptionFacts]);
  return { ...base, status: "needs_info", missingFacts: Array.from(missing) };
}

export function evaluateRuleSet(
  topics: TopicRule[],
  facts: TaxFacts,
  ruleSetId: string,
  ruleSetVersion: string,
): TopicEvaluation[] {
  return topics.map((t) => evaluateTopic(t, facts, ruleSetId, ruleSetVersion));
}
