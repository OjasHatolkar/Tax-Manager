/**
 * PLACEHOLDER API ROUTE — not yet implemented.
 *
 * Intended for plain-English explanations of a single rules-engine topic
 * result (see lib/gemini/types.ts: ExplainTopicRequest / TopicExplanation).
 * Same rules as app/api/gemini/follow-up/route.ts: server-side only, must
 * validate model output, must not invent facts/thresholds not present in
 * the TopicEvaluation passed in.
 */

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Not implemented. See app/api/gemini/explain/route.ts for the required contract.",
    },
    { status: 501 }
  );
}
