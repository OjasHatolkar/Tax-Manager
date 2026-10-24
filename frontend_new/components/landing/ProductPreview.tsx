import { CheckCircle2, Circle, FileText, MessageCircleQuestion } from "lucide-react";

const checklist = [
  { label: "W-2 from employer", done: true },
  { label: "1098-T tuition statement", done: true },
  { label: "1099-NEC (freelance income)", done: false },
  { label: "Student loan interest statement", done: false },
];

const topics = [
  "Education credits worth reviewing",
  "Retirement savings contribution credit",
  "State and local filing requirements",
];

export default function ProductPreview() {
  return (
    <div
      className="relative mx-auto w-full max-w-md rounded-2xl border border-forest-100 bg-white p-5 shadow-cardHover sm:p-6"
      role="img"
      aria-label="Illustrative preview of the Tax Help dashboard showing a sample document checklist, example tax topics to investigate, and a follow-up question. All content shown is illustrative only, not a real result."
    >
      {/* Window chrome */}
      <div className="mb-5 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-forest-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-forest-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-forest-200" />
        <span className="ml-3 text-xs font-medium uppercase tracking-wide text-ink-500">
          Sample preview · illustrative only
        </span>
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-ink-500">
          <span>Your assessment</span>
          <span>3 of 5 sections</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-forest-100">
          <div className="h-full w-3/5 rounded-full bg-forest-500" />
        </div>
      </div>

      {/* Document checklist */}
      <div className="mb-6 rounded-xl border border-forest-100 bg-cream-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-forest-700" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-ink-900">
            Documents you may need
          </h3>
        </div>
        <ul className="space-y-2">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-2.5 text-sm">
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 flex-none text-forest-600" aria-hidden="true" />
              ) : (
                <Circle className="h-4 w-4 flex-none text-forest-200" aria-hidden="true" />
              )}
              <span className={item.done ? "text-ink-700" : "text-ink-500"}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Topics to investigate */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-ink-900">
          Topics that may be worth investigating
        </h3>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-sage-200 bg-sage-50 px-3 py-1.5 text-xs font-medium text-forest-700"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Follow-up question */}
      <div className="rounded-xl border border-forest-100 bg-forest-800 p-4 text-cream-50">
        <div className="mb-1.5 flex items-center gap-2">
          <MessageCircleQuestion className="h-4 w-4" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wide text-sage-200">
            Follow-up question
          </span>
        </div>
        <p className="text-sm leading-relaxed">
          Did you pay any tuition or fees out of pocket in 2025, separate from
          what scholarships covered?
        </p>
      </div>
    </div>
  );
}
