# Tax Help

An AI-assisted tax guidance and education tool that helps students, new
grads, W-2 employees, and freelancers understand which documents and tax
topics may be relevant to their situation — in plain English, grounded in
official sources.

**This is a tax education and guidance tool, not a tax-preparation or
e-filing product.** It never guarantees refunds, savings, or eligibility
for any credit or deduction.

This milestone delivers the **landing page and foundational project
structure** only. The guided questionnaire, Gemini integration, and Auth0
authentication are intentionally not implemented yet (see "What's a
placeholder" below).

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router) + React 18
- TypeScript (strict mode)
- Tailwind CSS (custom forest-green / cream fintech theme)
- [lucide-react](https://lucide.dev/) icons

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build      # production build
npm run start      # run the production build
npm run typecheck  # strict TypeScript check, no emit
npm run lint       # Next.js / ESLint checks
```

> **Note on this delivery:** the sandbox this project was built in has no
> outbound internet access, so `npm install` / `npm run build` /
> `npm run dev` could not be executed here. Every file was written by hand
> against the pinned dependency versions in `package.json`, all `@/...`
> imports were verified to resolve to real files, and all `.tsx`/`.ts`
> files were run through a TypeScript syntax check. A full `npm install`
> + `next build` should still be run in a normal environment (with
> internet access) before you consider this "verified" — see
> **Known unverified items** below.

## Environment variables

Copy `.env.example` to `.env.local` and set the Gemini key for AI-backed
questionnaire features. Auth0 settings remain future configuration.

| Variable | Used for |
|---|---|
| `GEMINI_API_KEY` | Server-side only. Used by Gemini API routes. |
| `GEMINI_API_MODEL` | Server-side model ID; defaults to `gemini-3.8-flash` in the example. |
| `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` | Future Auth0 sign-in and saved-progress features. |

## Project structure

```
app/
  layout.tsx          Root layout, metadata, skip link
  page.tsx             Landing page (composes the sections below)
  globals.css          Tailwind layers, focus states, reduced-motion support
  assessment/page.tsx  Placeholder for the future guided questionnaire
  sign-in/page.tsx     Placeholder sign-in route + Auth0 integration checklist
components/
  layout/              Navbar, Footer
  landing/              Hero, Benefits, HowItWorks, WhoItsFor, TrustPrivacy,
                        FinalCta, ProductPreview (illustrative dashboard mock)
  ui/                   Button, Container, Logo (shared primitives)
lib/
  types.ts             Shared domain types for future assessment/rules data
  README.md            Notes on where Gemini/Auth0/rules logic will live
public/
  favicon.svg          Brand mark favicon
.env.example           Documented env vars (no secrets)
```

This separation is deliberate so later work stays isolated:

- **Landing page UI** — `app/page.tsx`, `components/landing/*` (done).
- **Questionnaire & adaptive follow-up logic** — will live under
  `app/assessment/` and a new `lib/assessment/` module.
- **Gemini integration** — lives under `lib/gemini/` and server-side API
  routes. The browser never receives the API key.
- **Auth0 authentication** — will live under `lib/auth/` and
  `app/api/auth/[...auth0]/`, following `@auth0/nextjs-auth0`.
- **Versioned tax rules & deterministic calculations** — will live under
  `lib/rules/`, kept separate from AI-generated text so Gemini output can
  be checked against them rather than treated as authoritative.
- **Official source references** — tracked alongside `lib/rules/` content.

## What works today

- Full responsive landing page at `/`: nav (with mobile menu), hero with an
  illustrative product-preview mock, benefits, how-it-works, who-it's-for,
  trust & privacy, final CTA, and footer with disclaimer.
- Working in-app navigation: anchor links to in-page sections, and real
  routes to `/assessment` and `/sign-in`.
- `/assessment` — a designed placeholder explaining what the guided
  questionnaire will cover, with a clear way back to the homepage.
- `/sign-in` — a placeholder that **does not fake a login**. It explains
  Auth0 isn't wired up yet and lists the exact integration steps.
- Accessibility basics: semantic landmarks, a skip-to-content link, visible
  focus states, descriptive `aria-label`s, and a
  `prefers-reduced-motion` override for animations.

## What's a placeholder (by design)

- **Gemini API** — adaptive follow-up and server-side explain/Q&A endpoints
  are implemented. Auth0 is still a placeholder.
- **Auth0** — no real or simulated authentication. `/sign-in` is an
  honest "not connected yet" page with a setup checklist.
- **Assessment / questionnaire** — `/assessment` is a preview, not a
  working form. No tax data is collected anywhere in this build.
- **Tax rules engine** — intentionally not built in this milestone.
- The hero's product preview panel is explicitly labeled "illustrative
  only" and contains no real or implied refund/eligibility numbers.

## Known unverified items

Because this sandbox has no internet access, the following could **not**
be executed here and should be run before you rely on this build:

- `npm install` (dependency resolution/version conflicts)
- `npm run dev` (live dev server / hot reload)
- `npm run build` (production build, Next.js's own type-checking via
  `next build`, and bundling)
- `npm run lint` (ESLint via `eslint-config-next`)
- Visual/browser testing on desktop and mobile breakpoints

What **was** verified without installing dependencies:

- Every `@/...` import resolves to an actual file.
- All `.ts`/`.tsx` files pass a TypeScript syntax check (no mismatched
  JSX, braces, or stray tokens).
- Every Tailwind class used in the app matches a token defined in
  `tailwind.config.ts` or Tailwind's defaults — no undefined custom
  classes.
- Button/Link destinations were traced by hand (nav anchors, "Get
  Started", "Find Out What May Apply", "See How It Works", footer links,
  final CTA, and the assessment/sign-in "back to home" links).

## Next recommended step

1. Run `npm install && npm run build && npm run dev` in an environment
   with internet access and fix anything that surfaces.
2. Visually QA desktop + mobile breakpoints and run an accessibility pass
   (e.g. axe or Lighthouse).
3. Start the guided questionnaire UI in `app/assessment/`, backed by a
   new `lib/assessment/` module for question flow state — still with no
   AI calls.
4. Implement Auth0 (`@auth0/nextjs-auth0`) once there's an account-gated
   feature (saved assessments) worth protecting.
