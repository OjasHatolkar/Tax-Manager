"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import type { QuestionnaireAnswers, QuestionnaireState } from "./types";
import { getApplicableSteps } from "./steps";

// Anonymous visitors keep using the original key, so existing saved data
// still loads. Signed-in users get their own key, based on their Auth0 id.
const BASE_KEY = "taxhelp.assessment.v1";
const ANON_KEY = BASE_KEY;

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
 * Drives the questionnaire wizard. Progress is saved to localStorage in this
 * browser only (it does not sync across devices). When signed in with Auth0,
 * progress is stored under that user's id; otherwise under an anonymous key.
 */
export function useQuestionnaire() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [storageKey, setStorageKey] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // 1. Work out which storage key to use (signed-in user or anonymous).
  useEffect(() => {
    let cancelled = false;
    async function resolveKey() {
      let key = ANON_KEY;
      try {
        const res = await fetch("/auth/profile", {
          cache: "no-store",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.sub === "string") {
            key = BASE_KEY + ".user." + data.sub;
          }
        }
      } catch {
        // Not signed in or unreachable: fall back to the anonymous key.
      }
      if (!cancelled) setStorageKey(key);
    }
    resolveKey();
    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Load saved progress once the key is known.
  useEffect(() => {
    if (!storageKey) return;
    try {
      let raw = window.localStorage.getItem(storageKey);
      // Signed in with no saved progress yet: adopt anonymous progress.
      if (!raw && storageKey !== ANON_KEY) {
        const anonRaw = window.localStorage.getItem(ANON_KEY);
        if (anonRaw) {
          raw = anonRaw;
          window.localStorage.setItem(storageKey, anonRaw);
          window.localStorage.removeItem(ANON_KEY);
        }
      }
      if (raw) {
        const parsed = JSON.parse(raw) as QuestionnaireState;
        dispatch({ type: "HYDRATE", state: parsed });
      }
    } catch {
      // Corrupt or inaccessible storage: safe to ignore, user just restarts.
    }
    setHydrated(true);
  }, [storageKey]);

  // 3. Save on every change, but only after loading has finished so the
  //    empty starting state can never overwrite real progress.
  useEffect(() => {
    if (!storageKey || !hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Storage full or disabled: questionnaire still works, just won't resume.
    }
  }, [state, storageKey, hydrated]);

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
      if (storageKey) window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    dispatch({ type: "RESET" });
  }, [storageKey]);

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
