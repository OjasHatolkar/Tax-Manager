import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import ProductPreview from "./ProductPreview";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream-100">
      {/* Subtle background accent */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sage-100/60 blur-3xl"
        aria-hidden="true"
      />
      <div className="container-max section-pad relative grid grid-cols-1 items-center gap-14 py-16 sm:py-20 lg:grid-cols-2 lg:gap-10 lg:py-28">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white px-3.5 py-1.5 text-xs font-medium text-forest-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Built for students, new grads, and first-time filers
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl lg:text-[3.25rem]">
            Taxes are complicated.
            <br />
            Your next step doesn&apos;t have to be.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-700">
            Tax Help asks a few plain questions about your work, school, and
            income, then helps you understand which tax benefits might be
            worth investigating, which documents to gather, and what to do
            next — explained in everyday language, not tax jargon.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="/assessment" size="lg">
              Find Out What May Apply
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-1.5 px-2 py-3 text-base font-medium text-forest-800 hover:text-forest-600"
            >
              See How It Works
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-forest-100 pt-6 sm:flex-row sm:gap-8">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-[18px] w-[18px] flex-none text-forest-600" aria-hidden="true" />
              <p className="text-sm text-ink-700">
                Personalized to your situation — not generic advice
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-[18px] w-[18px] flex-none text-forest-600" aria-hidden="true" />
              <p className="text-sm text-ink-700">
                Points you to official IRS and state sources
              </p>
            </div>
          </div>
        </div>

        <div className="animate-fade-up [animation-delay:150ms]">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}
