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
 *   URL:     https://www.adventuresfinder.com/api/revalidate
 *   Trigger: create, update, delete, publish, unpublish
 *   Secret:  the value of SANITY_REVALIDATE_SECRET
 *   Payload: {"_type": "_type"}
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { revalidated: false, message: "SANITY_REVALIDATE_SECRET is not set" },
      { status: 500 },
    );
  }

  const provided =
    request.headers.get("sanity-webhook-secret") ??
    request.nextUrl.searchParams.get("secret");

  if (provided !== secret) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid secret" },
      { status: 401 },
    );
  }

  let documentType: string | undefined;

  try {
    const body = (await request.json()) as { _type?: string };
    documentType = body?._type;
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
