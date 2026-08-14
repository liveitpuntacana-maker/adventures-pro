import { cache } from "react";
import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, SITE_LOGO_URL } from "@/lib/seo";
import { SANITY_TAGS } from "@/lib/sanityCache";

/** Crops any Sanity image reference to the 1200x630 social card format. */
export function sanityOgImage(source: unknown): string | null {
  if (!source) return null;
  try {
    return urlFor(source as never)
      .width(OG_IMAGE_WIDTH)
      .height(OG_IMAGE_HEIGHT)
      .fit("crop")
      .auto("format")
      .url();
  } catch {
    return null;
  }
}

/** Same crop for an already-absolute URL coming from an external CDN. */
export function externalOgImage(url?: string | null): string | null {
  if (!url?.trim()) return null;
  return url.trim();
}

const fallbackImageQuery = groq`{
  "slider": *[_type == "landingPage"][0].sliderImages[0].asset->url,
  "featured": *[_type == "tour" && isFeatured == true && defined(listingImage.asset)][0].listingImage,
  "anyTour": *[_type == "tour" && defined(listingImage.asset)][0].listingImage
}`;

type FallbackImageResult = {
  slider?: string | null;
  featured?: unknown;
  anyTour?: unknown;
};

/**
 * Social image for pages that carry no image of their own.
 *
 * Falls back through the home hero slider, then any featured tour photo, and
 * only reaches the logo when Sanity has nothing at all — a real photo of a tour
 * earns far more clicks than a 512px icon.
 */
export const getDefaultOgImage = cache(async (): Promise<string> => {
  const result = await client
    .fetch<FallbackImageResult | null>(
      fallbackImageQuery,
      {},
      { next: { revalidate: 86400, tags: [SANITY_TAGS.landingPage, SANITY_TAGS.tour] } },
    )
    .catch(() => null);

  if (result?.slider?.trim()) {
    // Sanity asset URLs accept the same transform params as the builder.
    const separator = result.slider.includes("?") ? "&" : "?";
    return `${result.slider}${separator}w=${OG_IMAGE_WIDTH}&h=${OG_IMAGE_HEIGHT}&fit=crop&auto=format`;
  }

  return (
    sanityOgImage(result?.featured) ??
    sanityOgImage(result?.anyTour) ??
    SITE_LOGO_URL
  );
});

/** Resolves a page image, falling back to the shared default. */
export async function resolveOgImage(source: unknown): Promise<string> {
  return sanityOgImage(source) ?? (await getDefaultOgImage());
}
