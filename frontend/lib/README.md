# Application logic

- `rules/` contains the deterministic, versioned tax-rule data and evaluation
  engine. It uses true/false/unknown facts so unanswered fields do not silently
  become false. The current rule data is limited and is not a tax-return engine.
- `questionnaire/mapToTaxFacts.ts` maps user-facing answers to the rules
  engine's facts and preserves unanswered values as unknown.
- `gemini/` contains server-side model configuration, fact validation, shared
  request/response types, and the browser client for adaptive follow-ups. The
  API routes recompute rule results on the server and validate model output.
- `api/request.ts` bounds and parses JSON route request bodies.
- `health/telemetry.ts` tracks aggregate per-process Gemini request counts,
  token usage, failures, latency, and best-effort rate limits. It is volatile,
  instance-local telemetry, not billing data or a production-wide quota store.
- `auth0.ts` configures the Auth0 SDK used by `proxy.ts`, auth routes, and the
  protected health endpoint.

The browser must never receive the Gemini API key. Gemini-generated text is
supporting language only; deterministic rule data controls the screening
results. The system does not guarantee eligibility, refunds, or savings.
