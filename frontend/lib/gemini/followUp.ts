/**
 * ============================================================================
 * Gemini-backed adaptive follow-up questions with a deterministic fallback.
 * ============================================================================
 *
 * The adaptive route may only select a fact ranked as missing by the rules
 * engine. The API key stays on the server, and all failures use the
 * deterministic question so the questionnaire remains available.
 *
 * IMPORTANT: Gemini must only ever choose WHICH known-missing fact to ask
 * about and HOW to phrase it. It must never invent a new tax rule, a new
 * eligibility condition, or a dollar figure — those come only from
 * lib/rules/. This keeps AI output "grounded," per the hackathon's Gemini
 * judging criteria.
 * ============================================================================
 */

import type { FollowUpQuestion, FollowUpRequest } from "./types";
import { rankMissingFacts } from "@/lib/rules/engine/missingFacts";
import type { TaxFacts } from "@/lib/rules/types";

export const MAX_ADAPTIVE_QUESTIONS = 3;

export type FollowUpInputSpec =
  | { kind: "boolean"; label: string }
  | { kind: "number"; label: string; unit: "dollars" | "count" | "years" }
  | { kind: "filingStatus"; label: string };

/** Only facts with a clear, bounded answer control can enter the interactive loop. */
export const FOLLOW_UP_INPUTS: Record<keyof TaxFacts, FollowUpInputSpec> = {
  filingStatus: { kind: "filingStatus", label: "Filing status" },
  isClaimedAsDependent: { kind: "boolean", label: "Could someone claim you as a dependent?" },
  age: { kind: "number", label: "Age", unit: "years" },
  magi: { kind: "number", label: "Modified adjusted gross income (MAGI)", unit: "dollars" },
  hasW2Income: { kind: "boolean", label: "Did you have W-2 income?" },
  hasFreelanceOrGigIncome: { kind: "boolean", label: "Did you have freelance, gig, or self-employment income?" },
  netSelfEmploymentIncome: { kind: "number", label: "Net self-employment income", unit: "dollars" },
  isStudent: { kind: "boolean", label: "Were you a student during the tax year?" },
  isHalfTimeOrMoreStudent: { kind: "boolean", label: "Were you enrolled at least half time?" },
  completedFirstFourYearsOfCollege: { kind: "boolean", label: "Had you completed the first four years of college?" },
  priorYearsAotcClaimed: { kind: "number", label: "Prior years you claimed the American Opportunity Tax Credit", unit: "count" },
  hasFelonyDrugConviction: { kind: "boolean", label: "Did you have a prior felony drug conviction?" },
  paidTuitionOrEnrollmentFees: { kind: "boolean", label: "Did you pay tuition or enrollment fees?" },
  qualifiedEducationExpenses: { kind: "number", label: "Qualified education expenses", unit: "dollars" },
  receivedTaxFreeScholarship: { kind: "boolean", label: "Did you receive a tax-free scholarship or grant?" },
  paidStudentLoanInterest: { kind: "boolean", label: "Did you pay student loan interest?" },
  studentLoanInterestPaid: { kind: "number", label: "Student loan interest paid", unit: "dollars" },
  legallyObligatedOnStudentLoan: { kind: "boolean", label: "Were you legally obligated to repay the student loan?" },
  contributedToRetirementAccount: { kind: "boolean", label: "Did you contribute to a retirement account?" },
  retirementContributionAmount: { kind: "number", label: "Retirement account contributions", unit: "dollars" },
  wasFullTimeStudentDuringYear: { kind: "boolean", label: "Were you a full-time student during the year?" },
  hasQualifyingChildren: { kind: "boolean", label: "Did you have qualifying children?" },
  numberOfQualifyingChildren: { kind: "number", label: "Number of qualifying children", unit: "count" },
  investmentIncome: { kind: "number", label: "Investment income", unit: "dollars" },
  isPennsylvaniaResident: { kind: "boolean", label: "Were you a Pennsylvania resident?" },
  workedOrLivedInPaLocalJurisdiction: { kind: "boolean", label: "Did you work or live in a Pennsylvania local tax jurisdiction?" },
  localJurisdictionEarnedIncome: { kind: "number", label: "Earned income in that local jurisdiction", unit: "dollars" },
  localServicesTaxCombinedRate: { kind: "number", label: "Combined local services tax rate", unit: "dollars" },
  paEligibilityIncome: { kind: "number", label: "Pennsylvania eligibility income", unit: "dollars" },
  numberOfDependents: { kind: "number", label: "Number of dependents", unit: "count" },
  claimingParentQualifiesForPaTaxForgiveness: { kind: "boolean", label: "Does the claiming parent qualify for Pennsylvania Tax Forgiveness?" },
  nonQualifiedScholarshipAmount: { kind: "number", label: "Scholarship amount not used for qualified expenses", unit: "dollars" },
};

export function parseFollowUpAnswer(fact: keyof TaxFacts, raw: string): string | number | boolean | null {
  if (raw === "not_sure") return null;
  const spec = FOLLOW_UP_INPUTS[fact];
  if (spec.kind === "boolean") return raw === "yes" ? true : raw === "no" ? false : null;
  if (spec.kind === "filingStatus") {
    return ["single", "married_filing_jointly", "married_filing_separately", "head_of_household"].includes(raw) ? raw : null;
  }
  if (!/^-?\d{1,9}(?:\.\d{1,2})?$/.test(raw)) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || Math.abs(value) > 1_000_000_000) return null;
  if (spec.unit !== "dollars" && !Number.isInteger(value)) return null;
  if (spec.unit === "count" && value < 0) return null;
  if (spec.unit === "years" && (value < 0 || value > 120)) return null;
  return value;
}

export function followUpAnswerLabel(fact: keyof TaxFacts, raw: string): string {
  if (raw === "not_sure") return "Not sure";
  const spec = FOLLOW_UP_INPUTS[fact];
  if (spec.kind === "boolean") return raw === "yes" ? "Yes" : "No";
  if (spec.kind === "filingStatus") return raw.replaceAll("_", " ");
  return `${raw}${spec.unit === "dollars" ? " dollars" : spec.unit === "years" ? " years" : ""}`;
}

const FACT_QUESTION_COPY: Partial<
  Record<keyof FollowUpRequest["facts"], { question: string; rationale: string }>
> = {
  filingStatus: {
    question: "What was your filing status at the end of the tax year?",
    rationale:
      "Several credits and the Pennsylvania Tax Forgiveness income limits depend on filing status.",
  },
  magi: {
    question: "Roughly what was your modified adjusted gross income (MAGI) for the year?",
    rationale:
      "Education credits and the student loan interest deduction phase out at specific MAGI ranges.",
  },
  isClaimedAsDependent: {
    question: "Could someone else claim you as a dependent on their return?",
    rationale:
      "Dependency status changes who — if anyone — can claim certain credits, including for scholarships.",
  },
  paEligibilityIncome: {
    question: "What was your total income from all sources, including nontaxable income?",
    rationale:
      "Pennsylvania Tax Forgiveness uses a broader 'eligibility income' figure than federal taxable income.",
  },
  localJurisdictionEarnedIncome: {
    question: "About how much did you earn specifically while working in that local jurisdiction?",
    rationale:
      "Local Earned Income Tax and the Local Services Tax low-income exemption are based on local earnings.",
  },
};

/**
 * Deterministic, non-AI fallback: picks the single missing fact that would
 * unblock the most topics (via the rules engine's own ranking) and returns
 * a plain-English question for it. Always available, even with Gemini
 * fully wired up, as a safety net for API failures.
 */
export function deterministicFollowUp(request: FollowUpRequest): FollowUpQuestion | null {
  const excluded = new Set(request.excludedFacts ?? []);
  const ranked = rankMissingFacts(request.evaluations).filter(({ fact }) => !excluded.has(fact) && fact in FOLLOW_UP_INPUTS);
  if (ranked.length === 0) return null;

  const top = ranked[0];
  if (!top) return null;

  const copy = FACT_QUESTION_COPY[top.fact];
  return {
    targetFact: top.fact,
    question: copy?.question ?? `Could you provide: ${String(top.fact)}?`,
    rationale:
      copy?.rationale ??
      `This affects ${top.blocksTopics.length} topic(s) we're still unsure about.`,
    source: "deterministic_fallback",
  };
}

/**
 * Public entry point called by the questionnaire UI.
 */
export async function getAdaptiveFollowUp(
  request: FollowUpRequest,
  signal?: AbortSignal
): Promise<FollowUpQuestion | null> {
  const fallback = deterministicFollowUp(request);
  if (!fallback) return null;

  const allowedFacts = new Set(rankMissingFacts(request.evaluations)
    .filter(({ fact }) => !(request.excludedFacts ?? []).includes(fact) && fact in FOLLOW_UP_INPUTS)
    .map(({ fact }) => fact));
  try {
    const response = await fetch("/api/gemini/adaptive-follow-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });
    if (!response.ok) return fallback;

    const payload: unknown = await response.json();
    if (typeof payload !== "object" || payload === null || !("followUp" in payload)) return fallback;
    const followUp = (payload as { followUp: unknown }).followUp;
    if (typeof followUp !== "object" || followUp === null) return fallback;

    const candidate = followUp as Record<string, unknown>;
    if (
      typeof candidate.targetFact !== "string" ||
      !allowedFacts.has(candidate.targetFact as keyof FollowUpRequest["facts"]) ||
      typeof candidate.question !== "string" ||
      candidate.question.trim().length === 0 ||
      candidate.question.length > 240 ||
      typeof candidate.rationale !== "string" ||
      candidate.rationale.trim().length === 0 ||
      candidate.rationale.length > 400 ||
      candidate.source !== "gemini"
    ) return fallback;

    return {
      targetFact: candidate.targetFact as keyof FollowUpRequest["facts"],
      question: candidate.question.trim(),
      rationale: candidate.rationale.trim(),
      source: "gemini",
    };
  } catch {
    return fallback;
  }
}
