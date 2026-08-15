import { NextResponse, type NextRequest } from "next/server";
import { getSanityWriteClient } from "@/lib/soro/sanityWriteClient";
import { CHAT_LOG_RETENTION_DAYS } from "@/lib/tour-chat/chatLog";

export const runtime = "nodejs";

/**
 * Deletes chat transcripts older than the retention window.
 *
 * Keeping conversations forever has no upside: 90 days covers a full season,
 * which is what makes the demand patterns readable, and anything older is
 * just accumulated risk.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - CHAT_LOG_RETENTION_DAYS);

  try {
    const client = getSanityWriteClient();
    const result = await client.delete({
      query: `*[_type == "chatSession" && lastMessageAt < $cutoff]`,
      params: { cutoff: cutoff.toISOString() },
    });

    const deleted = Array.isArray(result?.results) ? result.results.length : 0;

    return NextResponse.json({
      ok: true,
      deleted,
      retentionDays: CHAT_LOG_RETENTION_DAYS,
      cutoff: cutoff.toISOString(),
    });
  } catch (error) {
    console.error("[prune-chat-logs] failed", error);
    return NextResponse.json({ ok: false, error: "delete_failed" }, { status: 500 });
  }
}
