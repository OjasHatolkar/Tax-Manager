# Standalone tax rules engine

This directory is a standalone package containing a deterministic, versioned
screening engine for selected 2025 U.S. federal and Pennsylvania tax topics. It
does not include UI, Auth0, Gemini, or tax-return preparation.

Rules are data under `rules/data/`; `rules/engine/` evaluates those rules with
three-valued logic (`true`, `false`, `unknown`). Missing facts remain unknown
and produce `needs_info` instead of an assumed negative answer. Results are
limited to `may_apply`, `does_not_apply`, and `needs_info`, with citations.

## Run scenarios

```powershell
npm install
npm test
```

The scenario script runs 21 behavioral assertions across student, side-hustle,
recent-graduate, Pennsylvania, and selected federal credit examples.

## Relationship to the web app

The active Next.js app is in `frontend/`. It currently contains a separate copy
of these rules under `frontend/lib/rules/`; the frontend runs its own scenarios
as part of `npm test`. The copies can drift, so rule changes should be applied
to both and both suites should be run until the logic is consolidated into a
shared workspace package.

## Known limits

The rule data is a screening aid, not a tax determination. Pennsylvania Tax
Forgiveness implements the 100%-forgiveness ceiling but not partial-credit
tiers above it. Child Tax Credit, Premium Tax Credit, itemized deductions,
capital gains, rental income, multi-state apportionment, AMT, and specific
local Earned Income Tax rates are not modeled. Verify rules for the relevant
filing year against the cited official sources before relying on them.
