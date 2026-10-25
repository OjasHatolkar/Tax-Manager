# `lib/` — application logic

- `lib/rules/` — **implemented.** A deterministic, versioned tax-rules
  engine. See `lib/rules/README.md` for the full design write-up. Nothing
  in here is AI-generated or AI-evaluated; it is plain TypeScript data and
  three-valued (true/false/unknown) logic, unit-tested against three
  hackathon scenarios (college student, student with a side hustle, recent
  graduate). Not yet wired into any UI — the questionnaire that produces
  `TaxFacts` objects is the next build step.
- `lib/gemini/` — server client configuration, fact validation, request and
  response types, and the adaptive follow-up client with deterministic
  fallback. API keys stay server-side. Rule evaluations are recomputed on
  the server before being provided as context to Gemini.
- `lib/auth/` — **not yet built.** Will hold Auth0 session helpers and
  route protection utilities.
- `lib/types.ts` — shared TypeScript types for assessment answers, tax
  topics, and document checklist items, used by both the UI and the
  rules/Gemini layers.

The questionnaire can call Gemini for adaptive follow-up wording. The rules
engine performs deterministic screening only — it is not a full tax-return
engine and never outputs a refund estimate.
