import { ClipboardList, Search, MessageSquareText, Compass } from "lucide-react";

const benefits = [
  {
    icon: ClipboardList,
    title: "Know which documents you need",
    description:
      "Get a personalized checklist built from your situation — work, school, and income — so you're not guessing what to dig up.",
  },
  {
    icon: Search,
    title: "Discover potential tax benefits",
    description:
      "Surface credits and deductions that may be worth investigating further, based on what you tell us.",
  },
  {
    icon: MessageSquareText,
    title: "Understand taxes in plain English",
    description:
      "Confusing terminology gets replaced with clear explanations and relevant follow-up questions when something's unclear.",
  },
  {
    icon: Compass,
    title: "Know your next steps",
    description:
      "See official-source references and a clear picture of what information is still missing before you file.",
  },
];

export default function Benefits() {
  return (
    <section className="bg-white py-20 sm:py-24" aria-labelledby="benefits-heading">
      <div className="container-max section-pad">
        <div className="max-w-2xl">
          <h2 id="benefits-heading" className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Clarity, not more confusion
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-700">
            Tax Help focuses on the handful of things that actually move you
            forward: documents, possibilities worth checking, plain
            explanations, and a next step.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-forest-100 bg-cream-50 p-6 shadow-card transition-shadow duration-200 hover:shadow-cardHover"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-800 text-cream-50">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-ink-900">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
