import { groq } from "next-sanity";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import type { AppLocale } from "@/i18n/routing";
import { buildPageMetadata, truncateMetaDescription } from "@/lib/seo";
import { slugLookupVariants, tourExcursionPath } from "@/lib/tourSlug";

export type TourSeoData = {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  currency?: string | null;
  price?: number | string | null;
  mainImage?: { asset?: unknown } | null;
};

export const tourSeoQuery = groq`*[_type == "tour" && slug.current in $slugCandidates][0]{
  "title": coalesce(select($locale == "fr-ca" => title.frCA, title[$locale]), title.en, title.es, title.frCA),
  "slug": slug.current,
  "description": coalesce(
    select($locale == "fr-ca" => infoTour.frCA, infoTour[$locale]),
    infoTour.en,
    infoTour.es,
    infoTour.frCA
  ),
  "currency": coalesce(currency, mainTour->currency, "USD"),
  "price": coalesce(pricing[0].price, mainTour->pricing[0].price),
  "mainImage": coalesce(listingImage, mainTour->listingImage)
}`;

export function tourImageUrl(mainImage?: { asset?: unknown } | null): string | null {
  if (!mainImage?.asset) return null;
  try {
    return urlFor(mainImage).width(1200).height(630).fit("crop").url();
  } catch {
    return null;
  }
}

export async function fetchTourSeoData(
  slug: string,
  locale: AppLocale,
): Promise<TourSeoData | null> {
  return client
    .fetch<TourSeoData | null>(
      tourSeoQuery,
      {
        slugCandidates: slugLookupVariants(slug),
        locale,
      },
      { cache: "no-store" },
    )
    .catch(() => null);
}

export async function buildTourMetadata({
  locale,
  slug,
}: {
  locale: AppLocale;
  slug: string;
}): Promise<Metadata> {
  const pathname = tourExcursionPath(slug);
  const tour = await fetchTourSeoData(slug, locale);

  if (!tour?.title?.trim()) {
    return buildPageMetadata({ locale, pathname });
  }

  const title = tour.title.trim();
  const rawDescription = (tour.description ?? "")
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");
  const description = rawDescription
    ? truncateMetaDescription(rawDescription)
    : truncateMetaDescription(
        `${title} — book this Punta Cana experience with Adventures Finder Pro.`,
      );
  const image = tourImageUrl(tour.mainImage);

  return buildPageMetadata({
    locale,
    pathname,
    title,
    description,
    image,
    type: "website",
  });
}
