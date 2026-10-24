/**
 * Types for the guided assessment questionnaire (frontend only).
 *
 * Field names deliberately mirror `lib/rules/types.ts`'s `TaxFacts` so that
 * wiring this questionnaire's answers into the rules engine later is a
 * straightforward mapping, not a redesign. This file does NOT import from
 * lib/rules — the questionnaire UI and the rules engine stay decoupled so
 * either can be built, tested, and changed independently.
 */

export type FilingStatus =
  | "single"
  | "married_filing_jointly"
  | "married_filing_separately"
  | "head_of_household"
  | "not_sure";

export type YesNoUnsure = "yes" | "no" | "not_sure";

/**
 * Everything the questionnaire can collect. Every field is optional —
 * the assessment is adaptive and a user may never be asked a given
 * question if it isn't relevant to their path.
 */
export interface QuestionnaireAnswers {
  // --- Section 1: Tax Year & Location ---
  taxYear?: "2025" | "2026_planning" | "other";
  residenceState?: string; // e.g. "PA", or "outside_us"
  livedInMultipleStates?: YesNoUnsure;
  workLocation?:
    | "same_state_as_residence"
    | "different_state"
    | "multiple_locations"
    | "remote"
    | "self_employed"
    | "did_not_work";

  // --- Section 2: Personal Situation ---
  ageRange?: "under_18" | "18_24" | "25_64" | "65_plus";
  educationStatus?:
    | "full_time_student"
    | "part_time_student"
    | "graduated_this_year"
    | "not_a_student";
  couldBeClaimedAsDependent?: YesNoUnsure;
  filingStatus?: FilingStatus;

  // --- Section 3: Income ---
  incomeTypes?: Array<
    | "w2"
    | "freelance_gig"
    | "self_employment"
    | "investment"
    | "unemployment"
    | "rental"
    | "other"
    | "none"
  >;
  incomeRange?: "under_15k" | "15k_40k" | "40k_75k" | "over_75k" | "not_sure";
  hasIncomeDocuments?: "all" | "some" | "none_yet" | "not_sure_which";

  // --- Section 4: Education (shown conditionally) ---
  paidTuitionOrEducationExpenses?: YesNoUnsure;
  receivedScholarshipOrGrant?: YesNoUnsure;
  paidStudentLoanInterest?: YesNoUnsure;

  // --- Section 5: State & Local Taxes (shown conditionally) ---
  mayHaveLocalIncomeTax?: YesNoUnsure;
  localTaxesWithheld?: "yes" | "no" | "not_sure" | "no_paycheck";
}

/** Tracks where a fact came from — required groundwork for later document
 * upload / prior-year-return extraction, per the product spec. Only
 * "user_entered" is produced by this questionnaire today. */
export type FactSource =
  | "user_entered"
  | "extracted_current_year_document"
  | "extracted_prior_year_document"
  | "calculated"
  | "unconfirmed";

export interface QuestionnaireState {
  answers: QuestionnaireAnswers;
  /** Per-field provenance; defaults to "user_entered" once a field is set. */
  sources: Partial<Record<keyof QuestionnaireAnswers, FactSource>>;
  currentStepIndex: number;
}

/** One screen in the wizard. */
export interface QuestionnaireStepDef {
  id: string;
  title: string;
  description: string;
  /** Whether this step should be shown, given answers so far. Sections the
   * spec calls conditional (Education, State & Local) return false unless
   * relevant — this is the "adaptive, not every user sees every section"
   * requirement from the product spec. */
  isApplicable: (answers: QuestionnaireAnswers) => boolean;
}
