"use client";

import { useCallback, useEffect, useReducer } from "react";
import type { QuestionnaireAnswers, QuestionnaireState } from "./types";
import { getApplicableSteps } from "./steps";

const STORAGE_KEY = "taxhelp.assessment.v1";

type Action =
  | { type: "SET_ANSWER"; field: keyof QuestionnaireAnswers; value: unknown }
  | { type: "GO_NEXT" }
  | { type: "GO_BACK" }
  | { type: "GO_TO"; index: number }
  | { type: "RESET" }
  | { type: "HYDRATE"; state: QuestionnaireState };

const initialState: QuestionnaireState = {
  answers: {},
  sources: {},
  currentStepIndex: 0,
};

function reducer(state: QuestionnaireState, action: Action): QuestionnaireState {
  switch (action.type) {
    case "SET_ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.field]: action.value },
        sources: { ...state.sources, [action.field]: "user_entered" },
      };
    case "GO_NEXT": {
      const applicable = getApplicableSteps(state.answers);
      const next = Math.min(state.currentStepIndex + 1, applicable.length - 1);
      return { ...state, currentStepIndex: next };
    }
    case "GO_BACK":
      return { ...state, currentStepIndex: Math.max(state.currentStepIndex - 1, 0) };
    case "GO_TO":
      return { ...state, currentStepIndex: action.index };
    case "RESET":
      return initialState;
    case "HYDRATE":
      return action.state;
    default:
      return state;
  }
}

/**
 * Drives the questionnaire wizard. Progress is persisted to localStorage
 * only — this is a clearly temporary stand-in for real account-linked
 * save/resume, which requires Auth0 (not yet implemented). See
 * components/questionnaire/README.md.
 */
export function useQuestionnaire() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from localStorage once, on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as QuestionnaireState;
        dispatch({ type: "HYDRATE", state: parsed });
      }
    } catch {
      // Corrupt or inaccessible storage — safe to ignore, user just restarts.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on every change.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or disabled — questionnaire still works, just won't resume.
    }
  }, [state]);

  const setAnswer = useCallback(
    (field: keyof QuestionnaireAnswers, value: unknown) =>
      dispatch({ type: "SET_ANSWER", field, value }),
    []
  );

  const goNext = useCallback(() => dispatch({ type: "GO_NEXT" }), []);
  const goBack = useCallback(() => dispatch({ type: "GO_BACK" }), []);
  const goTo = useCallback((index: number) => dispatch({ type: "GO_TO", index }), []);
  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    dispatch({ type: "RESET" });
  }, []);

  const steps = getApplicableSteps(state.answers);
  const currentStep = steps[Math.min(state.currentStepIndex, steps.length - 1)];

  return {
    answers: state.answers,
    steps,
    currentStep,
    currentStepIndex: Math.min(state.currentStepIndex, steps.length - 1),
    setAnswer,
    goNext,
    goBack,
    goTo,
    reset,
  };
}
