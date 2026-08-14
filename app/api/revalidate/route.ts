import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { SANITY_TAGS, tagForDocumentType } from "@/lib/sanityCache";

/**
 * Sanity webhook endpoint.
 *
 * Pages are served from cache (ISR) instead of being rebuilt on every request.
 * When an editor publishes in Sanity, this expires only the tags affected by
 * that document type, so the change is live within seconds without giving up
 * the cache for the rest of the site.
 *
 * Configure in Sanity: Manage → API → Webhooks
 *   URL:      https://www.adventuresfinder.com/api/revalidate
 *   Trigger:  Create, Update, Delete
 *   Secret:   the value of SANITY_REVALIDATE_SECRET
 *   Payload:  {"_type": "_type"}
 *
 * Sanity does not send the secret itself: it signs the request body with it
 * and sends an HMAC in the sanity-webhook-signature header, which is what we
 * verify here. The body must be read as raw text — re-encoding the parsed JSON
 * changes the bytes and breaks the signature.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { revalidated: false, message: "SANITY_REVALIDATE_SECRET is not set" },
      { status: 500 },
    );
  }

  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const rawBody = await request.text();

  if (!signature || !(await isValidSignature(rawBody, signature, secret))) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid signature" },
      { status: 401 },
    );
  }

  let documentType: string | undefined;

  try {
    documentType = (JSON.parse(rawBody) as { _type?: string })?._type;
  } catch {
    // A webhook without a JSON body falls through to the full refresh below.
  }

  const tag = tagForDocumentType(documentType);
  const tags = tag ? [tag] : Object.values(SANITY_TAGS);

  for (const item of tags) {
    // "max" gives stale-while-revalidate: visitors keep getting the cached
    // page instantly while the fresh one is generated in the background.
    revalidateTag(item, "max");
  }

  return NextResponse.json({
    revalidated: true,
    documentType: documentType ?? "unknown",
    tags,
    now: Date.now(),
  });
}
