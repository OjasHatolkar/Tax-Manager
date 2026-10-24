import { SingleSelectQuestion } from "../QuestionField";
import type { QuestionnaireAnswers } from "../types";

interface StepProps {
  answers: QuestionnaireAnswers;
  setAnswer: (field: keyof QuestionnaireAnswers, value: unknown) => void;
}

const yesNoUnsure = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not_sure", label: "Not sure" },
];

export default function EducationStep({ answers, setAnswer }: StepProps) {
  return (
    <div>
      <SingleSelectQuestion
        name="paidTuitionOrEducationExpenses"
        label="Did you pay college tuition or other education expenses?"
        options={yesNoUnsure}
        value={answers.paidTuitionOrEducationExpenses}
        onChange={(v) => setAnswer("paidTuitionOrEducationExpenses", v)}
      />

      <SingleSelectQuestion
        name="receivedScholarshipOrGrant"
        label="Did you receive scholarships or grants?"
        options={yesNoUnsure}
        value={answers.receivedScholarshipOrGrant}
        onChange={(v) => setAnswer("receivedScholarshipOrGrant", v)}
      />

      <SingleSelectQuestion
        name="paidStudentLoanInterest"
        label="Did you pay student loan interest during the year?"
        options={yesNoUnsure}
        value={answers.paidStudentLoanInterest}
        onChange={(v) => setAnswer("paidStudentLoanInterest", v)}
      />
    </div>
  );
}
