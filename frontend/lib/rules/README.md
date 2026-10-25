# Deterministic tax rules

The frontend rules engine screens supplied facts against versioned rule data
and returns `may_apply`, `does_not_apply`, or `needs_info`. Its three-valued
logic preserves unknown facts instead of assuming a missing answer is false.
It does not calculate a tax return or guarantee a benefit.

## Files

- `types.ts` defines tax facts, conditions, rules, citations, and evaluations.
- `engine/evaluate.ts` evaluates boolean rule trees with true/false/unknown
  values.
- `engine/evaluateTopic.ts` evaluates one topic and identifies missing facts.
- `engine/missingFacts.ts` ranks missing facts for adaptive follow-up prompts.
- `data/federal-2025.ts` and `data/pennsylvania-2025.ts` contain the currently
  supported 2025 rule data and official-source citations.
- `data/index.ts` selects rule sets for a requested tax year.

`components/questionnaire/ResultsPanel.tsx` consumes the engine for supported
2025 answers. The separate `rules-engine/` directory contains a standalone
copy for direct testing; keep the two copies synchronized when changing rules.
The frontend's `npm test` runs its rule scenarios, and
`npm test --prefix rules-engine` runs the standalone package scenarios.

## Scope

The encoded topics are limited federal, Pennsylvania state, and Pennsylvania
local screening rules. Pennsylvania Tax Forgiveness does not implement the
partial 10%–90% tiers above the encoded full-forgiveness ceiling. Child Tax
Credit, Premium Tax Credit, itemized deductions, capital gains, rental income,
multi-state apportionment, and AMT are not modeled. Review each data file's
citations and limitations before relying on or extending a rule.
