import { SingleSelectQuestion } from "../QuestionField";
import type { QuestionnaireAnswers } from "../types";

interface StepProps {
  answers: QuestionnaireAnswers;
  setAnswer: (field: keyof QuestionnaireAnswers, value: unknown) => void;
}

const US_STATES = [
  { value: "PA", label: "Pennsylvania" },
  { value: "NY", label: "New York" },
  { value: "NJ", label: "New Jersey" },
  { value: "OH", label: "Ohio" },
  { value: "other_us", label: "Another U.S. state" },
  { value: "outside_us", label: "Outside the United States" },
];

export default function TaxYearLocationStep({ answers, setAnswer }: StepProps) {
  return (
    <div>
      <SingleSelectQuestion
        name="taxYear"
        label="Which tax year do you need help with?"
        options={[
          { value: "2025", label: "2025 tax return" },
          { value: "2026_planning", label: "2026 tax planning (rules not yet available)" },
          { value: "other", label: "Another tax year (rules not yet available)" },
        ]}
        value={answers.taxYear}
        onChange={(v) => setAnswer("taxYear", v)}
      />

      <SingleSelectQuestion
        name="residenceState"
        label="Which state or jurisdiction did you live in during that year?"
        options={US_STATES}
        value={answers.residenceState}
        onChange={(v) => setAnswer("residenceState", v)}
      />

      <SingleSelectQuestion
        name="livedInMultipleStates"
        label="Did you move or live in multiple states during the year?"
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "not_sure", label: "Not sure" },
        ]}
        value={answers.livedInMultipleStates}
        onChange={(v) => setAnswer("livedInMultipleStates", v)}
      />

      <SingleSelectQuestion
        name="workLocation"
        label="Where did you physically work during the year?"
        options={[
          { value: "same_state_as_residence", label: "Same state where I lived" },
          { value: "different_state", label: "In another state" },
          { value: "multiple_locations", label: "In multiple locations" },
          { value: "remote", label: "Remote work" },
          { value: "self_employed", label: "Self-employment" },
          { value: "did_not_work", label: "I did not work" },
        ]}
        value={answers.workLocation}
        onChange={(v) => setAnswer("workLocation", v)}
      />
    </div>
  );
}
