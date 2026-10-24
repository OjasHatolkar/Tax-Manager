# Tax Help — Rules Engine

A standalone, deterministic, versioned tax-rules engine for the Tax Help
hackathon project (tax year 2025: U.S. federal + Pennsylvania). This
package is **pure TypeScript logic and data — no UI, no network calls,
no AI**. It is intentionally separate from the landing-page Next.js
project (`tax-help-landing-page/`) so the tax logic can be reviewed,
tested, and versioned independently.

## What's in here

- `rules/types.ts` — shared types: `TaxFacts`, `TopicRule`, `RuleSet`,
  and the three-valued `Tri` (`true | false | "unknown"`) type that
  prevents the engine from silently treating missing info as "no".
- `rules/engine/evaluate.ts` — three-valued (Kleene) condition logic.
- `rules/engine/evaluateTopic.ts` — turns a rule + facts into
  `may_apply` / `does_not_apply` / `needs_info`. Never returns
  "confirmed eligible."
- `rules/engine/missingFacts.ts` — ranks missing facts by how many
  topics they would unblock, for driving adaptive follow-up questions.
- `rules/data/federal-2025.ts` — federal filing requirement, EITC,
  American Opportunity Credit, Lifetime Learning Credit, student loan
  interest deduction, Saver's Credit, taxable scholarship income.
- `rules/data/pennsylvania-2025.ts` — PA Tax Forgiveness (Schedule SP),
  Local Services Tax, local Earned Income Tax flag.
- `rules/__tests__/scenarios.test.ts` — the three hackathon test
  personas (college student, student with a side hustle, recent
  graduate), run as real assertions against the engine.

## Run it

```bash
npm install
npm test
```

This runs all 21 behavioral tests and prints pass/fail to the console.

## How this connects to the rest of Tax Help

This package has no dependency on Next.js, React, or the landing page.
To use it inside the main app, copy `rules/` into that project's
`lib/rules/` folder (or install this package locally) and import from
it, e.g.:

```ts
import { evaluateTopic } from "./rules/engine/evaluateTopic";
import { federalRuleSet2025 } from "./rules/data/federal-2025";
```

The questionnaire (not yet built) is responsible for producing a
`TaxFacts` object from user answers. This engine only evaluates facts
it's given — it never asks questions itself and never calls Gemini or
any external API. Gemini's future role is to explain this engine's
output in plain English, not to replace it.

## Scope and honesty notes

- Verified against IRS.gov and PA.gov for tax year 2025 as of the build
  date. Tax law changes yearly — re-verify before reusing in another
  year.
- Known gaps: PA Tax Forgiveness only implements the 100%-forgiveness
  threshold, not the partial 10–90% sliding scale above it. Local EIT
  rates are never hardcoded (they vary by ~2,500 PA municipalities) —
  the engine flags "investigate your local rate" instead of guessing.
  Child Tax Credit and Premium Tax Credit are not yet modeled.
- This engine never produces a refund estimate or guarantees eligibility
  for any credit or deduction.
