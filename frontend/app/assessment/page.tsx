import type { Metadata } from "next";
import { ArrowLeft, Construction, ListChecks, MessageSquareText, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Start Your Assessment — Tax Help",
  description:
    "The Tax Help guided questionnaire is coming soon. Here's what it will cover once it's built.",
};

const upcoming = [
  {
    icon: ListChecks,
    title: "A guided questionnaire",
    description:
      "Plain questions about your work, school, income, location, and relevant life events.",
  },
  {
    icon: Sparkles,
    title: "Adaptive follow-up questions",
    description:
      "Powered by the Gemini API to ask clarifying questions based on what you've already shared.",
  },
  {
    icon: MessageSquareText,
    title: "Plain-English explanations",
    description:
      "Clear write-ups of why a document or topic matters for your specific situation.",
  },
];

export default function AssessmentPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="bg-cream-100">
        <section className="container-max section-pad flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white px-3.5 py-1.5 text-xs font-medium text-forest-700">
            <Construction className="h-3.5 w-3.5" aria-hidden="true" />
            Coming soon — placeholder page
          </span>

          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            Your personalized assessment starts here
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-700">
            This is where Tax Help&apos;s guided questionnaire will live. We&apos;re
            still building the adaptive, question-by-question experience —
            for now, here&apos;s a preview of what it will include.
          </p>

          <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-5 text-left sm:grid-cols-3">
            {upcoming.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-forest-100 bg-white p-6 shadow-card"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-forest-800 text-cream-50">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-sm font-semibold text-ink-900">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">
                  {description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-forest-200 bg-forest-50 px-6 py-4 text-sm text-forest-800">
            No tax information is collected on this page. Nothing you enter
            anywhere on this site yet is saved or analyzed — the full
            questionnaire has not been built.
          </div>

          <Button href="/" variant="secondary" size="md" className="mt-8">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Button>
        </section>
      </main>
      <Footer />
    </>
  );
}
