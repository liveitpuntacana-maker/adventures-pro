import { groq } from "next-sanity";
import { getTranslations } from "next-intl/server";
import TourCard from "@/components/TourCard";
import { client } from "@/sanity/lib/client";
import { peekBookingUrl } from "@/lib/tourPrice";
import { tourRatingProjection } from "@/lib/tourRating";
import { SANITY_TAGS, sanityCache } from "@/lib/sanityCache";
import type { AppLocale } from "@/i18n/routing";

function numericPrice(tour: { pricing?: Array<{ price?: number | string | null }> }): number {
  const raw = tour.pricing?.[0]?.price;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const parsed = Number(String(raw ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

type RelatedTour = {
  _id: string;
  title: string;
  slug: string;
  listingImage?: { asset: unknown };
  highlightBadge?: string;
  peekProId?: string;
  priceTag?: string | null;
  currency?: string;
  duration?: string;
  pricing?: Array<{ price?: number | string | null }>;
  rating?: number | null;
  reviewsCount?: number | null;
};

const projection = `
  _id,
  "title": coalesce(select($locale == "fr-ca" => title.frCA, title[$locale]), title.en, title.es, title.frCA),
  "slug": slug.current,
  "listingImage": coalesce(listingImage, mainTour->listingImage),
  highlightBadge,
  peekProId,
  "priceTag": coalesce(priceTag, mainTour->priceTag),
  "currency": coalesce(currency, mainTour->currency, "USD"),
  "duration": coalesce(
    select($locale == "fr-ca" => duration.frCA, duration[$locale]),
    duration.en, duration.es, duration.frCA
  ),
  pricing[]{price},
  "price": coalesce(pricing[0].price, mainTour->pricing[0].price, 0),
  ${tourRatingProjection}
`;

/**
 * Tours sharing the current tour's category.
 *
 * The whole category is fetched, not the first four: picking a fixed slice
 * would always surface the same cheapest tours and leave the rest of the
 * catalogue with no inbound links at all.
 */
const sameCategoryQuery = groq`*[
  _type == "tour" &&
  defined(slug.current) &&
  slug.current != $slug &&
  (category->slug.current == $category || $category in categories[]->slug.current)
] | order(price asc) { ${projection} }`;

/** Fallback for categories with nothing else in them. */
const featuredFallbackQuery = groq`*[
  _type == "tour" &&
  defined(slug.current) &&
  slug.current != $slug &&
  isFeatured == true
] | order(price asc) [0...4] { ${projection} }`;

/**
 * Related tours at the foot of a tour page.
 *
 * Every tour page used to be a dead end: no outgoing links to any other tour,
 * so authority stopped there and visitors had nowhere to go but back.
 */
export default async function RelatedTours({
  locale,
  slug,
  category,
  price,
}: {
  locale: AppLocale;
  slug: string;
  category: string;
  /** Lead price of the current tour, used to pick comparable ones. */
  price?: number;
}) {
  const t = await getTranslations({ locale, namespace: "RelatedTours" });

  let tours = await client
    .fetch<RelatedTour[]>(
      sameCategoryQuery,
      { locale, slug, category },
      sanityCache([SANITY_TAGS.tour, SANITY_TAGS.category]),
    )
    .catch(() => []);

  // Closest by price: relevant for the visitor, and it spreads inbound links
  // across the catalogue instead of piling them on the four cheapest tours.
  if (tours.length > 4) {
    const reference = Number.isFinite(price) ? (price as number) : 0;
    tours = [...tours]
      .sort(
        (a, b) =>
          Math.abs(numericPrice(a) - reference) - Math.abs(numericPrice(b) - reference),
      )
      .slice(0, 4);
  }

  if (tours.length < 2) {
    const fallback = await client
      .fetch<RelatedTour[]>(
        featuredFallbackQuery,
        { locale, slug },
        sanityCache([SANITY_TAGS.tour]),
      )
      .catch(() => []);

    const seen = new Set(tours.map((tour) => tour.slug));
    tours = [...tours, ...fallback.filter((tour) => !seen.has(tour.slug))].slice(0, 4);
  }

  if (tours.length === 0) return null;

  return (
    <section className="mt-16 border-t border-slate-200 pt-12 md:mt-20">
      <h2 className="text-2xl font-semibold tracking-tight text-[#0a192f] md:text-3xl">
        {t("title")}
      </h2>
      <p className="mt-2 text-sm text-slate-600 md:text-base">{t("subtitle")}</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tours.map((tour) => (
          <TourCard
            key={tour._id}
            tour={{
              title: tour.title,
              slug: tour.slug,
              duration: tour.duration,
              listingImage: tour.listingImage,
              highlightBadge: tour.highlightBadge,
              pricing: tour.pricing,
              currency: tour.currency,
              priceTag: tour.priceTag,
              peekUrl: tour.peekProId ? peekBookingUrl(tour.peekProId) : "#",
              rating: tour.rating,
              reviewsCount: tour.reviewsCount,
            }}
          />
        ))}
      </div>
    </section>
  );
}
