import { SingleSelectQuestion } from "../QuestionField";
import type { QuestionnaireAnswers } from "../types";

interface StepProps {
  answers: QuestionnaireAnswers;
  setAnswer: (field: keyof QuestionnaireAnswers, value: unknown) => void;
}

export default function PersonalSituationStep({ answers, setAnswer }: StepProps) {
  return (
    <div>
      <SingleSelectQuestion
        name="ageRange"
        label="What is your age range?"
        options={[
          { value: "under_18", label: "Under 18" },
          { value: "18_24", label: "18–24" },
          { value: "25_64", label: "25–64" },
          { value: "65_plus", label: "65 or older" },
        ]}
        value={answers.ageRange}
        onChange={(v) => setAnswer("ageRange", v)}
      />

      <SingleSelectQuestion
        name="educationStatus"
        label="Which best describes your education?"
        options={[
          { value: "full_time_student", label: "Full-time student" },
          { value: "part_time_student", label: "Part-time student" },
          { value: "graduated_this_year", label: "Graduated during the tax year" },
          { value: "not_a_student", label: "Not currently a student" },
        ]}
        value={answers.educationStatus}
        onChange={(v) => setAnswer("educationStatus", v)}
      />

      <SingleSelectQuestion
        name="couldBeClaimedAsDependent"
        label="Could another person claim you as a dependent?"
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "not_sure", label: "Not sure" },
        ]}
        value={answers.couldBeClaimedAsDependent}
        onChange={(v) => setAnswer("couldBeClaimedAsDependent", v)}
      />

      <SingleSelectQuestion
        name="filingStatus"
        label="What was your marital status at the end of the tax year?"
        options={[
          { value: "single", label: "Single" },
          { value: "married_filing_jointly", label: "Married" },
          { value: "married_filing_separately", label: "Divorced or widowed" },
          { value: "not_sure", label: "Another situation" },
        ]}
        value={answers.filingStatus}
        onChange={(v) => setAnswer("filingStatus", v)}
      />
    </div>
  );
}
