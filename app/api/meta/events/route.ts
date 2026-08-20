import { NextRequest, NextResponse } from "next/server";
import type { MetaStandardEvent } from "@/lib/meta/constants";
import { sendMetaConversionEvent } from "@/lib/meta/conversionsApi";

const ALLOWED_EVENTS = new Set<MetaStandardEvent>([
  "PageView",
  "ViewContent",
  "Contact",
  "InitiateCheckout",
]);

type MetaEventRequestBody = {
  event_name?: MetaStandardEvent;
  event_id?: string;
  event_source_url?: string;
  custom_data?: Record<string, unknown>;
  fbp?: string;
  fbc?: string;
};

export async function POST(request: NextRequest) {
  // The server-side half of Meta tracking is optional: the browser pixel works
  // on its own. Without a token there is nothing to send, and answering 500 on
  // every page view put an error in every visitor's console and filled the
  // logs. 204 says "nothing to do here" without pretending it succeeded.
  if (!process.env.META_CONVERSIONS_API_TOKEN) {
    return new NextResponse(null, { status: 204 });
  }

  let body: MetaEventRequestBody;

  try {
    body = (await request.json()) as MetaEventRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { event_name, event_id, event_source_url, custom_data, fbp, fbc } = body;

  if (!event_name || !ALLOWED_EVENTS.has(event_name)) {
    return NextResponse.json({ error: "Invalid event_name" }, { status: 400 });
  }

  if (!event_id || typeof event_id !== "string") {
    return NextResponse.json({ error: "event_id is required" }, { status: 400 });
  }

  if (!event_source_url || typeof event_source_url !== "string") {
    return NextResponse.json({ error: "event_source_url is required" }, { status: 400 });
  }

  const clientIpAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined;
  const clientUserAgent = request.headers.get("user-agent") || undefined;

  try {
    const result = await sendMetaConversionEvent({
      eventName: event_name,
      eventId: event_id,
      eventSourceUrl: event_source_url,
      customData: custom_data,
      userData: {
        clientIpAddress,
        clientUserAgent,
        fbp,
        fbc,
      },
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("Meta Conversions API error:", error);
    return NextResponse.json(
      { error: "Failed to send event to Meta Conversions API" },
      { status: 500 },
    );
  }
}
