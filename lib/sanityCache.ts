/**
 * Cache tags for Sanity-backed data.
 *
 * Every query tags itself with the document types it reads, so the Sanity
 * webhook at /api/revalidate can expire exactly the pages a publish affects
 * instead of rebuilding the whole site.
 */
export const SANITY_TAGS = {
  tour: "sanity:tour",
  category: "sanity:category",
  destination: "sanity:destination",
  post: "sanity:post",
  landingPage: "sanity:landingPage",
  review: "sanity:review",
} as const;

export type SanityTag = (typeof SANITY_TAGS)[keyof typeof SANITY_TAGS];

/** Maps a Sanity document `_type` to its cache tag. */
export function tagForDocumentType(type?: string | null): SanityTag | null {
  if (!type) return null;
  const key = type as keyof typeof SANITY_TAGS;
  return SANITY_TAGS[key] ?? null;
}

/**
 * Revalidation windows. Content is refreshed on publish via the webhook, so
 * these are a safety net rather than the primary freshness mechanism — long
 * enough that Googlebot and users are served from cache almost every time.
 */
export const REVALIDATE = {
  /** Catalogue pages: tours, categories, destinations, home. */
  catalog: 3600,
  /** Editorial content, which changes less often. */
  blog: 86400,
} as const;

/** Standard fetch options for a cached Sanity query. */
export function sanityCache(tags: SanityTag[], revalidate: number = REVALIDATE.catalog) {
  return { next: { revalidate, tags } };
}
