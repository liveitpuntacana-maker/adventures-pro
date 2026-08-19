"use client";

/**
 * Sends remote images to the CDN that already hosts them instead of through
 * Vercel's optimiser.
 *
 * Sanity and Unsplash both resize, crop and re-encode on their own CDN, and the
 * app was already asking them to: `urlFor()` builds URLs like
 * `?rect=0,135,1080,810&w=1200&h=900&fit=crop&auto=format`. Routing the result
 * through `/_next/image` paid Vercel to redo work that was already done, once
 * per breakpoint — eight variants per photo, across eighty tours. That
 * exhausted the plan's remote-image quota and every optimised image on the site
 * started answering `402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED`.
 *
 * Files under /public are served straight from the deployment. Declaring a
 * custom loader turns off Next's own endpoint entirely — /_next/image answers
 * 404 once `loader: "custom"` is set — so there is nothing to delegate to and
 * they go out as they are. They are few and already sized for their slots.
 */

type LoaderArgs = {
  src: string;
  width: number;
  quality?: number;
};

const CDN_PREFIXES = ["https://cdn.sanity.io/", "https://images.unsplash.com/"];

const DEFAULT_QUALITY = 75;

/**
 * Rewrites the width on a CDN URL, keeping the aspect ratio intact.
 *
 * The existing `w`/`h` pair encodes a deliberate crop. Overwriting only `w`
 * would leave the old height in place and stretch the photo, so the height is
 * scaled by the same factor.
 */
function withWidth(rawUrl: string, width: number, quality: number): string {
  const url = new URL(rawUrl);
  const currentWidth = Number(url.searchParams.get("w"));
  const currentHeight = Number(url.searchParams.get("h"));

  if (currentWidth > 0 && currentHeight > 0) {
    const ratio = width / currentWidth;
    url.searchParams.set("h", String(Math.round(currentHeight * ratio)));
  }

  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality));
  url.searchParams.set("auto", "format");
  return url.toString();
}

export default function imageLoader({ src, width, quality }: LoaderArgs): string {
  const resolvedQuality = quality ?? DEFAULT_QUALITY;

  if (CDN_PREFIXES.some((prefix) => src.startsWith(prefix))) {
    try {
      return withWidth(src, width, resolvedQuality);
    } catch {
      // A malformed URL is not worth breaking the page over: serve it as-is.
      return src;
    }
  }

  // Local asset: no optimiser to hand it to, so it is served as authored.
  return src;
}
