/**
 * Registry of all available versioned rule sets.
 *
 * Adding a new tax year or jurisdiction means adding one file in this
 * directory and registering it here — the evaluator and UI never need to
 * change.
 */

import type { RuleSet } from "../types";
import { federal2025 } from "./federal-2025";
import { pennsylvania2025 } from "./pennsylvania-2025";

export const RULE_SETS: RuleSet[] = [federal2025, pennsylvania2025];

export function getRuleSetsForYear(taxYear: number): RuleSet[] {
  return RULE_SETS.filter((rs) => rs.taxYear === taxYear);
}

export { federal2025, pennsylvania2025 };
