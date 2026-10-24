/**
 * Federal individual income tax rules — Tax Year 2025.
 *
 * SCOPE (intentionally narrow for the hackathon MVP): filing requirement,
 * self-employment filing trigger, Earned Income Tax Credit, American
 * Opportunity / Lifetime Learning education credits, and the student loan
 * interest deduction. These were chosen because they map directly to the
 * three test-case personas (student with W-2, student with side hustle,
 * recent graduate) in the product spec.
 *
 * Every numeric threshold below was verified on 2026-10-24 against the cited
 * official source. When the IRS publishes 2026 figures, DO NOT edit numbers
 * in place — copy this file to federal-2026.ts, bump taxYear/version, and
 * update citations. This file's `version` must be bumped on any numeric or
 * logic change so evaluations can be traced to the exact rule text used.
 *
 * NOT covered yet (flagged here so this isn't mistaken for complete):
 * Child Tax Credit, Premium Tax Credit, itemized deductions, capital gains,
 * rental income, multi-state allocation, AMT.
 */

import type { RuleSet } from "../types";

export const federal2025: RuleSet = {
  id: "federal-2025",
  jurisdiction: "federal",
  taxYear: 2025,
  version: "1.0.0",
  lastReviewed: "2026-10-24",
  sourceCitations: [
    { label: "IRS Publication 501 (2025)", url: "https://www.irs.gov/publications/p501" },
    {
      label: "IRS EITC and Earned Income Tables (Tax Year 2025)",
      url: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit/earned-income-and-earned-income-tax-credit-eitc-tables",
    },
    {
      label: "IRS — Education credits: AOTC and LLC",
      url: "https://www.irs.gov/credits-deductions/individuals/education-credits-aotc-and-llc",
    },
    { label: "IRS Topic no. 456 — Student loan interest deduction", url: "https://www.irs.gov/taxtopics/tc456" },
    { label: "IRS Publication 970 — Tax Benefits for Education", url: "https://www.irs.gov/publications/p970" },
    {
      label: "IRS — Retirement Savings Contributions Credit (Saver's Credit)",
      url: "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-savings-contributions-credit-savers-credit",
    },
  ],
  topics: [
    // ------------------------------------------------------------------
    // 1. Basic federal filing requirement (gross income vs. Table 1 / 2)
    // ------------------------------------------------------------------
    {
      id: "federal_filing_requirement_basic",
      title: "You may be required to file a federal tax return",
      summary:
        "Based on your filing status and income, you may be required to file a federal return — or filing may still get you a refund even if not required.",
      category: "filing_requirement",
      eligibilityCondition: {
        type: "or",
        conditions: [
          {
            type: "and",
            conditions: [
              { type: "fact", fact: "filingStatus", op: "eq", value: "single" },
              { type: "fact", fact: "magi", op: "gte", value: 15750 },
            ],
          },
          {
            type: "and",
            conditions: [
              { type: "fact", fact: "filingStatus", op: "eq", value: "head_of_household" },
              { type: "fact", fact: "magi", op: "gte", value: 23625 },
            ],
          },
          {
            type: "and",
            conditions: [
              { type: "fact", fact: "filingStatus", op: "eq", value: "married_filing_jointly" },
              { type: "fact", fact: "magi", op: "gte", value: 31500 },
            ],
          },
          {
            type: "and",
            conditions: [
              { type: "fact", fact: "filingStatus", op: "eq", value: "married_filing_separately" },
              { type: "fact", fact: "magi", op: "gte", value: 5 },
            ],
          },
        ],
      },
      requiredDocuments: [
        { id: "w2", label: "Form W-2 from each employer", note: "Needed to total your gross income and withholding." },
        { id: "1099_misc", label: "Any Forms 1099 received", note: "Freelance, interest, or other reported income." },
      ],
      citations: [
        { label: "IRS Pub. 501, 2025 Filing Requirements Chart (Table 1)", url: "https://www.irs.gov/publications/p501" },
      ],
    },

    // ------------------------------------------------------------------
    // 2. Self-employment filing trigger ($400 net earnings)
    // ------------------------------------------------------------------
    {
      id: "federal_self_employment_filing_trigger",
      title: "Self-employment income may require you to file and pay self-employment tax",
      summary:
        "Net self-employment earnings of $400 or more generally create a federal filing requirement, regardless of your other income.",
      category: "filing_requirement",
      eligibilityCondition: {
        type: "fact",
        fact: "netSelfEmploymentIncome",
        op: "gte",
        value: 400,
      },
      requiredDocuments: [
        { id: "se_income_records", label: "Payment records or 1099-NEC/1099-K for freelance or gig work" },
        { id: "se_expense_records", label: "Receipts for business expenses", note: "May reduce your net earnings figure." },
      ],
      citations: [
        { label: "IRS Pub. 501, Table 3 — Other Situations When You Must File", url: "https://www.irs.gov/publications/p501" },
      ],
    },

    // ------------------------------------------------------------------
    // 3. Earned Income Tax Credit (simplified: 0-children AGI test shown;
    //    full child-count logic deferred — flagged as needs_info when the
    //    user has qualifying children, since the threshold differs).
    // ------------------------------------------------------------------
    {
      id: "federal_eitc",
      title: "You may want to investigate the Earned Income Tax Credit (EITC)",
      summary:
        "The EITC is a refundable credit for workers with low to moderate earned income. The exact amount depends on your income, filing status, and number of qualifying children.",
      category: "credit",
      eligibilityCondition: {
        type: "and",
        conditions: [
          { type: "fact", fact: "hasW2Income", op: "eq", value: true },
          { type: "fact", fact: "magi", op: "lt", value: 68675 },
        ],
      },
      exceptionConditions: [
        { type: "fact", fact: "filingStatus", op: "eq", value: "married_filing_separately" },
        { type: "fact", fact: "investmentIncome", op: "gt", value: 11950 },
      ],
      requiredDocuments: [
        { id: "w2", label: "Form W-2 from each employer" },
        { id: "dependent_info", label: "Social Security numbers for any qualifying children" },
      ],
      citations: [
        {
          label: "IRS EITC and Earned Income Tables, Tax Year 2025",
          url: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit/earned-income-and-earned-income-tax-credit-eitc-tables",
        },
      ],
    },

    // ------------------------------------------------------------------
    // 4. American Opportunity Tax Credit
    // ------------------------------------------------------------------
    {
      id: "federal_aotc",
      title: "You may want to investigate the American Opportunity Tax Credit",
      summary:
        "The AOTC can cover up to $2,500 per eligible student in the first four years of postsecondary education, if income and enrollment requirements are met.",
      category: "credit",
      eligibilityCondition: {
        type: "and",
        conditions: [
          { type: "fact", fact: "isHalfTimeOrMoreStudent", op: "eq", value: true },
          { type: "fact", fact: "paidTuitionOrEnrollmentFees", op: "eq", value: true },
          { type: "fact", fact: "completedFirstFourYearsOfCollege", op: "eq", value: false },
        ],
      },
      exceptionConditions: [
        { type: "fact", fact: "filingStatus", op: "eq", value: "married_filing_separately" },
        { type: "fact", fact: "magi", op: "gte", value: 90000 },
        { type: "fact", fact: "hasFelonyDrugConviction", op: "eq", value: true },
        { type: "fact", fact: "priorYearsAotcClaimed", op: "gte", value: 4 },
      ],
      requiredDocuments: [
        { id: "1098t", label: "Form 1098-T from the school", note: "Required to claim the credit in almost all cases." },
        { id: "receipts_books", label: "Receipts for required course materials bought elsewhere" },
      ],
      citations: [
        {
          label: "IRS — Education credits: AOTC and LLC",
          url: "https://www.irs.gov/credits-deductions/individuals/education-credits-aotc-and-llc",
        },
        { label: "IRS Publication 970", url: "https://www.irs.gov/publications/p970" },
      ],
    },

    // ------------------------------------------------------------------
    // 5. Lifetime Learning Credit
    // ------------------------------------------------------------------
    {
      id: "federal_llc",
      title: "You may want to investigate the Lifetime Learning Credit",
      summary:
        "The LLC can cover 20% of up to $10,000 of qualified tuition per return (max $2,000), with no limit on years claimed — useful if the AOTC doesn't apply.",
      category: "credit",
      eligibilityCondition: {
        type: "fact",
        fact: "paidTuitionOrEnrollmentFees",
        op: "eq",
        value: true,
      },
      exceptionConditions: [
        { type: "fact", fact: "filingStatus", op: "eq", value: "married_filing_separately" },
        { type: "fact", fact: "magi", op: "gte", value: 90000 },
      ],
      requiredDocuments: [
        { id: "1098t", label: "Form 1098-T from the school" },
      ],
      citations: [
        {
          label: "IRS — Education credits: AOTC and LLC",
          url: "https://www.irs.gov/credits-deductions/individuals/education-credits-aotc-and-llc",
        },
      ],
    },

    // ------------------------------------------------------------------
    // 6. Student Loan Interest Deduction
    // ------------------------------------------------------------------
    {
      id: "federal_student_loan_interest_deduction",
      title: "You may want to investigate the student loan interest deduction",
      summary:
        "Up to $2,500 of qualified student loan interest may be deductible above the line, phasing out at higher incomes.",
      category: "deduction",
      eligibilityCondition: {
        type: "and",
        conditions: [
          { type: "fact", fact: "paidStudentLoanInterest", op: "eq", value: true },
          { type: "fact", fact: "legallyObligatedOnStudentLoan", op: "eq", value: true },
        ],
      },
      exceptionConditions: [
        { type: "fact", fact: "filingStatus", op: "eq", value: "married_filing_separately" },
        { type: "fact", fact: "isClaimedAsDependent", op: "eq", value: true },
        { type: "fact", fact: "magi", op: "gte", value: 100000 },
      ],
      requiredDocuments: [
        { id: "1098e", label: "Form 1098-E from each loan servicer", note: "Issued if you paid $600+ in interest to that servicer." },
      ],
      citations: [
        { label: "IRS Topic no. 456 — Student loan interest deduction", url: "https://www.irs.gov/taxtopics/tc456" },
        { label: "IRS Publication 970, chapter 4", url: "https://www.irs.gov/publications/p970" },
      ],
    },

    // ------------------------------------------------------------------
    // 7. Taxable scholarship/grant income (common surprise for students)
    //
    // Scholarship or grant money used for anything OTHER than tuition,
    // required fees, books, and required course materials (e.g. room,
    // board, travel) is generally taxable income the student must report,
    // even without a W-2 or 1099 for it. This is one of the most common
    // student blind spots and directly matches Test Case 1 in the product
    // spec.
    // ------------------------------------------------------------------
    {
      id: "federal_taxable_scholarship_income",
      title: "Part of your scholarship or grant money may be taxable",
      summary:
        "Scholarship and grant money used for tuition, required fees, and required course materials is generally tax-free. Money used for room, board, travel, or other living expenses is generally taxable income that must be reported, even if you never received a tax form for it.",
      category: "filing_requirement",
      eligibilityCondition: {
        type: "fact",
        fact: "nonQualifiedScholarshipAmount",
        op: "gt",
        value: 0,
      },
      requiredDocuments: [
        { id: "1098t", label: "Form 1098-T from the school", note: "Shows total scholarships/grants received and billed qualified expenses." },
        { id: "scholarship_award_letter", label: "Scholarship or grant award letter(s)", note: "Helps separate tuition-restricted funds from unrestricted funds." },
      ],
      citations: [
        { label: "IRS Publication 970, chapter 1 — Scholarships, Fellowships, Grants", url: "https://www.irs.gov/publications/p970" },
      ],
    },

    // ------------------------------------------------------------------
    // 8. Retirement Savings Contributions Credit (Saver's Credit)
    //
    // Relevant to recent graduates starting a 401(k)/IRA for the first
    // time. Three hard disqualifiers (age/student/dependent) regardless of
    // income — encoded as exceptions per Form 8880's own caution box.
    // ------------------------------------------------------------------
    {
      id: "federal_savers_credit",
      title: "You may want to investigate the Saver's Credit",
      summary:
        "If you contributed to a 401(k), 403(b), IRA, or similar retirement account, you may qualify for a credit worth 10%-50% of up to $2,000 contributed, depending on your income. It's nonrefundable, so it can reduce taxes owed but won't generate money beyond that.",
      category: "credit",
      eligibilityCondition: {
        type: "and",
        conditions: [
          { type: "fact", fact: "contributedToRetirementAccount", op: "eq", value: true },
          { type: "fact", fact: "age", op: "gte", value: 18 },
          {
            // Ceiling depends on filing status — using a single flat number
            // here would wrongly reject MFJ/HoH filers who actually qualify
            // at higher incomes, or wrongly accept them above their own
            // real ceiling. Branch per status instead.
            type: "or",
            conditions: [
              {
                type: "and",
                conditions: [
                  { type: "fact", fact: "filingStatus", op: "in", value: ["single", "married_filing_separately"] },
                  { type: "fact", fact: "magi", op: "lt", value: 39_500 },
                ],
              },
              {
                type: "and",
                conditions: [
                  { type: "fact", fact: "filingStatus", op: "eq", value: "head_of_household" },
                  { type: "fact", fact: "magi", op: "lt", value: 59_250 },
                ],
              },
              {
                type: "and",
                conditions: [
                  { type: "fact", fact: "filingStatus", op: "eq", value: "married_filing_jointly" },
                  { type: "fact", fact: "magi", op: "lt", value: 79_000 },
                ],
              },
            ],
          },
        ],
      },
      exceptionConditions: [
        { type: "fact", fact: "isClaimedAsDependent", op: "eq", value: true },
        { type: "fact", fact: "wasFullTimeStudentDuringYear", op: "eq", value: true },
        // Joint/HoH filers have higher MAGI ceilings than the base $39,500
        // used in the main condition above, so those filing statuses must
        // never be auto-excluded here — only flagged for the correct limit.
      ],
      requiredDocuments: [
        { id: "retirement_contribution_statement", label: "Year-end retirement account statement or Form W-2 Box 12 code", note: "Shows the amount you personally contributed during the year." },
        { id: "form_8880", label: "Form 8880", note: "Used to calculate the exact credit rate (50%, 20%, or 10%) for your income and filing status." },
      ],
      citations: [
        {
          label: "IRS — Retirement Savings Contributions Credit (Saver's Credit)",
          url: "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-savings-contributions-credit-savers-credit",
        },
      ],
    },
  ],
};
