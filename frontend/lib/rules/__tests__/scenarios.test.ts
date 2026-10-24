/**
 * Behavioral test cases from the product spec's "Testing Scenarios" section.
 *
 * These are NOT full tax-return answer keys (see the spec's own caution on
 * this). They verify the deterministic engine's BEHAVIOR against the spec's
 * pass criteria:
 *   - Never auto-awards a credit/deduction without the facts to support it.
 *   - Never ignores income just because no tax form was received.
 *   - Correctly reports "needs_info" (not a guess) when facts are missing.
 *   - Never treats a "may apply" result as confirmed eligibility.
 *
 * Run: npx ts-node lib/rules/__tests__/scenarios.test.ts
 */

import type { TaxFacts } from "../types";
import { evaluateRuleSet } from "../engine/evaluateTopic";
import { federal2025, pennsylvania2025 } from "../data";
import { rankMissingFacts } from "../engine/missingFacts";
import { test, expect, printSummary } from "./testRunner";

function evaluateAll(facts: TaxFacts) {
  return [
    ...evaluateRuleSet(federal2025.topics, facts, federal2025.id, federal2025.version),
    ...evaluateRuleSet(pennsylvania2025.topics, facts, pennsylvania2025.id, pennsylvania2025.version),
  ];
}

function find(evaluations: ReturnType<typeof evaluateAll>, topicId: string) {
  const found = evaluations.find((e) => e.topicId === topicId);
  if (!found) throw new Error(`Topic ${topicId} not found in evaluations`);
  return found;
}

console.log("Test Case 1: College Student with a Part-Time Job\n");
{
  // Sample profile per spec: age 20, PA resident, campus W-2 job, full-time
  // student, received 1098-T, received a scholarship. Dependency, exact
  // income, and withholding are deliberately NOT provided yet — the app
  // should ask, not assume.
  const facts: TaxFacts = {
    age: 20,
    isPennsylvaniaResident: true,
    hasW2Income: true,
    isStudent: true,
    isHalfTimeOrMoreStudent: true,
    paidTuitionOrEnrollmentFees: true,
    completedFirstFourYearsOfCollege: false,
    receivedTaxFreeScholarship: true,
  };
  const evaluations = evaluateAll(facts);

  test("federal filing requirement needs income + filing status before concluding", () => {
    expect(find(evaluations, "federal_filing_requirement_basic").status).toBe("needs_info");
  });

  test("AOTC is flagged as needing more info, NOT auto-approved (dependency/income unknown)", () => {
    const aotc = find(evaluations, "federal_aotc");
    expect(aotc.status).toBe("needs_info");
  });

  test("AOTC missing facts include income (MAGI) before a credit amount could be shown", () => {
    const aotc = find(evaluations, "federal_aotc");
    expect(aotc.missingFacts).toContain("magi");
  });

  test("EITC needs income before resolving (never guesses an amount)", () => {
    expect(find(evaluations, "federal_eitc").status).toBe("needs_info");
  });

  test("PA state filing is flagged as likely applicable given PA residency", () => {
    expect(find(evaluations, "pa_state_filing_requirement").status).toBe("may_apply");
  });

  test("highest-leverage missing fact is surfaced for the next adaptive question", () => {
    const ranked = rankMissingFacts(evaluations);
    expect(ranked.length > 0).toBe(true);
  });
}

console.log("\nTest Case 2: Student with a Side Hustle\n");
{
  // Sample profile: campus W-2 job + $2,400 freelance revenue - $300 expenses
  // = $2,100 net self-employment earnings (well above the $400 trigger).
  const facts: TaxFacts = {
    hasW2Income: true,
    hasFreelanceOrGigIncome: true,
    netSelfEmploymentIncome: 2100,
    isPennsylvaniaResident: true,
  };
  const evaluations = evaluateAll(facts);

  test("freelance income is NOT ignored just because no 1099 was mentioned", () => {
    const se = find(evaluations, "federal_self_employment_filing_trigger");
    expect(se.status).toBe("may_apply");
  });

  test("basic filing requirement still needs filing status + total MAGI", () => {
    expect(find(evaluations, "federal_filing_requirement_basic").status).toBe("needs_info");
  });
}

console.log("\nTest Case 3: Recent Graduate Starting a Full-Time Job\n");
{
  // Sample profile: single, $42,000 MAGI, not a dependent, paid and is
  // legally obligated on student loan interest, PA resident who also worked
  // in a PA local jurisdiction (triggers the local EIT lookup topic).
  const facts: TaxFacts = {
    filingStatus: "single",
    magi: 42000,
    isClaimedAsDependent: false,
    hasW2Income: true,
    paidStudentLoanInterest: true,
    legallyObligatedOnStudentLoan: true,
    isPennsylvaniaResident: true,
    workedOrLivedInPaLocalJurisdiction: true,
  };
  const evaluations = evaluateAll(facts);

  test("student loan interest deduction resolves to may_apply with sufficient facts (not a guaranteed amount)", () => {
    expect(find(evaluations, "federal_student_loan_interest_deduction").status).toBe("may_apply");
  });

  test("federal filing requirement resolves definitively once status + MAGI are known", () => {
    expect(find(evaluations, "federal_filing_requirement_basic").status).toBe("may_apply");
  });

  test("local EIT is surfaced as a topic to investigate, not silently skipped due to a new job/move", () => {
    const localEit = find(evaluations, "pa_local_earned_income_tax");
    expect(localEit.status).toBe("may_apply");
  });

  test("local EIT still requires a PSD lookup document, never asserts a specific rate", () => {
    const localEit = find(evaluations, "pa_local_earned_income_tax");
    expect(localEit.requiredDocuments.map((d) => d.id)).toContain("psd_lookup");
  });
}

printSummary();

// ============================================================================
// Additional tests: PA Tax Forgiveness, Local Services Tax, Saver's Credit,
// and taxable scholarship income (added alongside the PA/student rules pass)
// ============================================================================

test("PA Tax Forgiveness: low-income single filer, 0 dependents -> may_apply", () => {
  const facts: TaxFacts = {
    isPennsylvaniaResident: true,
    filingStatus: "single",
    numberOfDependents: 0,
    paEligibilityIncome: 9000,
    isClaimedAsDependent: false,
  };
  const evals = evaluateRuleSet(pennsylvania2025.topics, facts, pennsylvania2025.id, pennsylvania2025.version);
  const sp = evals.find((e) => e.topicId === "pa_tax_forgiveness_schedule_sp")!;
  expect(sp.status).toBe("may_apply");
});

test("PA Tax Forgiveness: dependent student cannot claim unless parent qualifies -> does_not_apply", () => {
  const facts: TaxFacts = {
    isPennsylvaniaResident: true,
    filingStatus: "single",
    numberOfDependents: 0,
    paEligibilityIncome: 8000,
    isClaimedAsDependent: true,
    wasFullTimeStudentDuringYear: true,
    claimingParentQualifiesForPaTaxForgiveness: false,
  };
  const evals = evaluateRuleSet(pennsylvania2025.topics, facts, pennsylvania2025.id, pennsylvania2025.version);
  const sp = evals.find((e) => e.topicId === "pa_tax_forgiveness_schedule_sp")!;
  expect(sp.status).toBe("does_not_apply");
});

test("PA Tax Forgiveness: higher earner above encoded table -> does_not_apply (documented simplification, not a partial-tier calculation)", () => {
  const facts: TaxFacts = {
    isPennsylvaniaResident: true,
    filingStatus: "single",
    numberOfDependents: 0,
    paEligibilityIncome: 50000,
    isClaimedAsDependent: false,
  };
  const evals = evaluateRuleSet(pennsylvania2025.topics, facts, pennsylvania2025.id, pennsylvania2025.version);
  const sp = evals.find((e) => e.topicId === "pa_tax_forgiveness_schedule_sp")!;
  // Our encoded condition only covers up to the 100%-tier ceiling, so above
  // that it should NOT resolve to may_apply, and since no fact is literally
  // "unknown" here (all branches evaluate false), it correctly resolves to
  // does_not_apply for THIS simplified table -- documented as a known
  // simplification (see file header: only 0-3 dependents, no partial tiers).
  expect(sp.status).toBe("does_not_apply");
});

test("Local Services Tax: income under $12,000 at work location -> exempt (does_not_apply)", () => {
  const facts: TaxFacts = {
    workedOrLivedInPaLocalJurisdiction: true,
    localJurisdictionEarnedIncome: 6000,
  };
  const evals = evaluateRuleSet(pennsylvania2025.topics, facts, pennsylvania2025.id, pennsylvania2025.version);
  const lst = evals.find((e) => e.topicId === "pa_local_services_tax")!;
  expect(lst.status).toBe("does_not_apply");
});

test("Local Services Tax: income above $12,000 -> may_apply", () => {
  const facts: TaxFacts = {
    workedOrLivedInPaLocalJurisdiction: true,
    localJurisdictionEarnedIncome: 20000,
  };
  const evals = evaluateRuleSet(pennsylvania2025.topics, facts, pennsylvania2025.id, pennsylvania2025.version);
  const lst = evals.find((e) => e.topicId === "pa_local_services_tax")!;
  expect(lst.status).toBe("may_apply");
});

test("Saver's Credit: recent grad, MFJ, $60k MAGI -> may_apply (would be wrongly excluded by a flat $39.5k check)", () => {
  const facts: TaxFacts = {
    contributedToRetirementAccount: true,
    age: 23,
    filingStatus: "married_filing_jointly",
    magi: 60000,
    isClaimedAsDependent: false,
    wasFullTimeStudentDuringYear: false,
  };
  const evals = evaluateRuleSet(federal2025.topics, facts, federal2025.id, federal2025.version);
  const saver = evals.find((e) => e.topicId === "federal_savers_credit")!;
  expect(saver.status).toBe("may_apply");
});

test("Saver's Credit: full-time student -> does_not_apply regardless of income", () => {
  const facts: TaxFacts = {
    contributedToRetirementAccount: true,
    age: 20,
    filingStatus: "single",
    magi: 10000,
    isClaimedAsDependent: false,
    wasFullTimeStudentDuringYear: true,
  };
  const evals = evaluateRuleSet(federal2025.topics, facts, federal2025.id, federal2025.version);
  const saver = evals.find((e) => e.topicId === "federal_savers_credit")!;
  expect(saver.status).toBe("does_not_apply");
});

test("Taxable scholarship income: nonqualified amount > 0 -> may_apply", () => {
  const facts: TaxFacts = { nonQualifiedScholarshipAmount: 3000 };
  const evals = evaluateRuleSet(federal2025.topics, facts, federal2025.id, federal2025.version);
  const schol = evals.find((e) => e.topicId === "federal_taxable_scholarship_income")!;
  expect(schol.status).toBe("may_apply");
});

test("Taxable scholarship income: all funds used for tuition -> does_not_apply", () => {
  const facts: TaxFacts = { nonQualifiedScholarshipAmount: 0 };
  const evals = evaluateRuleSet(federal2025.topics, facts, federal2025.id, federal2025.version);
  const schol = evals.find((e) => e.topicId === "federal_taxable_scholarship_income")!;
  expect(schol.status).toBe("does_not_apply");
});
