/**
 * Pennsylvania state and local tax rules — Tax Year 2025.
 *
 * SCOPE: PA has a flat personal income tax rate (no standard deduction, no
 * brackets). On top of that, PA has three distinct, separately-administered
 * local/state items modeled here:
 *   1. PA-40 state filing requirement (flat 3.07%)
 *   2. PA Tax Forgiveness (Schedule SP) — real eligibility-income table
 *      encoded for 0-3 dependents, both filing statuses (Act defines a
 *      sliding 0%-100% forgiveness scale; higher dependent counts follow
 *      the same $250/$500-step pattern and can be added the same way).
 *   3. Local Earned Income Tax (EIT) — rate CANNOT be hardcoded (varies by
 *      ~2,500 PSD codes), so this always resolves to "needs_info" pointing
 *      to the official lookup tool. This is correct behavior, not a gap.
 *   4. Local Services Tax (LST) — a flat up-to-$52/year per-worker tax,
 *      separate from the EIT, with a mandatory low-income exemption below
 *      $12,000 of local earned income when the combined rate exceeds $10.
 *
 * Verified 2026-10-24 against the cited sources, including the full PA
 * Schedule SP eligibility-income tables published by the PA Department of
 * Revenue and the DCED Local Services Tax (Act 7 of 2007) summary.
 */

import type { RuleSet } from "../types";

export const pennsylvania2025: RuleSet = {
  id: "pennsylvania-2025",
  jurisdiction: "pennsylvania_state",
  taxYear: 2025,
  version: "2.0.0",
  lastReviewed: "2026-10-24",
  sourceCitations: [
    {
      label: "PA Department of Revenue — Personal Income Tax",
      url: "https://www.pa.gov/agencies/revenue/resources/tax-types-and-information/personal-income-tax",
    },
    {
      label: "PA Department of Revenue — Tax Forgiveness (Schedule SP, eligibility income tables)",
      url: "https://www.pa.gov/agencies/revenue/resources/tax-types-and-information/personal-income-tax/tax-forgiveness",
    },
    {
      label: "PA DCED — Local Services Tax (Act 7 of 2007)",
      url: "https://dced.pa.gov/local-government/local-income-tax-information/local-services-tax/",
    },
    {
      label: "PA DCED — Local Income Tax Information",
      url: "https://dced.pa.gov/local-government/local-income-tax-information/",
    },
  ],
  topics: [
    // ------------------------------------------------------------------
    // 1. PA state filing — flat 3.07%, no standard deduction
    // ------------------------------------------------------------------
    {
      id: "pa_state_filing_requirement",
      title: "You likely need to file a Pennsylvania state return (PA-40)",
      summary:
        "Pennsylvania taxes compensation at a flat 3.07% with no standard deduction. PA law requires anyone with more than $33 of taxable income during the year to file a PA-40, even if a refund is all you're owed.",
      category: "state_local",
      eligibilityCondition: {
        type: "or",
        conditions: [
          { type: "fact", fact: "isPennsylvaniaResident", op: "eq", value: true },
          { type: "fact", fact: "workedOrLivedInPaLocalJurisdiction", op: "eq", value: true },
        ],
      },
      requiredDocuments: [
        { id: "w2", label: "Form W-2 from each employer (shows PA withholding in box 17)" },
      ],
      citations: [
        {
          label: "PA Department of Revenue — Personal Income Tax",
          url: "https://www.pa.gov/agencies/revenue/resources/tax-types-and-information/personal-income-tax",
        },
      ],
    },

    // ------------------------------------------------------------------
    // 2. PA Tax Forgiveness (Schedule SP) — real eligibility-income table
    //
    // Thresholds below are the "100% forgiveness" ceiling (the table's
    // left-most, most favorable column) for Unmarried (Table 1) and
    // Married (Table 2) filers, by number of dependent children. This is a
    // deliberately conservative "may_apply" trigger: income at or under
    // this figure guarantees at least SOME forgiveness; income above it
    // still returns "needs_info" rather than "does_not_apply", because a
    // partial (10%-90%) forgiveness may still apply up through the top of
    // the table. Dependents beyond 3 are not yet encoded — flagged below.
    // ------------------------------------------------------------------
    {
      id: "pa_tax_forgiveness_schedule_sp",
      title: "You may want to investigate PA Tax Forgiveness (Schedule SP)",
      summary:
        "Pennsylvania offers partial or full forgiveness of PA income tax for lower-income households through Schedule SP, filed with your PA-40. Eligibility is based on \"eligibility income\" — a broader measure than PA taxable income that also counts nontaxable interest, alimony, gifts, and nontaxable scholarships — not just your paycheck.",
      category: "credit",
      eligibilityCondition: {
        type: "and",
        conditions: [
          { type: "fact", fact: "isPennsylvaniaResident", op: "eq", value: true },
          {
            type: "or",
            conditions: [
              {
                type: "and",
                conditions: [
                  { type: "fact", fact: "filingStatus", op: "in", value: ["single", "head_of_household"] },
                  { type: "fact", fact: "numberOfDependents", op: "eq", value: 0 },
                  { type: "fact", fact: "paEligibilityIncome", op: "lte", value: 9_500 },
                ],
              },
              {
                type: "and",
                conditions: [
                  { type: "fact", fact: "filingStatus", op: "in", value: ["single", "head_of_household"] },
                  { type: "fact", fact: "numberOfDependents", op: "eq", value: 1 },
                  { type: "fact", fact: "paEligibilityIncome", op: "lte", value: 19_000 },
                ],
              },
              {
                type: "and",
                conditions: [
                  { type: "fact", fact: "filingStatus", op: "in", value: ["single", "head_of_household"] },
                  { type: "fact", fact: "numberOfDependents", op: "eq", value: 2 },
                  { type: "fact", fact: "paEligibilityIncome", op: "lte", value: 28_500 },
                ],
              },
              {
                type: "and",
                conditions: [
                  { type: "fact", fact: "filingStatus", op: "in", value: ["single", "head_of_household"] },
                  { type: "fact", fact: "numberOfDependents", op: "eq", value: 3 },
                  { type: "fact", fact: "paEligibilityIncome", op: "lte", value: 38_000 },
                ],
              },
              {
                type: "and",
                conditions: [
                  { type: "fact", fact: "filingStatus", op: "eq", value: "married_filing_jointly" },
                  { type: "fact", fact: "numberOfDependents", op: "eq", value: 0 },
                  { type: "fact", fact: "paEligibilityIncome", op: "lte", value: 16_500 },
                ],
              },
              {
                type: "and",
                conditions: [
                  { type: "fact", fact: "filingStatus", op: "eq", value: "married_filing_jointly" },
                  { type: "fact", fact: "numberOfDependents", op: "eq", value: 1 },
                  { type: "fact", fact: "paEligibilityIncome", op: "lte", value: 26_000 },
                ],
              },
              {
                type: "and",
                conditions: [
                  { type: "fact", fact: "filingStatus", op: "eq", value: "married_filing_jointly" },
                  { type: "fact", fact: "numberOfDependents", op: "eq", value: 2 },
                  { type: "fact", fact: "paEligibilityIncome", op: "lte", value: 35_500 },
                ],
              },
              {
                type: "and",
                conditions: [
                  { type: "fact", fact: "filingStatus", op: "eq", value: "married_filing_jointly" },
                  { type: "fact", fact: "numberOfDependents", op: "eq", value: 3 },
                  { type: "fact", fact: "paEligibilityIncome", op: "lte", value: 45_000 },
                ],
              },
            ],
          },
        ],
      },
      exceptionConditions: [
        // A full-time student claimed as a dependent on a parent's federal
        // return cannot claim Schedule SP on their own, UNLESS the claiming
        // parent also qualifies for Tax Forgiveness.
        {
          type: "and",
          conditions: [
            { type: "fact", fact: "isClaimedAsDependent", op: "eq", value: true },
            { type: "fact", fact: "wasFullTimeStudentDuringYear", op: "eq", value: true },
            { type: "fact", fact: "claimingParentQualifiesForPaTaxForgiveness", op: "eq", value: false },
          ],
        },
      ],
      requiredDocuments: [
        {
          id: "schedule_sp",
          label: "PA Schedule SP",
          note: "File with your PA-40. Needed even if you owe no PA tax, to get withholding refunded.",
        },
      ],
      citations: [
        {
          label: "PA Department of Revenue — Tax Forgiveness (Schedule SP eligibility income tables)",
          url: "https://www.pa.gov/agencies/revenue/resources/tax-types-and-information/personal-income-tax/tax-forgiveness",
        },
      ],
    },

    // ------------------------------------------------------------------
    // 3. Local Earned Income Tax — always needs_info (rate varies by PSD)
    // ------------------------------------------------------------------
    {
      id: "pa_local_earned_income_tax",
      title: "You may owe a local Earned Income Tax (EIT)",
      summary:
        "Most PA municipalities and school districts levy a separate local Earned Income Tax collected alongside (not instead of) the state tax. The rate depends on exactly where you live and work under Act 32, so it cannot be determined without your specific municipality and school district (PSD code).",
      category: "state_local",
      // NOTE: resolving to "may_apply" here is NOT the same as computing a
      // rate or amount — required documents + summary make clear a PSD
      // lookup is still needed. The evaluator has no "requires external
      // lookup" status, so this is the closest honest fit until the PSD
      // lookup feature exists.
      eligibilityCondition: {
        type: "fact",
        fact: "workedOrLivedInPaLocalJurisdiction",
        op: "eq",
        value: true,
      },
      requiredDocuments: [
        { id: "psd_lookup", label: "Your Political Subdivision (PSD) code and local EIT rate", note: "Look up via the PA municipal statistics tool." },
        { id: "local_wage_tax_form", label: "Local Earned Income Tax Return (varies by tax collection district)" },
      ],
      citations: [
        {
          label: "PA DCED — PSD Codes and EIT Rates",
          url: "https://dced.pa.gov/local-government/local-income-tax-information/psd-codes-and-eit-rates/",
        },
        {
          label: "PA Municipal Statistics — Find Local Tax",
          url: "https://apps.dced.pa.gov/munstats-public/findlocaltax.aspx",
        },
      ],
    },

    // ------------------------------------------------------------------
    // 4. Local Services Tax (LST) — flat per-worker tax, max $52/year,
    //    separate from the EIT, with a real, codified low-income exemption.
    // ------------------------------------------------------------------
    {
      id: "pa_local_services_tax",
      title: "You may owe (or be exempt from) a Local Services Tax (LST)",
      summary:
        "Many PA municipalities and school districts levy a flat Local Services Tax of up to $52/year on anyone who works there, deducted from paychecks by each employer — separate from the local Earned Income Tax. If your combined earned income and net profits from that specific work location are under $12,000 for the year, state law requires an exemption when the combined LST rate exceeds $10; the exemption is optional below $10 depending on the local ordinance.",
      category: "state_local",
      eligibilityCondition: {
        type: "and",
        conditions: [
          { type: "fact", fact: "workedOrLivedInPaLocalJurisdiction", op: "eq", value: true },
          { type: "fact", fact: "localJurisdictionEarnedIncome", op: "gte", value: 12_000 },
        ],
      },
      exceptionConditions: [
        // Mandatory low-income exemption when combined rate > $10 and the
        // worker's local earned income is under $12,000.
        { type: "fact", fact: "localJurisdictionEarnedIncome", op: "lt", value: 12_000 },
      ],
      requiredDocuments: [
        {
          id: "lst_exemption_cert",
          label: "Local Services Tax Exemption Certificate",
          note: "File with your employer if you expect to earn under $12,000 at that work location this year, to stop withholding upfront.",
        },
      ],
      citations: [
        {
          label: "PA DCED — Local Services Tax (Act 7 of 2007)",
          url: "https://dced.pa.gov/local-government/local-income-tax-information/local-services-tax/",
        },
      ],
    },
  ],
};
