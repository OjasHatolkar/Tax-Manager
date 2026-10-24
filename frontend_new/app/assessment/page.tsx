import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Questionnaire from "@/components/questionnaire/Questionnaire";

export const metadata: Metadata = {
  title: "Your Assessment — Tax Help",
  description:
    "Answer a few plain-English questions about your work, school, income, and location to see which tax topics may be worth investigating.",
};

export default function AssessmentPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="bg-cream-100">
        <section className="container-max section-pad py-16">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              Your personalized assessment
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-700">
              Answer a few plain questions. We&apos;ll flag topics that may be
              worth investigating and the documents you may need — not a
              guaranteed result.
            </p>
          </div>
          <Questionnaire />
        </section>
      </main>
      <Footer />
    </>
  );
}
