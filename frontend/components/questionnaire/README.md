# Questionnaire → Rules Engine → Follow-up pipeline

This is the guided assessment at `/assessment`. It's wired end to end:
questionnaire answers → rules engine evaluation → adaptive follow-up
question — but the AI piece is still a clearly-labeled placeholder (see
"What's a placeholder" below).

## What's real here

- A 6-step adaptive wizard (Tax Year & Location → Personal Situation →
  Income → Education* → State & Local* → Review). *Education and State &
  Local only appear when relevant (e.g. Education only shows for
  students/recent grads) — this is the "adaptive, not every user sees
  every screen" requirement from the product spec.
- Answers persist to `localStorage` only, so refreshing the page doesn't
  lose progress during a demo.
- The Review step runs live: it maps answers into `lib/rules/`'s `TaxFacts`
  shape and shows real evaluation results (`may_apply` / `needs_info` /
  `does_not_apply`) with citations and a document checklist — see
  `ResultsPanel.tsx`.
- Fully keyboard-accessible radio/checkbox groups, visible focus states,
  semantic `<fieldset>`/`<legend>` markup.

## What's a placeholder (by design)

- The adaptive follow-up tries Gemini to phrase a question for one of the
  rules engine's missing facts. If Gemini is unavailable, the UI uses a
  deterministic rule-based question and labels it as a fallback.
- No document upload yet (deferred per the product spec's own MVP
  recommendation).
- No account-linked save/resume — `localStorage` is a temporary stand-in
  until Auth0 exists.

## How the pieces connect

```
components/questionnaire/types.ts       (QuestionnaireAnswers — UI-facing)
              │
              ▼  lib/questionnaire/mapToTaxFacts.ts
              │
lib/rules/types.ts                      (TaxFacts — rules-engine-facing)
              │
              ▼  lib/rules/engine/evaluateTopic.ts, missingFacts.ts
              │
TopicEvaluation[]  ──────────────►  components/questionnaire/ResultsPanel.tsx
              │                                   │
              ▼                                   ▼
   lib/gemini/followUp.ts            (renders checklist, topics, citations)
   (deterministic fallback today;
    real Gemini call = next step)
```

Each layer only imports from the one below it — the questionnaire UI never
reaches into rule internals directly, and the rules engine has zero
knowledge of React/Next. Swap any one layer without touching the others.

## Files

```
components/questionnaire/
├── types.ts                 Answer + step type definitions
├── steps.ts                 Step order + conditional "isApplicable" logic
├── useQuestionnaire.ts       State (useReducer) + localStorage persistence
├── Questionnaire.tsx         Top-level wizard controller
├── ProgressBar.tsx
├── QuestionField.tsx         Reusable single/multi-select question UI
├── reviewLabels.ts           Human-readable labels for the Review step
├── ResultsPanel.tsx          Runs rules engine + follow-up, renders results
└── steps/
    ├── TaxYearLocationStep.tsx
    ├── PersonalSituationStep.tsx
    ├── IncomeStep.tsx
    ├── EducationStep.tsx
    ├── StateLocalStep.tsx
    └── ReviewStep.tsx

lib/questionnaire/
└── mapToTaxFacts.ts          Bridges QuestionnaireAnswers -> TaxFacts

lib/gemini/                   Gemini client, validation, and fallback
├── types.ts                  Shared request/response shapes
└── followUp.ts               Adaptive API call + deterministic fallback

app/api/gemini/
├── adaptive-follow-up/route.ts  Structured adaptive question endpoint
├── ask/route.ts                 Q&A endpoint alias
├── follow-up/route.ts           Q&A endpoint
└── explain/route.ts             Structured topic explanation endpoint
```

Gemini API keys must be kept in server-only environment variables. The
server recomputes evaluations from validated facts; client-supplied rule
results are not treated as authoritative.
