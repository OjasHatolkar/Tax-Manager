import { SingleSelectQuestion } from "../QuestionField";
import type { QuestionnaireAnswers } from "../types";

interface StepProps {
  answers: QuestionnaireAnswers;
  setAnswer: (field: keyof QuestionnaireAnswers, value: unknown) => void;
}

export default function StateLocalStep({ answers, setAnswer }: StepProps) {
  return (
    <div>
      <SingleSelectQuestion
        name="mayHaveLocalIncomeTax"
        label="Did you live or work in a location that may have local income taxes?"
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "not_sure", label: "Not sure" },
        ]}
        value={answers.mayHaveLocalIncomeTax}
        onChange={(v) => setAnswer("mayHaveLocalIncomeTax", v)}
      />

      <SingleSelectQuestion
        name="localTaxesWithheld"
        label="Were local taxes withheld from your paycheck?"
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "not_sure", label: "Not sure" },
          { value: "no_paycheck", label: "I did not receive a paycheck" },
        ]}
        value={answers.localTaxesWithheld}
        onChange={(v) => setAnswer("localTaxesWithheld", v)}
      />

      <p className="mt-6 rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-800">
        Local tax rules vary by municipality and school district. We don&apos;t
        assume a rate here — once this is fully built, Tax Help will point
        you to the correct local tax collector for your specific location.
      </p>
    </div>
  );
}
