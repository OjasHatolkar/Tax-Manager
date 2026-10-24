import type { QuestionnaireAnswers, QuestionnaireStepDef } from "./types";

/**
 * Ordered list of possible steps. `isApplicable` determines which ones are
 * actually shown for a given user — this is what makes the questionnaire
 * "adaptive" per the product spec (Section 4 and Section 5 only appear when
 * relevant, instead of forcing every user through every screen).
 */
export const STEPS: QuestionnaireStepDef[] = [
  {
    id: "tax-year-location",
    title: "Tax year & location",
    description: "A few basics so we know which rules apply to you.",
    isApplicable: () => true,
  },
  {
    id: "personal-situation",
    title: "Personal situation",
    description: "This affects filing status and who can claim certain benefits.",
    isApplicable: () => true,
  },
  {
    id: "income",
    title: "Income",
    description: "The types and rough range of income you received.",
    isApplicable: () => true,
  },
  {
    id: "education",
    title: "Education",
    description: "Tuition, scholarships, and student loans.",
    isApplicable: (a: QuestionnaireAnswers) =>
      a.educationStatus === "full_time_student" ||
      a.educationStatus === "part_time_student" ||
      a.educationStatus === "graduated_this_year",
  },
  {
    id: "state-local",
    title: "State & local taxes",
    description: "Pennsylvania and local tax considerations, if relevant.",
    isApplicable: (a: QuestionnaireAnswers) =>
      a.residenceState === "PA" ||
      a.workLocation === "different_state" ||
      a.workLocation === "multiple_locations" ||
      a.livedInMultipleStates === "yes" ||
      a.livedInMultipleStates === "not_sure",
  },
  {
    id: "review",
    title: "Review",
    description: "Check your answers before seeing what may apply to you.",
    isApplicable: () => true,
  },
];

/** Steps actually shown for the given in-progress answers, in order. */
export function getApplicableSteps(
  answers: QuestionnaireAnswers
): QuestionnaireStepDef[] {
  return STEPS.filter((step) => step.isApplicable(answers));
}
