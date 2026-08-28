import { NextRequest, NextResponse } from "next/server";
import { syncSoroFeedToSanity } from "@/lib/soro/sync";
import { isAuthorizedCronRequest } from "@/lib/cronAuth";

export const runtime = "nodejs";
/**
 * The route is no longer on a schedule (see vercel.json): the Soro feed was
 * paused in favour of articles written against the real catalogue. It stays
 * deployed so the import can be triggered by hand if the feed is ever resumed.
 *
 * 60s is the Hobby ceiling without Fluid compute. One article costs ~45s now
 * that the existence check is a single query; raising this to 300 (which needs
 * Fluid) is only worth it to drain a backlog.
 */
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request, "soro-sync")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncSoroFeedToSanity();
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[soro-sync] fatal error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
