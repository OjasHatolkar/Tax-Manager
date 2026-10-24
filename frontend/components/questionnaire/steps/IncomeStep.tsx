import { MultiSelectQuestion, SingleSelectQuestion } from "../QuestionField";
import type { QuestionnaireAnswers } from "../types";

interface StepProps {
  answers: QuestionnaireAnswers;
  setAnswer: (field: keyof QuestionnaireAnswers, value: unknown) => void;
}

export default function IncomeStep({ answers, setAnswer }: StepProps) {
  return (
    <div>
      <MultiSelectQuestion
        name="incomeTypes"
        label="Which types of income did you receive during the tax year?"
        helpText="Select all that apply."
        options={[
          { value: "w2", label: "W-2 employment" },
          { value: "freelance_gig", label: "Freelance or gig work" },
          { value: "self_employment", label: "Self-employment or business income" },
          { value: "investment", label: "Investment income" },
          { value: "unemployment", label: "Unemployment benefits" },
          { value: "rental", label: "Rental income" },
          { value: "other", label: "Other income" },
          { value: "none", label: "No income" },
        ]}
        value={answers.incomeTypes}
        onChange={(v) => setAnswer("incomeTypes", v)}
      />

      <SingleSelectQuestion
        name="incomeRange"
        label="Approximately how much income did you receive?"
        helpText="A rough range is fine for now — exact figures are collected later only if needed."
        options={[
          { value: "under_15k", label: "Under $15,000" },
          { value: "15k_40k", label: "$15,000–$40,000" },
          { value: "40k_75k", label: "$40,000–$75,000" },
          { value: "over_75k", label: "Over $75,000" },
          { value: "not_sure", label: "Not sure" },
        ]}
        value={answers.incomeRange}
        onChange={(v) => setAnswer("incomeRange", v)}
      />

      <SingleSelectQuestion
        name="hasIncomeDocuments"
        label="Do you have your income tax documents?"
        options={[
          { value: "all", label: "Yes, all relevant documents" },
          { value: "some", label: "Some documents" },
          { value: "none_yet", label: "None yet" },
          { value: "not_sure_which", label: "Not sure which documents I need" },
        ]}
        value={answers.hasIncomeDocuments}
        onChange={(v) => setAnswer("hasIncomeDocuments", v)}
      />
    </div>
  );
}
