/**
 * Core types for the Tax Help deterministic rules engine.
 *
 * Design goals (see README.md (this package) for the full write-up):
 *  - Rules are DATA, not code. Adding/adjusting a tax year's numbers means
 *    editing a file in rules/data/, not touching the evaluator.
 *  - Every rule set is versioned and carries citations to an official source.
 *  - Evaluation is three-valued (true / false / unknown) so that missing
 *    user-provided facts are tracked explicitly instead of silently
 *    defaulting to "no". Nothing is ever resolved by guessing.
 *  - The engine never emits "eligible" â€” only "may_apply" (possible,
 *    pending user's own verification), "does_not_apply", or "needs_info".
 */

/** Three-valued logic result. "unknown" means a required fact is missing. */
export type Tri = "true" | "false" | "unknown";

/** Supported filing statuses (subset relevant to the target users). */
export type FilingStatus =
  | "single"
  | "married_filing_jointly"
  | "married_filing_separately"
  | "head_of_household";

/**
 * The full set of facts the questionnaire can collect. Optional because the
 * assessment is incremental â€” any fact may legitimately be unanswered.
 * Add new facts here as the questionnaire grows; keep names stable since
 * rule data files reference them by key.
 */
export interface TaxFacts {
  filingStatus?: FilingStatus;
  isClaimedAsDependent?: boolean;
  age?: number;

  /** Modified adjusted gross income, in whole dollars. */
  magi?: number;

  hasW2Income?: boolean;
  hasFreelanceOrGigIncome?: boolean;
  netSelfEmploymentIncome?: number;

  isStudent?: boolean;
  isHalfTimeOrMoreStudent?: boolean;
  completedFirstFourYearsOfCollege?: boolean;
  priorYearsAotcClaimed?: number;
  hasFelonyDrugConviction?: boolean;
  paidTuitionOrEnrollmentFees?: boolean;
  qualifiedEducationExpenses?: number;
  receivedTaxFreeScholarship?: boolean;

  paidStudentLoanInterest?: boolean;
  studentLoanInterestPaid?: number;
  legallyObligatedOnStudentLoan?: boolean;

  contributedToRetirementAccount?: boolean;
  retirementContributionAmount?: number;
  wasFullTimeStudentDuringYear?: boolean;

  hasQualifyingChildren?: boolean;
  numberOfQualifyingChildren?: number;
  investmentIncome?: number;

  isPennsylvaniaResident?: boolean;
  workedOrLivedInPaLocalJurisdiction?: boolean;

  /** Earned income + net profits from the specific local (municipal/school
   * district) jurisdiction where the user works — used for the Local
   * Services Tax and local EIT low-income exemption tests. Not the same as
   * total MAGI (Act 32 defines "income from all sources" within the PSD). */
  localJurisdictionEarnedIncome?: number;

  /** Combined LST rate for the user's work-location PSD, in dollars/year.
   * Cannot be hardcoded (varies by municipality) — collected via the PA
   * municipal statistics lookup tool, if the user knows it. */
  localServicesTaxCombinedRate?: number;

  /** PA Schedule SP "eligibility income" — broader than PA taxable income;
   * includes nontaxable interest, alimony, gifts, scholarships not used for
   * tuition, etc. See PA Schedule SP instructions, Part C. */
  paEligibilityIncome?: number;
  numberOfDependents?: number;

  /** True if the user (or their parent/guardian who claims them) has
   * confirmed the parent qualifies for PA Tax Forgiveness — required for a
   * dependent student to claim Schedule SP themselves. */
  claimingParentQualifiesForPaTaxForgiveness?: boolean;

  /** Scholarship/grant money NOT used for tuition, fees, or required course
   * materials (e.g. used for room, board, or travel) — generally taxable
   * income per IRS Pub. 970, ch. 1. */
  nonQualifiedScholarshipAmount?: number;
}

/** A leaf condition comparing one fact to a value. */
export interface FactCondition {
  type: "fact";
  fact: keyof TaxFacts;
  op: "eq" | "neq" | "lt" | "lte" | "gt" | "gte" | "in" | "exists";
  value?: unknown;
}

/** Boolean combinators over sub-conditions. */
export interface AndCondition {
  type: "and";
  conditions: RuleCondition[];
}
export interface OrCondition {
  type: "or";
  conditions: RuleCondition[];
}
export interface NotCondition {
  type: "not";
  condition: RuleCondition;
}

export type RuleCondition = FactCondition | AndCondition | OrCondition | NotCondition;

/** A citation to an official, authoritative source backing a rule. */
export interface Citation {
  label: string;
  url: string;
}

/** A document the user may need to gather if a topic may apply. */
export interface DocumentRequirement {
  id: string;
  label: string;
  /** Plain-English note on why/when this document is needed. */
  note?: string;
}

/**
 * One topic the engine can evaluate, e.g. "Student Loan Interest Deduction".
 * `eligibilityCondition` must hold (true) for the topic to possibly apply.
 * `exceptionConditions` are hard bars checked first â€” if any is true, the
 * topic is a definite "does_not_apply" regardless of the main condition.
 */
export interface TopicRule {
  id: string;
  title: string;
  /** One sentence, plain English, shown to the user. */
  summary: string;
  category: "credit" | "deduction" | "filing_requirement" | "state_local";
  eligibilityCondition: RuleCondition;
  exceptionConditions?: RuleCondition[];
  requiredDocuments: DocumentRequirement[];
  citations: Citation[];
}

/** A full versioned rule set for a given tax year and jurisdiction. */
export interface RuleSet {
  id: string;
  jurisdiction: "federal" | "pennsylvania_state" | "pennsylvania_local";
  taxYear: number;
  /** Semantic version of this data file; bump on any numeric/logic change. */
  version: string;
  lastReviewed: string; // ISO date
  sourceCitations: Citation[];
  topics: TopicRule[];
}

export type TopicStatus = "may_apply" | "does_not_apply" | "needs_info";

export interface TopicEvaluation {
  topicId: string;
  title: string;
  summary: string;
  status: TopicStatus;
  /** Fact keys that, if answered, would let the engine reach a determination. */
  missingFacts: (keyof TaxFacts)[];
  requiredDocuments: DocumentRequirement[];
  citations: Citation[];
  ruleSetId: string;
  ruleSetVersion: string;
}
