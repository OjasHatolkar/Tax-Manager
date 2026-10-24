# `lib/` — future application logic

This directory is intentionally empty of business logic in this first
milestone (landing page only). It is reserved so later phases can keep
concerns separated without restructuring the app:

- `lib/gemini/` — Gemini API client, prompt templates, and response
  validation/parsing for adaptive follow-up questions and plain-English
  explanations. Server-only; API keys must never be exposed to the client.
- `lib/auth/` — Auth0 session helpers and route protection utilities.
- `lib/rules/` — versioned, deterministic tax-topic and document rules
  (not AI-generated) that Gemini output is checked against, plus citations
  to official sources (IRS, PA Department of Revenue).
- `lib/types.ts` — shared TypeScript types for assessment answers, tax
  topics, and document checklist items, used by both the UI and the future
  rules/Gemini layers.

Nothing in this app currently calls an external AI service or performs
tax calculations.
