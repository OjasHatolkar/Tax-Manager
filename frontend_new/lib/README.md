# `lib/` — application logic

- `lib/rules/` — **implemented.** A deterministic, versioned tax-rules
  engine. See `lib/rules/README.md` for the full design write-up. Nothing
  in here is AI-generated or AI-evaluated; it is plain TypeScript data and
  three-valued (true/false/unknown) logic, unit-tested against three
  hackathon scenarios (college student, student with a side hustle, recent
  graduate). Not yet wired into any UI — the questionnaire that produces
  `TaxFacts` objects is the next build step.
- `lib/gemini/` — **not yet built.** Will hold the Gemini API client,
  prompt templates, and response validation for adaptive follow-up
  questions and plain-English explanations. Server-only; API keys must
  never be exposed to the client. Per product requirement, Gemini output
  will always be checked against `lib/rules/` and never asserts eligibility
  on its own.
- `lib/auth/` — **not yet built.** Will hold Auth0 session helpers and
  route protection utilities.
- `lib/types.ts` — shared TypeScript types for assessment answers, tax
  topics, and document checklist items, used by both the UI and the
  rules/Gemini layers.

Nothing in this app currently calls an external AI service. The rules
engine performs supported deterministic calculations and eligibility
screening only — it is not a full tax-return engine and never outputs a
refund estimate.
