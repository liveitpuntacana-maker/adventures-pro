import { groq } from "next-sanity";
import { getTranslations } from "next-intl/server";
import TourCard from "@/components/TourCard";
import { client } from "@/sanity/lib/client";
import { peekBookingUrl } from "@/lib/tourPrice";
import { tourRatingProjection } from "@/lib/tourRating";
import { SANITY_TAGS, sanityCache } from "@/lib/sanityCache";
import type { AppLocale } from "@/i18n/routing";

type BlogTour = {
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

const query = groq`*[
  _type == "tour" &&
  defined(slug.current) &&
  slug.current in $slugs
]{
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
  ${tourRatingProjection}
}`;

/**
 * Tours curated for a specific article, shown at its foot.
 *
 * Sanity decides what exists: a slug that no longer resolves drops out of the
 * grid instead of rendering a card that leads to a 404.
 */
export default async function BlogRelatedTours({
  locale,
  slugs,
}: {
  locale: AppLocale;
  /** Curated tour slugs, in the order they should appear. */
  slugs: readonly string[];
}) {
  if (slugs.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "BlogRelatedTours" });

  const tours = await client
    .fetch<BlogTour[]>(
      query,
      { locale, slugs: [...slugs] },
      sanityCache([SANITY_TAGS.tour]),
    )
    .catch(() => []);

  // GROQ returns documents in its own order; the curated order is the one that
  // puts the most relevant tour for this article first.
  const ordered = slugs
    .map((slug) => tours.find((tour) => tour.slug === slug))
    .filter((tour): tour is BlogTour => Boolean(tour))
    .slice(0, 4);

  if (ordered.length === 0) return null;

  return (
    <section className="mt-16 border-t border-slate-200 pt-12">
      <h2 className="text-2xl font-semibold tracking-tight text-blue-950 md:text-3xl">
        {t("title")}
      </h2>
      <p className="mt-2 text-sm text-slate-600 md:text-base">{t("subtitle")}</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {ordered.map((tour) => (
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
