# Taxpertise

Taxpertise is a Next.js app that collects a small set of tax facts, evaluates
versioned deterministic rules, and uses Gemini for bounded explanations and
adaptive follow-up questions. It is an educational aid, not tax preparation or
professional tax advice. The rule data currently supports the 2025 tax year.

## Requirements and setup

- Node.js 20.9 or newer (required by Next.js 16)
- npm
- Auth0 application settings for sign-in and account-specific browser storage
- A Gemini API key for real AI responses

```powershell
Copy-Item .env.example .env.local
# Fill in the values described below, then:
npm install
npm run dev
```

Open <http://localhost:3000>. `/sign-up` starts Auth0 Universal Login in signup
mode; `/sign-in` starts login and returns to the assessment. Set the Auth0
application's Allowed Callback URLs to `http://localhost:3000/auth/callback`,
Allowed Logout URLs to `http://localhost:3000`, and Allowed Web Origins to
`http://localhost:3000`.

## Environment

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Server-only Google Gemini API key. Never use a `NEXT_PUBLIC_` prefix. |
| `GEMINI_API_MODEL` | Server-only Gemini model ID. |
| `AUTH0_DOMAIN` | Auth0 tenant host, without `https://`. |
| `AUTH0_CLIENT_ID` | Auth0 application client ID. |
| `AUTH0_CLIENT_SECRET` | Auth0 application client secret. |
| `AUTH0_SECRET` | Random secret used to encrypt Auth0 session cookies. |
| `APP_BASE_URL` | App origin, e.g. `http://localhost:3000`. |

Copy `.env.example` to `.env.local`; never commit `.env.local`. Auth0 sessions
are required for the health metrics API. Any authenticated user in the configured
Auth0 tenant can view the aggregate metrics at `/health`.

## Main routes and behavior

- `/` — product landing page and privacy explanation.
- `/assessment` — adaptive questionnaire. Progress is stored in browser
  `localStorage`, in a key scoped to the Auth0 profile when signed in; it is not
  synchronized to a server account.
- `/tasks` — signed-in users can review, complete, reopen, and delete topic
  tasks. Tasks are saved in browser `localStorage` under the Auth0 profile ID,
  so they survive logout/login in that browser but do not sync across devices.
- `/api/gemini/adaptive-follow-up` — returns one structured question about a
  missing fact selected by the deterministic rules engine. The assessment
  accepts up to three answers and then requests personalized guidance.
- `/api/gemini/explain` — returns structured plain-language guidance based on
  questionnaire and follow-up answers.
- `/api/gemini/follow-up` and `/api/gemini/ask` — contextual question and answer.
- `/health` and `/api/health` — authenticated, process-local aggregate Gemini
  request, token, failure, and latency telemetry. These counters reset on
  restart and are not a billing balance or shared across app instances.

The browser sends only validated facts to Gemini routes. The server validates
the facts and recomputes rule evaluations; it does not trust client-provided
results. Gemini may phrase a question or explanation, while the deterministic
rules remain authoritative. A rule-based follow-up is shown if Gemini fails.
API routes limit request bodies and apply a best-effort per-process rate limit.

The current rule engine is deliberately limited. Confirm eligibility and tax
filing decisions with official IRS/state resources or a qualified preparer.

## Checks

```powershell
npm run typecheck
npm run lint
npm run test:unit
npm run test:rules
npm run build
```

`npm test` runs typecheck, lint, unit tests, and deterministic tax-rule
scenarios. `npm run test:e2e` additionally runs the browser tests. The browser
suite needs Chromium (`npx playwright install chromium`), a configured Auth0
test tenant, `E2E_AUTH0_EMAIL` and `E2E_AUTH0_PASSWORD` for a dedicated verified
test user, and a working Gemini key. The authenticated browser test requires a
real Gemini-generated result and does not mock the API. See
[`tests/e2e/README.md`](tests/e2e/README.md).

## Source layout

- `app/` — pages and server API routes.
- `components/questionnaire/` — wizard, question controls, persistence, and
  review/results UI.
- `lib/rules/` — versioned rules and three-valued evaluation logic.
- `lib/gemini/` — server client, input validation, and adaptive follow-up.
- `lib/health/` — aggregate in-memory telemetry and request rate limiting.
- `lib/questionnaire/` — questionnaire-to-tax-facts mapping.
- `tests/` — unit, tax-rule scenario, and Playwright browser tests.
