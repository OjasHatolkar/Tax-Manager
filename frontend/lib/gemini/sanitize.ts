export type Facts = Record<string, string | number | boolean>;

const BOOLEAN_FACTS = new Set([
    "isClaimedAsDependent", "hasW2Income", "hasFreelanceOrGigIncome", "isStudent",
    "isHalfTimeOrMoreStudent", "completedFirstFourYearsOfCollege", "hasFelonyDrugConviction",
    "paidTuitionOrEnrollmentFees", "receivedTaxFreeScholarship", "paidStudentLoanInterest",
    "legallyObligatedOnStudentLoan", "contributedToRetirementAccount", "wasFullTimeStudentDuringYear",
    "hasQualifyingChildren", "isPennsylvaniaResident", "workedOrLivedInPaLocalJurisdiction",
    "claimingParentQualifiesForPaTaxForgiveness",
]);
const NUMBER_FACTS = new Set([
    "age", "magi", "netSelfEmploymentIncome", "priorYearsAotcClaimed",
    "qualifiedEducationExpenses", "studentLoanInterestPaid", "retirementContributionAmount",
    "numberOfQualifyingChildren", "investmentIncome", "localJurisdictionEarnedIncome",
    "localServicesTaxCombinedRate", "paEligibilityIncome", "numberOfDependents",
    "nonQualifiedScholarshipAmount",
]);
const FACT_KEYS = new Set([...BOOLEAN_FACTS, ...NUMBER_FACTS, "filingStatus"]);
const FILING_STATUSES = new Set([
    "single", "married_filing_jointly", "married_filing_separately", "head_of_household",
]);

export function cleanFacts(input: unknown): Facts | null {
    if (typeof input !== "object" || input === null || Array.isArray(input)) return null;
    const entries = Object.entries(input as Record<string, unknown>);
    if (entries.length > 60) return null;
    const out: Facts = {};
    for (const [key, value] of entries) {
        if (!FACT_KEYS.has(key)) return null;
        if (key === "filingStatus") {
            if (typeof value !== "string" || !FILING_STATUSES.has(value)) return null;
        } else if (BOOLEAN_FACTS.has(key)) {
            if (typeof value !== "boolean") return null;
        } else if (NUMBER_FACTS.has(key)) {
            if (typeof value !== "number" || !Number.isFinite(value)) return null;
        } else return null;
        out[key] = value as string | number | boolean;
    }
    return out;
}

export function cleanEvaluations(input: unknown): unknown[] | null {
    if (!Array.isArray(input) || input.length > 20) return null;
    try {
        if (JSON.stringify(input).length > 20000) return null;
    } catch {
        return null;
    }
    return input;
}
