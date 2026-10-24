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

- **The follow-up question is NOT yet AI-generated.** `ResultsPanel.tsx`
  calls `lib/gemini/followUp.ts`, which currently returns a deterministic,
  rule-based question (picks whichever missing fact would resolve the most
  pending topics — see `rankMissingFacts` in `lib/rules/engine/`). The UI
  shows a visible "Placeholder — rule-based fallback" badge so this is
  never mistaken for real AI output. See `lib/gemini/followUp.ts`'s header
  comment for the exact steps to wire up real Gemini calls.
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

lib/gemini/                   ← teammate's integration area
├── types.ts                  Shared request/response shapes
└── followUp.ts                Deterministic fallback + wiring instructions

app/api/gemini/                ← teammate's integration area
├── follow-up/route.ts        Stub server route (501 until implemented)
└── explain/route.ts          Stub server route (501 until implemented)
```

## Next step for whoever owns Gemini

Everything needed to go from placeholder to real is isolated in
`lib/gemini/` and `app/api/gemini/` — see the header comment in
`lib/gemini/followUp.ts` for the exact 4-step plan. Nothing in
`components/questionnaire/` or `lib/rules/` needs to change.
