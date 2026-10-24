import { FileQuestion, SearchCheck, ListChecks } from "lucide-react";

const steps = [
  {
    icon: FileQuestion,
    number: "01",
    title: "Tell us about your situation.",
    description:
      "Answer straightforward questions about work, school, income, and relevant life events — no tax knowledge required.",
  },
  {
    icon: SearchCheck,
    number: "02",
    title: "Explore what may apply.",
    description:
      "Review potentially relevant tax considerations and answer follow-up questions when we need more detail.",
  },
  {
    icon: ListChecks,
    number: "03",
    title: "Get a clear plan.",
    description:
      "Receive a document checklist, plain-English explanations, and practical next steps with official references.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 bg-cream-100 py-20 sm:py-24"
      aria-labelledby="how-it-works-heading"
    >
      <div className="container-max section-pad">
        <div className="max-w-2xl">
          <h2
            id="how-it-works-heading"
            className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
          >
            How it works
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-700">
            Three simple stages — no tax jargon required to get started.
          </p>
        </div>

        <ol className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
          {steps.map((step, index) => (
            <li key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div
                  className="absolute left-6 top-14 hidden h-px w-full bg-forest-200 sm:block"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-forest-200 bg-white text-forest-800 shadow-card">
                <step.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="mt-4 block text-xs font-semibold tracking-wide text-forest-500">
                STEP {step.number}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-ink-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
