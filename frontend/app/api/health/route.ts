import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getTelemetrySnapshot } from "@/lib/health/telemetry";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Unable to verify Auth0 session" }, { status: 401 });
  }

  return NextResponse.json(getTelemetrySnapshot(), {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
