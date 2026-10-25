import { GraduationCap, Briefcase, FileSpreadsheet, Laptop } from "lucide-react";

const audiences = [
  {
    icon: GraduationCap,
    title: "College students",
    description:
      "Navigating tuition payments, scholarships, and part-time or on-campus work for the first time.",
  },
  {
    icon: Briefcase,
    title: "Recent graduates",
    description:
      "Managing their first full-time job, a new W-2, and benefits elections that affect their taxes.",
  },
  {
    icon: FileSpreadsheet,
    title: "Employees",
    description:
      "Trying to make sense of their tax documents and whether they're missing potential benefits.",
  },
  {
    icon: Laptop,
    title: "Freelancers & side hustlers",
    description:
      "Managing additional 1099 income alongside a job, school, or other work.",
  },
];

export default function WhoItsFor() {
  return (
    <section
      id="who-its-for"
      className="scroll-mt-20 bg-white py-20 sm:py-24"
      aria-labelledby="who-its-for-heading"
    >
      <div className="container-max section-pad">
        <div className="max-w-2xl">
          <h2
            id="who-its-for-heading"
            className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
          >
            Who it&apos;s for
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-700">
            Tax Help is built for people navigating their taxes without a
              dedicated accountant — wherever you&apos;re starting from.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-forest-100 bg-cream-50 p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-100 text-forest-700">
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
