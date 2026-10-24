import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

export default function FinalCta() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-forest-700 px-6 py-16 text-center sm:px-16">
          <div
            className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-forest-600/40 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-sage-400/20 blur-3xl"
            aria-hidden="true"
          />

          <h2 className="relative text-3xl font-semibold tracking-tight text-cream-50 sm:text-4xl">
            Start understanding your taxes today
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-base leading-relaxed text-sage-100">
            Answer a few plain-English questions and see which documents and
            topics may be worth exploring for your situation.
          </p>
          <div className="relative mt-8 flex justify-center">
            <Button
              href="/assessment"
              size="lg"
              className="bg-cream-50 text-forest-800 hover:bg-white"
            >
              Start Your Assessment
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
