# Tax rules engine

A deterministic, versioned engine that screens a user's facts against
tax topics (credits, deductions, filing requirements) and reports one of
three statuses per topic — never a guaranteed outcome.

## Why this design

- **Rules are data, not code.** Each tax year/jurisdiction is a `RuleSet`
  object in `lib/rules/data/*.ts`. Updating a number (e.g. the 2026
  standard deduction) means editing data, not the evaluator.
- **Three-valued logic.** Every condition evaluates to `true`, `false`, or
  `unknown`. A missing fact never defaults to "no" — it surfaces as
  `needs_info` with the exact fact(s) needed, which is what will drive the
  questionnaire's adaptive follow-up questions.
- **Conservative output.** `evaluateTopic` only ever returns `may_apply`,
  `does_not_apply`, or `needs_info`. The engine never says "eligible" or
  computes a refund — consistent with the product requirement that this is
  guidance, not a determination.
- **Citations travel with the rule.** Every `TopicRule` carries official
  source URLs (IRS, PA Dept. of Revenue) shown alongside any result.

## Files

- `types.ts` — core type definitions (`TaxFacts`, `TopicRule`, `RuleSet`, etc).
- `engine/evaluate.ts` — Kleene (3-valued) boolean evaluator for condition trees.
- `engine/evaluateTopic.ts` — turns one `TopicRule` + `TaxFacts` into a `TopicEvaluation`.
- `engine/missingFacts.ts` — ranks missing facts by how many topics they'd unblock.
- `data/federal-2025.ts` — 2025 federal topics: filing requirement, self-employment
  filing trigger, EITC, AOTC, LLC, student loan interest deduction, taxable
  scholarship/grant income, and the Saver's Credit (filing-status-aware MAGI
  bands) — each sourced to an IRS page.
- `data/pennsylvania-2025.ts` — PA flat income tax filing requirement, PA Tax
  Forgiveness (Schedule SP) with the real eligibility-income table (0–3
  dependents, both filing statuses), the Local Services Tax (flat per-worker
  tax with its $12,000 low-income exemption), and the local Earned Income
  Tax flag.
- `__tests__/scenarios.test.ts` — the three hackathon test-plan scenarios plus
  targeted tests for PA Tax Forgiveness, the LST exemption, the Saver's Credit,
  and taxable scholarship income — all run as behavioral assertions against
  the real engine (not a tax-answer key).

## Running the tests

```bash
npx ts-node lib/rules/__tests__/scenarios.test.ts
```

(No test framework dependency was added to keep the project lean; this is a
plain script that throws on the first failed assertion and prints a summary.)

## Verified 2025 figures and sources

All dollar figures in `data/federal-2025.ts` and `data/pennsylvania-2025.ts`
were checked against IRS.gov and PA Department of Revenue pages as of
October 2026 (see citations on each `TopicRule`). Key numbers used:

- Standard deduction (2025): $15,750 single/MFS, $31,500 MFJ, $23,625 HoH.
- EITC (2025) max credit: $649 (0 kids) / $4,328 (1) / $7,152 (2) / $8,046 (3+);
  AGI limits and $11,950 investment-income cap per IRS EITC tables.
- AOTC: up to $2,500/student, 40% refundable; MAGI phase-out $80k–$90k single,
  $160k–$180k MFJ. LLC: up to $2,000/return, same phase-out, non-refundable.
- Student loan interest deduction: up to $2,500; MAGI phase-out $85k–$100k
  single/HoH, $170k–$200k MFJ (2025); MFS and dependents are fully barred.
- Saver's Credit (2025, Form 8880): credit disappears entirely above $39,500
  MAGI (single/MFS/QSS), $59,250 (HoH), or $79,000 (MFJ); hard disqualifiers
  regardless of income are age under 18, full-time student status, and being
  claimed as a dependent.
- Taxable scholarship income: amounts used for anything other than tuition,
  required fees, and required course materials (e.g. room/board) are
  generally taxable per IRS Pub. 970 ch. 1, even with no W-2/1099 issued.
- Pennsylvania: flat 3.07% state income tax; no PA standard deduction.
- PA Tax Forgiveness (Schedule SP): real 100%-forgiveness eligibility-income
  ceilings encoded for 0–3 dependents, both Unmarried and Married tables
  (e.g. single/0 dependents ≤ $9,500; MFJ/2 dependents ≤ $35,500). A
  dependent full-time student generally cannot claim it unless their
  claiming parent also qualifies.
- PA Local Services Tax (LST): flat tax up to $52/year per worker, separate
  from the EIT; mandatory exemption when local earned income at that work
  location is under $12,000/year and the combined rate exceeds $10.
- PA local Earned Income Tax (EIT) rate varies by ~2,500 municipality/school
  district PSD codes and is intentionally never hardcoded — the engine
  always flags it as "investigate" with a link to the official PSD lookup
  tool, never asserts a specific local rate.

## What's intentionally NOT here yet

- PA Tax Forgiveness is encoded only through 3 dependents and only the
  100%-forgiveness ceiling (not the full 10%–90% partial-credit tiers above
  that income level) — a filer above the encoded ceiling correctly resolves
  to `does_not_apply` here even though a *partial* credit might still apply
  on the real sliding scale. Expanding this to the full tiered percentage
  table is the next refinement, not a blocker for the current demo personas.
- Child Tax Credit, Premium Tax Credit, itemized deductions, capital gains,
  rental income, multi-state apportionment, and AMT are not modeled.
- The actual local EIT *rate* and dependency tie-breaker rules (who claims a
  shared dependent) are out of scope — by design for EIT, as a gap for the
  dependency tie-breaker.
- No UI reads from this engine yet — see `app/assessment/page.tsx` for the
  current placeholder page it will eventually power.
