# Tax Help code audit

**Date:** 2026-10-25  
**Scope:** frontend application, Gemini API routes, questionnaire/rules wiring,
Auth0 integration, dependency configuration, telemetry, and automated checks.

## Outcome

The frontend passes typechecking, ESLint, unit tests, deterministic tax-rule
scenarios, the local Auth0 signup-redirect test, and a production Next.js build.
`npm audit` reports zero known vulnerabilities. The authenticated browser flow
through Auth0, the questionnaire, and a live Gemini response remains unverified
because dedicated E2E Auth0 credentials are not configured.

## Findings addressed

- **Dependency/security:** Updated the frontend to Next.js 16, React 19, Tailwind
  4, TypeScript 6, and compatible ESLint 9; migrated middleware to `proxy.ts`,
  ESLint to flat config, and Tailwind to its v4 PostCSS plugin and CSS import.
  Regenerated the lockfile. `npm audit` reports zero vulnerabilities.
- **Incorrect fact assumptions:** Unanswered student and Pennsylvania residence
  facts now remain unknown in the rules input instead of being treated as false.
- **Questionnaire semantics:** Filing status choices now distinguish married
  filing separately from head of household. The dependency question asks
  whether someone will actually claim the user. A legacy answer whose meaning
  changed is discarded during local-storage migration.
- **Input selection:** “No income” is exclusive in the income multi-select.
- **Tax-year scope:** Results are only displayed for 2025; unsupported years no
  longer receive misleading 2025 rule results.
- **Gemini wiring and boundaries:** The questionnaire calls the structured
  adaptive-follow-up endpoint. Server routes validate and size-limit JSON,
  allowlist facts, recompute rules server-side, constrain model output, return
  error statuses on failures, and use a deterministic follow-up fallback.
- **Operational visibility:** Added authenticated `/health` aggregate Gemini
  telemetry. It reports request counts, tokens, failures, and latency; token
  totals fall back to input plus output counts if Gemini omits its combined
  count. No extra `HEALTH_ADMIN_SUB` is required.
- **Signup path and tests:** Added `/sign-up`, which opens Auth0 Universal Login
  in signup mode, and browser tests for that redirect and the full questionnaire
  plus Gemini response. Updated stale project documentation.

## Remaining operational limits

- **Auth0 tenant configuration:** A hosted Auth0 attempt returned “Callback URL
  mismatch.” The local configuration now sets `APP_BASE_URL=http://localhost:3000`
  and Playwright uses that host. In the Auth0 application's settings, allow
  `http://localhost:3000/auth/callback` as a callback URL,
  `http://localhost:3000` as a logout URL, and `http://localhost:3000` as a web
  origin. The local E2E test verifies the generated authorization redirect but
  does not authenticate against Auth0.
- **Live Gemini E2E:** The full signed-in assessment test was skipped because
  `E2E_AUTH0_EMAIL` and `E2E_AUTH0_PASSWORD` were unavailable. That test also
  requires a working Gemini API key and configured model. Unit tests exercise
  validation, fallback, route rejection, rate limiting, and telemetry without
  making billable provider calls.
- **Rate limiting:** The Gemini rate limiter is in-memory and process-local;
  forwarded-IP handling depends on the deployment proxy. Use a trusted shared
  limiter (and trusted client-IP headers) for production-wide enforcement.
- **Health metrics:** Telemetry resets on process restart and is not shared
  between app instances. It is not authoritative billing or credit data. Any
  authenticated Auth0 account can view the aggregates.
- **Tax rules:** The rules engine is a limited 2025 screening aid, not a tax
  return calculator. Some state/local rules are simplified and users must
  verify relevant rules and eligibility with official sources or a tax
  professional. The root `rules-engine/` package and `frontend/lib/rules/` are
  separate copies that can drift; apply rule changes to both until they are
  consolidated into a shared package.
- **Questionnaire persistence:** Answers remain in browser `localStorage`; they
  are not encrypted by this app or synchronized to an account server.
- **Clean-install check:** `npm ci` encountered `EPERM` while replacing a
  Windows native dependency held open by a running Node process. `npm install`
  recovered the dependency tree; `npm ls --depth=0` then showed all declared
  packages installed. Avoid force-stopping a developer's active server to
  remove a locked native module.

## Verification run

- `npm test` — passed: typecheck, lint, 12 unit tests, and deterministic rule
  scenarios (12 scenario assertions plus 9 additional topic checks).
- `npm run test:e2e` — passed: Auth0 signup authorization redirect; skipped the
  credential-gated authenticated questionnaire-to-Gemini flow.
- `npm test --prefix rules-engine` — passed: standalone rule scenario suite.
- `npm run build` — passed with Next.js 16.4.3.
- `npm audit` — passed with zero reported vulnerabilities.
- `npm ls --depth=0` — all declared frontend dependencies installed.
