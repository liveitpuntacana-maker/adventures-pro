import type { MetadataRoute } from "next";
import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";
import {
  STATIC_PATHS,
  blogPathFromSlug,
  buildSitemapEntry,
  categoryPathFromSlug,
  destinationPathFromSlug,
  shouldIndexListing,
  tourPathFromSlug,
} from "@/lib/seo";
import { SANITY_TAGS, sanityCache } from "@/lib/sanityCache";

export const revalidate = 3600;

// tourCount mirrors the noindex rule on the listing pages: a sitemap that
// submits noindexed URLs shows up as an error in Search Console.
const categoriesQuery = groq`*[_type == "category" && defined(slug.current)]{
  "slug": slug.current,
  _updatedAt,
  "tourCount": count(*[_type == "tour" && (
    ^.slug.current in categories[]->slug.current ||
    category->slug.current == ^.slug.current
  )])
}`;

const destinationsQuery = groq`*[_type == "destination" && defined(slug.current)]{
  "slug": slug.current,
  _updatedAt,
  "tourCount": count(*[_type == "tour" && destination->slug.current == ^.slug.current])
}`;

const toursQuery = groq`*[_type == "tour" && defined(slug.current)]{
  "slug": slug.current,
  _updatedAt
}`;

const postsQuery = groq`*[_type == "post" && defined(slug.current)]{
  "slug": slug.current,
  publishedAt,
  _updatedAt
}`;

type SlugRow = { slug: string; _updatedAt?: string };
type ListingRow = SlugRow & { tourCount?: number };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, destinations, tours, posts] = await Promise.all([
    client
      .fetch<ListingRow[]>(
        categoriesQuery,
        {},
        sanityCache([SANITY_TAGS.category, SANITY_TAGS.tour]),
      )
      .catch(() => []),
    client
      .fetch<ListingRow[]>(
        destinationsQuery,
        {},
        sanityCache([SANITY_TAGS.destination, SANITY_TAGS.tour]),
      )
      .catch(() => []),
    client
      .fetch<SlugRow[]>(toursQuery, {}, sanityCache([SANITY_TAGS.tour]))
      .catch(() => []),
    client
      .fetch<Array<SlugRow & { publishedAt?: string }>>(
        postsQuery,
        {},
        sanityCache([SANITY_TAGS.post]),
      )
      .catch(() => []),
  ]);

  // Static pages carry no lastmod: a timestamp that changes on every crawl
  // teaches Google to ignore the field entirely.
  const staticEntries = STATIC_PATHS.flatMap((pathname) => buildSitemapEntry(pathname));

  const categoryEntries = categories
    .filter((category) => shouldIndexListing(category.tourCount))
    .flatMap((category) =>
      buildSitemapEntry(categoryPathFromSlug(category.slug), category._updatedAt),
    );

  const destinationEntries = destinations
    .filter((destination) => shouldIndexListing(destination.tourCount))
    .flatMap((destination) =>
      buildSitemapEntry(
        destinationPathFromSlug(destination.slug),
        destination._updatedAt,
      ),
    );

  const tourEntries = tours.flatMap((tour) =>
    buildSitemapEntry(tourPathFromSlug(tour.slug), tour._updatedAt),
  );

  const postEntries = posts.flatMap((post) =>
    buildSitemapEntry(
      blogPathFromSlug(post.slug),
      post._updatedAt ?? post.publishedAt,
    ),
  );

  return [
    ...staticEntries,
    ...categoryEntries,
    ...destinationEntries,
    ...tourEntries,
    ...postEntries,
  ];
}
