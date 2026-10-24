/**
 * Shared domain types for Tax Help.
 *
 * These types describe the shape of data the future questionnaire,
 * rules engine, and Gemini integration will exchange. They are defined
 * now so UI and future logic can be built against a stable contract,
 * but nothing in the current landing page reads or writes this data yet.
 */

/** A single answer captured during the guided assessment (future). */
export interface AssessmentAnswer {
  questionId: string;
  value: string | number | boolean | string[];
}

/** A tax topic the app suggests investigating — never a guaranteed result. */
export interface TaxTopicSuggestion {
  id: string;
  title: string;
  /** Plain-English explanation of why this might be relevant. */
  rationale: string;
  /** Confirmed eligibility is never claimed — only "may apply". */
  status: "may_apply" | "needs_more_info";
  officialSourceUrl?: string;
}

/** An item in the personalized document checklist (future). */
export interface DocumentChecklistItem {
  id: string;
  label: string;
  obtained: boolean;
}
