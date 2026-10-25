import type { QuestionnaireAnswers } from "./types";

/** Human-readable field labels and value labels for the review screen. */
export const FIELD_LABELS: Record<keyof QuestionnaireAnswers, string> = {
  taxYear: "Tax year",
  residenceState: "State of residence",
  livedInMultipleStates: "Lived in multiple states",
  workLocation: "Work location",
  ageRange: "Age range",
  educationStatus: "Education status",
  isClaimedAsDependent: "Will be claimed as a dependent",
  filingStatus: "Filing status",
  incomeTypes: "Income types",
  incomeRange: "Approximate income",
  hasIncomeDocuments: "Income documents on hand",
  paidTuitionOrEducationExpenses: "Paid tuition or education expenses",
  receivedScholarshipOrGrant: "Received a scholarship or grant",
  paidStudentLoanInterest: "Paid student loan interest",
  mayHaveLocalIncomeTax: "May have local income tax",
  localTaxesWithheld: "Local taxes withheld",
};

const VALUE_LABELS: Record<string, string> = {
  "2025": "2025 tax return",
  "2026_planning": "2026 tax planning",
  other: "Another supported tax year",
  PA: "Pennsylvania",
  NY: "New York",
  NJ: "New Jersey",
  OH: "Ohio",
  other_us: "Another U.S. state",
  outside_us: "Outside the United States",
  yes: "Yes",
  no: "No",
  not_sure: "Not sure",
  same_state_as_residence: "Same state where I lived",
  different_state: "In another state",
  multiple_locations: "In multiple locations",
  remote: "Remote work",
  self_employed: "Self-employment",
  did_not_work: "I did not work",
  under_18: "Under 18",
  "18_24": "18–24",
  "25_64": "25–64",
  "65_plus": "65 or older",
  full_time_student: "Full-time student",
  part_time_student: "Part-time student",
  graduated_this_year: "Graduated during the tax year",
  not_a_student: "Not currently a student",
  single: "Single",
  married_filing_jointly: "Married",
  married_filing_separately: "Divorced or widowed",
  w2: "W-2 employment",
  freelance_gig: "Freelance or gig work",
  self_employment: "Self-employment or business income",
  investment: "Investment income",
  unemployment: "Unemployment benefits",
  rental: "Rental income",
  none: "No income",
  under_15k: "Under $15,000",
  "15k_40k": "$15,000–$40,000",
  "40k_75k": "$40,000–$75,000",
  over_75k: "Over $75,000",
  all: "Yes, all relevant documents",
  some: "Some documents",
  none_yet: "None yet",
  not_sure_which: "Not sure which documents I need",
  no_paycheck: "I did not receive a paycheck",
};

export function formatAnswerValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "Not answered";
  if (Array.isArray(value)) {
    if (value.length === 0) return "Not answered";
    return value.map((v) => VALUE_LABELS[String(v)] ?? String(v)).join(", ");
  }
  return VALUE_LABELS[String(value)] ?? String(value);
}
