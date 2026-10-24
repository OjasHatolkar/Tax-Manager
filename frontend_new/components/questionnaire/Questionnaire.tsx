"use client";

import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { useQuestionnaire } from "./useQuestionnaire";
import ProgressBar from "./ProgressBar";
import ResultsPanel from "./ResultsPanel";
import Button from "@/components/ui/Button";
import TaxYearLocationStep from "./steps/TaxYearLocationStep";
import PersonalSituationStep from "./steps/PersonalSituationStep";
import IncomeStep from "./steps/IncomeStep";
import EducationStep from "./steps/EducationStep";
import StateLocalStep from "./steps/StateLocalStep";
import ReviewStep from "./steps/ReviewStep";

/**
 * Top-level controller for the guided assessment. This file intentionally
 * contains very little logic of its own — state lives in useQuestionnaire,
 * step content lives in steps/*.tsx, and results come from ResultsPanel
 * (which calls the rules engine + the Gemini placeholder). Swap any one of
 * those out without touching this file.
 */
export default function Questionnaire() {
  const { answers, steps, currentStep, currentStepIndex, setAnswer, goNext, goBack, reset } =
    useQuestionnaire();

  if (!currentStep) {
    return null; // steps is never empty in practice; guards TypeScript + hydration edge case
  }

  const isFirstStep = currentStepIndex === 0;
  const isReviewStep = currentStep.id === "review";

  function renderStep() {
    switch (currentStep!.id) {
      case "tax-year-location":
        return <TaxYearLocationStep answers={answers} setAnswer={setAnswer} />;
      case "personal-situation":
        return <PersonalSituationStep answers={answers} setAnswer={setAnswer} />;
      case "income":
        return <IncomeStep answers={answers} setAnswer={setAnswer} />;
      case "education":
        return <EducationStep answers={answers} setAnswer={setAnswer} />;
      case "state-local":
        return <StateLocalStep answers={answers} setAnswer={setAnswer} />;
      case "review":
        return <ReviewStep answers={answers} />;
      default:
        return null;
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <ProgressBar
        currentIndex={currentStepIndex}
        totalSteps={steps.length}
        stepLabels={steps.map((s) => s.title)}
      />

      <div className="mt-8 rounded-2xl border border-forest-100 bg-white p-6 shadow-card sm:p-8">
        <h2 className="text-xl font-semibold text-ink-900">{currentStep.title}</h2>
        <p className="mt-1 text-sm text-ink-600">{currentStep.description}</p>

        <div className="mt-2">{renderStep()}</div>

        {isReviewStep && <ResultsPanel answers={answers} />}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={isFirstStep ? reset : goBack}
          aria-label={isFirstStep ? "Start over" : "Go back to the previous step"}
        >
          {isFirstStep ? (
            <>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Start over
            </>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </>
          )}
        </Button>

        {!isReviewStep && (
          <Button variant="primary" size="sm" onClick={goNext}>
            Next
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-ink-500">
        Your progress is saved only in this browser (localStorage) for now —
        not to an account. Account-linked save &amp; resume requires sign-in,
        which is not yet implemented.
      </p>
    </div>
  );
}
