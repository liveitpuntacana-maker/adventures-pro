import type { MetadataRoute } from "next";
import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";
import {
  STATIC_PATHS,
  blogPathFromSlug,
  buildSitemapEntry,
  categoryPathFromSlug,
  destinationPathFromSlug,
  tourPathFromSlug,
} from "@/lib/seo";
import { SANITY_TAGS, sanityCache } from "@/lib/sanityCache";

export const revalidate = 3600;

const categoriesQuery = groq`*[_type == "category" && defined(slug.current)]{
  "slug": slug.current,
  _updatedAt
}`;

const destinationsQuery = groq`*[_type == "destination" && defined(slug.current)]{
  "slug": slug.current,
  _updatedAt
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, destinations, tours, posts] = await Promise.all([
    client
      .fetch<SlugRow[]>(categoriesQuery, {}, sanityCache([SANITY_TAGS.category]))
      .catch(() => []),
    client
      .fetch<SlugRow[]>(
        destinationsQuery,
        {},
        sanityCache([SANITY_TAGS.destination]),
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
  const staticEntries = STATIC_PATHS.map((pathname) => buildSitemapEntry(pathname));

  const categoryEntries = categories.map((category) =>
    buildSitemapEntry(categoryPathFromSlug(category.slug), category._updatedAt),
  );

  const destinationEntries = destinations.map((destination) =>
    buildSitemapEntry(
      destinationPathFromSlug(destination.slug),
      destination._updatedAt,
    ),
  );

  const tourEntries = tours.map((tour) =>
    buildSitemapEntry(tourPathFromSlug(tour.slug), tour._updatedAt),
  );

  const postEntries = posts.map((post) =>
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
