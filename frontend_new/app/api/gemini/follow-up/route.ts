/**
 * PLACEHOLDER API ROUTE — not yet implemented.
 *
 * This is where the real Gemini call for adaptive follow-up questions
 * belongs once it's built. Keeping it as a server route (not a client-side
 * call) is required so GEMINI_API_KEY never reaches the browser.
 *
 * Expected contract once implemented:
 *   POST body:  FollowUpRequest   (see lib/gemini/types.ts)
 *   response:   FollowUpQuestion  (see lib/gemini/types.ts)
 *
 * Until this is implemented, lib/gemini/followUp.ts does not call this
 * route at all — it uses a deterministic fallback so the questionnaire
 * works end-to-end without Gemini. Wire the fetch call back up in
 * lib/gemini/followUp.ts once this route does something real.
 */

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Not implemented. See app/api/gemini/follow-up/route.ts for the required contract.",
    },
    { status: 501 }
  );
}
