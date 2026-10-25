# Questionnaire and results flow

`Questionnaire.tsx` renders the step wizard at `/assessment`. The screen order
and conditional steps live in `steps.ts`: Education appears for students and
recent graduates; State & Local appears for Pennsylvania residents or users
whose answers indicate multi-state work or residence.

## State and persistence

`useQuestionnaire.ts` owns reducer state and writes answers to browser
`localStorage`. Signed-in users get a key based on their Auth0 profile ID;
anonymous answers use the legacy anonymous key. When a user signs in for the
first time, anonymous answers are adopted into the profile key. Data stays in
that browser and is not server-synced. A legacy dependency answer with changed
meaning is discarded during hydration so the user can answer the new question.

`QuestionField.tsx` provides accessible radio and checkbox groups. The
multi-select "No income" option excludes other income choices.

## Results and Gemini

`mapToTaxFacts.ts` converts coarse questionnaire answers into rules-engine facts
without guessing exact values that were not collected. `ResultsPanel.tsx` runs
the deterministic rules for the supported 2025 tax year, displays citations and
document requirements, and starts a structured adaptive follow-up loop with
`/api/gemini/adaptive-follow-up`. The user can answer each question using a
typed control; answers update the rule evaluation and are sent with the next
request. At most three facts are requested before `/api/gemini/explain` returns
personalized guidance. Signed-in users can select evaluated topics to save as
individual tasks. Tasks are scoped to the Auth0 profile in this browser's local
storage; they are not synced to a server or across devices. Gemini can only
select and phrase a supported missing fact that the server-side rules engine
marked missing. Invalid or unavailable question output falls back to
deterministic question copy.

Other server endpoints provide contextual Q&A (`/api/gemini/ask` and its
`/api/gemini/follow-up` alias) and structured explanations
(`/api/gemini/explain`). The Gemini key stays on the server. Request facts are
allowlisted and rule evaluations are rebuilt server-side.

## Files

- `types.ts` — answer, state, provenance, and step types.
- `steps.ts` — ordered step definitions and applicability predicates.
- `useQuestionnaire.ts` — reducer, Auth0 profile lookup, persistence, and
  legacy answer migration.
- `Questionnaire.tsx` — top-level step routing and navigation controls.
- `ProgressBar.tsx` — current-step progress and labels.
- `QuestionField.tsx` — reusable accessible radio/checkbox fields.
- `reviewLabels.ts` — user-facing answer labels for the review summary.
- `ResultsPanel.tsx` — deterministic rule results, bounded follow-up answers,
  and personalized Gemini guidance.
- `../tasks/TaskDashboard.tsx` — signed-in users' saved topic tasks.
- `steps/*.tsx` — individual tax year/location, personal, income, education,
  state/local, and review screens.
- `../../lib/questionnaire/mapToTaxFacts.ts` — bridge to the tax-rules model.

See `../../tests/unit.test.ts` and `../../tests/e2e/` for unit and browser
coverage.
