import { Landmark, MessagesSquare, Scale, Lock } from "lucide-react";

const commitments = [
  {
    icon: Landmark,
    title: "Grounded in official sources",
    description:
      "Guidance is designed to reference IRS publications and relevant state tax resources rather than relying on AI judgment alone.",
  },
  {
    icon: MessagesSquare,
    title: "We ask when we're not sure",
    description:
      "When important information is missing, Taxpertise is designed to ask a follow-up question rather than assume an answer.",
  },
  {
    icon: Scale,
    title: "Possible vs. confirmed",
    description:
      "We aim to clearly distinguish tax benefits that may be worth investigating from confirmed eligibility, which only a filed return can establish.",
  },
  {
    icon: Lock,
    title: "Careful with your information",
    description:
      "We intend to treat the personal and financial details you share with care as the product develops beyond this early version.",
  },
];

export default function TrustPrivacy() {
  return (
    <section id="trust-privacy" className="scroll-mt-20 bg-white py-20 sm:py-28" aria-labelledby="trust-privacy-heading">
      <div className="container-max section-pad">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <h2 id="trust-privacy-heading" className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              Trust &amp; privacy
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-700">
              Taxpertise is an early, hackathon-stage project. Here&apos;s what we&apos;re
              designing toward — and an honest look at what&apos;s implemented
              today.
            </p>

            <div className="mt-6 rounded-2xl border border-forest-200 bg-forest-50 p-5">
              <p className="text-sm font-semibold text-forest-800">
                Where things stand right now
              </p>
              <p className="mt-2 text-sm leading-relaxed text-forest-800/90">
                The assessment currently collects questionnaire answers and
                stores progress in this browser&apos;s localStorage. When you view
                results, validated facts are sent to server-side Gemini routes
                for adaptive wording; the API key stays on the server. Sign-in
                uses Auth0 when configured. Rules currently cover the 2025 tax
                year only. Do not enter Social Security numbers or other
                sensitive identifiers.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {commitments.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-3.5">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-sage-100 text-forest-700">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-700">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
