/**
 * Deterministic condition evaluator.
 *
 * Uses three-valued (Kleene) logic so that a missing fact produces
 * "unknown" rather than silently being treated as false. Callers can then
 * surface exactly which facts are still needed to reach a determination.
 *
 * This file contains NO tax rules and NO AI calls â€” it only walks a
 * RuleCondition tree against a TaxFacts object. See rules/data for the
 * actual tax logic and lib/gemini (future) for anything AI-related.
 */

import type { FactCondition, RuleCondition, TaxFacts, Tri } from "../types";

/** Collects which fact keys caused an "unknown" result during evaluation. */
export interface EvalResult {
  value: Tri;
  unknownFacts: Set<keyof TaxFacts>;
}

function evalFactCondition(cond: FactCondition, facts: TaxFacts): EvalResult {
  const actual = facts[cond.fact];

  if (cond.op === "exists") {
    return { value: actual !== undefined ? "true" : "false", unknownFacts: new Set() };
  }

  if (actual === undefined) {
    return { value: "unknown", unknownFacts: new Set([cond.fact]) };
  }

  let value: Tri;
  switch (cond.op) {
    case "eq":
      value = actual === cond.value ? "true" : "false";
      break;
    case "neq":
      value = actual !== cond.value ? "true" : "false";
      break;
    case "lt":
      value = (actual as number) < (cond.value as number) ? "true" : "false";
      break;
    case "lte":
      value = (actual as number) <= (cond.value as number) ? "true" : "false";
      break;
    case "gt":
      value = (actual as number) > (cond.value as number) ? "true" : "false";
      break;
    case "gte":
      value = (actual as number) >= (cond.value as number) ? "true" : "false";
      break;
    case "in":
      value = Array.isArray(cond.value) && cond.value.includes(actual) ? "true" : "false";
      break;
    default:
      throw new Error(`Unsupported condition operator: ${String((cond as FactCondition).op)}`);
  }
  return { value, unknownFacts: new Set() };
}

/** Kleene AND: false dominates, otherwise unknown dominates, else true. */
function kleeneAnd(values: Tri[]): Tri {
  if (values.some((v) => v === "false")) return "false";
  if (values.some((v) => v === "unknown")) return "unknown";
  return "true";
}

/** Kleene OR: true dominates, otherwise unknown dominates, else false. */
function kleeneOr(values: Tri[]): Tri {
  if (values.some((v) => v === "true")) return "true";
  if (values.some((v) => v === "unknown")) return "unknown";
  return "false";
}

function kleeneNot(value: Tri): Tri {
  if (value === "true") return "false";
  if (value === "false") return "true";
  return "unknown";
}

export function evaluateCondition(cond: RuleCondition, facts: TaxFacts): EvalResult {
  switch (cond.type) {
    case "fact":
      return evalFactCondition(cond, facts);

    case "and": {
      const results = cond.conditions.map((c) => evaluateCondition(c, facts));
      const value = kleeneAnd(results.map((r) => r.value));
      const unknownFacts = mergeUnknowns(results, value, "and");
      return { value, unknownFacts };
    }

    case "or": {
      const results = cond.conditions.map((c) => evaluateCondition(c, facts));
      const value = kleeneOr(results.map((r) => r.value));
      const unknownFacts = mergeUnknowns(results, value, "or");
      return { value, unknownFacts };
    }

    case "not": {
      const inner = evaluateCondition(cond.condition, facts);
      return { value: kleeneNot(inner.value), unknownFacts: inner.unknownFacts };
    }

    default:
      throw new Error(`Unsupported condition type: ${String((cond as RuleCondition).type)}`);
  }
}

/**
 * When the overall result is "unknown", we want to tell the user exactly
 * which still-missing facts could change the answer. For AND, facts behind
 * a branch that already evaluated to "false" are irrelevant (the whole
 * expression is false regardless), so we only surface unknowns from
 * branches that weren't already decisive. Same logic mirrored for OR.
 */
function mergeUnknowns(
  results: EvalResult[],
  overall: Tri,
  kind: "and" | "or",
): Set<keyof TaxFacts> {
  const merged = new Set<keyof TaxFacts>();
  if (overall !== "unknown") return merged;

  for (const r of results) {
    const branchIsDecisive =
      (kind === "and" && r.value === "false") || (kind === "or" && r.value === "true");
    if (!branchIsDecisive) {
      r.unknownFacts.forEach((f) => merged.add(f));
    }
  }
  return merged;
}
