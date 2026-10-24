/**
 * Translates the questionnaire's coarse, user-friendly answers into the
 * rules engine's `TaxFacts` shape.
 *
 * This is the ONE place that bridges the two systems. The questionnaire
 * (components/questionnaire/) and the rules engine (lib/rules/) otherwise
 * know nothing about each other — this keeps both independently editable.
 *
 * Many `TaxFacts` fields (exact MAGI, exact student loan interest paid,
 * etc.) are intentionally NOT collected by the current coarse questionnaire
 * screens. Those are left undefined on purpose — the engine already treats
 * an undefined fact as "unknown" and reports `needs_info`, which is the
 * correct behavior (never guess a number the user didn't provide).
 */

import type { TaxFacts } from "@/lib/rules/types";
import type { QuestionnaireAnswers } from "@/components/questionnaire/types";

function yesNoToBool(value: unknown): boolean | undefined {
  if (value === "yes") return true;
  if (value === "no") return false;
  return undefined; // "not_sure" or unanswered both mean "unknown" to the engine
}

export function mapToTaxFacts(answers: QuestionnaireAnswers): TaxFacts {
  const facts: TaxFacts = {};

  // --- Filing status ---
  if (answers.filingStatus && answers.filingStatus !== "not_sure") {
    facts.filingStatus = answers.filingStatus;
  }
  facts.isClaimedAsDependent = yesNoToBool(answers.couldBeClaimedAsDependent);

  // --- Age (engine wants a number; questionnaire collects a range, so we
  // only set it when the range is unambiguous enough to not mislead a
  // boundary rule; otherwise leave unknown). ---
  if (answers.ageRange === "under_18") facts.age = 16;
  if (answers.ageRange === "65_plus") facts.age = 66;
  // 18_24 / 25_64 span rule boundaries (e.g. Saver's Credit age 18 cutoff) —
  // deliberately left undefined rather than guessing a midpoint.

  // --- Income ---
  const incomeTypes = answers.incomeTypes ?? [];
  if (incomeTypes.length > 0) {
    facts.hasW2Income = incomeTypes.includes("w2");
    facts.hasFreelanceOrGigIncome =
      incomeTypes.includes("freelance_gig") || incomeTypes.includes("self_employment");
  }

  // --- Student / education ---
  facts.isStudent =
    answers.educationStatus === "full_time_student" ||
    answers.educationStatus === "part_time_student";
  facts.isHalfTimeOrMoreStudent =
    answers.educationStatus === "full_time_student" ? true : undefined;
  facts.paidTuitionOrEnrollmentFees = yesNoToBool(answers.paidTuitionOrEducationExpenses);
  facts.receivedTaxFreeScholarship = yesNoToBool(answers.receivedScholarshipOrGrant);

  // --- Student loans ---
  facts.paidStudentLoanInterest = yesNoToBool(answers.paidStudentLoanInterest);

  // --- Pennsylvania / local ---
  facts.isPennsylvaniaResident = answers.residenceState === "PA";
  facts.workedOrLivedInPaLocalJurisdiction = yesNoToBool(answers.mayHaveLocalIncomeTax);

  return facts;
}
