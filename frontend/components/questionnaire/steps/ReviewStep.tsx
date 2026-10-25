import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { QuestionnaireAnswers } from "../types";
import { FIELD_LABELS, formatAnswerValue } from "../reviewLabels";

interface StepProps {
  answers: QuestionnaireAnswers;
}

export default function ReviewStep({ answers }: StepProps) {
  const entries = Object.entries(answers) as [keyof QuestionnaireAnswers, unknown][];
  const answered = entries.filter(
    ([, value]) => value !== undefined && !(Array.isArray(value) && value.length === 0)
  );

  return (
    <div>
      <p className="text-sm text-ink-600">
        Review your answers, deterministic rule results, and documents to
        investigate. Results are illustrative guidance, not a tax determination.
      </p>

      <dl className="mt-6 divide-y divide-forest-100 rounded-xl border border-forest-200 bg-white">
        {answered.length === 0 && (
          <div className="flex items-center gap-2 px-4 py-4 text-sm text-ink-600">
            <AlertCircle className="h-4 w-4 text-forest-600" aria-hidden="true" />
            No answers recorded yet — go back and answer a few questions.
          </div>
        )}
        {answered.map(([field, value]) => (
          <div key={field} className="flex items-start justify-between gap-4 px-4 py-3">
            <dt className="flex items-center gap-2 text-sm font-medium text-ink-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
              {FIELD_LABELS[field]}
            </dt>
            <dd className="text-right text-sm text-ink-700">{formatAnswerValue(value)}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 rounded-xl border border-forest-200 bg-forest-50 px-4 py-4 text-sm text-forest-800">
        The rules engine screens supported 2025 topics only. Gemini may help
        phrase one missing-fact question; it does not determine eligibility.
      </div>
    </div>
  );
}
