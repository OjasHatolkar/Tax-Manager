import type { Metadata } from "next";
import { ArrowLeft, KeyRound, ShieldAlert } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Sign In — Tax Help",
  description:
    "Tax Help authentication, powered by Auth0, is not yet connected. This page documents the integration plan.",
};

export default function SignInPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="bg-cream-100">
        <section className="container-max section-pad flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-800 text-cream-50">
            <KeyRound className="h-6 w-6" aria-hidden="true" />
          </div>

          <h1 className="mt-6 max-w-xl text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Sign-in isn&apos;t connected yet
          </h1>

          <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-700">
            Tax Help plans to use <strong>Auth0</strong> for real
            authentication so you can save assessments and come back to them
            later. That integration hasn&apos;t been wired up in this build —
            there is no sign-in flow, real or simulated, active right now.
          </p>

          <div className="mt-10 w-full max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-left">
            <div className="flex items-center gap-2 text-amber-900">
              <ShieldAlert className="h-4 w-4 flex-none" aria-hidden="true" />
              <h2 className="text-sm font-semibold">Integration checklist (next step)</h2>
            </div>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-amber-900/90">
              <li>Create an Auth0 application (Regular Web Application).</li>
              <li>
                Install <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">@auth0/nextjs-auth0</code>.
              </li>
              <li>
                Set <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">AUTH0_SECRET</code>,{" "}
                <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">AUTH0_BASE_URL</code>,{" "}
                <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">AUTH0_ISSUER_BASE_URL</code>,{" "}
                <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">AUTH0_CLIENT_ID</code>, and{" "}
                <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">AUTH0_CLIENT_SECRET</code> (see{" "}
                <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">.env.example</code>).
              </li>
              <li>Add the Auth0 route handler and protect saved-progress routes.</li>
              <li>Link the navbar &quot;Sign In&quot; action to the real login route.</li>
            </ul>
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
