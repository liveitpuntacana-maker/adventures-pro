"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import TourCard from "@/components/TourCard";
import TourFilters from "@/components/TourFilters";
import { peekBookingUrl } from "@/lib/tourPrice";
import {
  filterAndSortTours,
  type PriceRange,
  type SortOrder,
} from "@/lib/tourFilters";

export type CategoryTour = {
  _id: string;
  title?: string;
  slug?: string;
  duration?: string;
  listingImage?: { asset: unknown };
  highlightBadge?: string;
  peekProId?: string;
  priceTag?: string | null;
  currency?: string;
  pricing?: Array<{ price?: number | string | null }>;
  price?: number | string | null;
  rating?: number | null;
  reviewsCount?: number | null;
};

type CategorySearchProps = {
  tours: CategoryTour[];
  categorySlug: string;
  messagesNamespace?: "CategoryPage" | "DestinationPage";
};

export default function CategorySearch({
  tours,
  categorySlug,
  messagesNamespace = "CategoryPage",
}: CategorySearchProps) {
  const t = useTranslations(messagesNamespace);
  const tFilters = useTranslations("TourFilters");
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");

  const textFilteredTours = useMemo(() => {
    const scoped = tours.filter((tour) => Boolean(tour.slug));
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return scoped;
    return scoped.filter((tour) =>
      (tour.title ?? "").toLowerCase().includes(trimmed),
    );
  }, [query, tours]);

  const displayTours = useMemo(
    () => filterAndSortTours(textFilteredTours, sortOrder, priceRange),
    [textFilteredTours, sortOrder, priceRange],
  );

  const handleResetFilters = () => {
    setSortOrder("asc");
    setPriceRange("all");
  };

  const showPriceRangeEmpty =
    tours.length > 0 &&
    textFilteredTours.length > 0 &&
    displayTours.length === 0 &&
    priceRange !== "all";

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16 lg:px-12">
      <form
        onSubmit={(event) => event.preventDefault()}
        className="mx-auto flex max-w-3xl flex-col gap-3 md:flex-row md:items-center"
      >
        <input
          type="search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
        />
        <button
          type="submit"
          className="h-12 w-full shrink-0 rounded-xl bg-orange-500 px-6 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:bg-orange-600 md:w-auto"
        >
          {t("searchButton")}
        </button>
      </form>

      {tours.length > 0 ? (
        <TourFilters
          sortOrder={sortOrder}
          priceRange={priceRange}
          onSortOrderChange={setSortOrder}
          onPriceRangeChange={setPriceRange}
        />
      ) : null}

      {tours.length === 0 ? (
        <p className="mt-16 text-center text-lg text-slate-600">{t("empty")}</p>
      ) : showPriceRangeEmpty ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-slate-600">{tFilters("noPriceRangeResults")}</p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-xl border border-blue-800 bg-white px-6 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
          >
            {tFilters("resetFilters")}
          </button>
        </div>
      ) : displayTours.length === 0 ? (
        <p className="mt-16 text-center text-lg text-slate-600">{t("noResults")}</p>
      ) : (
        <div
          key={`${categorySlug}-${sortOrder}-${priceRange}`}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {displayTours.map((tour) => {
            const slug = tour.slug ?? "";
            const title = tour.title ?? "Tour";
            const peekUrl = tour.peekProId ? peekBookingUrl(tour.peekProId) : "#";

            return (
              <TourCard
                key={tour._id}
                tour={{
                  title,
                  slug,
                  duration: tour.duration,
                  listingImage: tour.listingImage,
                  highlightBadge: tour.highlightBadge,
                  pricing: tour.pricing,
                  currency: tour.currency,
                  priceTag: tour.priceTag,
                  peekUrl,
                  rating: tour.rating,
                  reviewsCount: tour.reviewsCount,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
