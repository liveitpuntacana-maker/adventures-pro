"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Clock3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TourFilters from "@/components/TourFilters";
import BookNowLink from "@/components/meta/BookNowLink";
import { urlFor } from "@/sanity/lib/image";
import {
  filterAndSortTours,
  getTourNumericPrice,
  type PriceRange,
  type SortOrder,
} from "@/lib/tourFilters";
import { formatTourPrice, peekBookingUrl } from "@/lib/tourPrice";
import { tourExcursionPath } from "@/lib/tourSlug";

export type ExcursionTour = {
  _id: string;
  title: string;
  slug: string;
  mainImage?: unknown;
  duration?: string;
  peekProId?: string;
  priceTag?: string | null;
  category?: {
    slug?: string;
    title?: string;
  };
  categorySlugs?: string[];
  currency: string;
  pricing?: Array<{ price?: number | string | null }>;
  price?: number | string | null;
};

type CatalogCategory = {
  slug: string;
  title: string;
};

export default function ExcursionesCatalog({
  tours,
  categories,
}: {
  tours: ExcursionTour[];
  categories: CatalogCategory[];
}) {
  const tFilters = useTranslations("TourFilters");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // The ?category= preselection is applied after mount instead of with
  // useSearchParams: that hook forces a Suspense bailout, which left the
  // prerendered HTML empty — no heading and none of the tour links for Google.
  useEffect(() => {
    const category = new URLSearchParams(window.location.search).get("category");
    if (category) setActiveCategory(category);
  }, []);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");

  const categoryFilteredTours = useMemo(() => {
    if (activeCategory === "all") return tours;
    return tours.filter(
      (tour) =>
        tour.category?.slug === activeCategory ||
        tour.categorySlugs?.includes(activeCategory),
    );
  }, [activeCategory, tours]);

  const displayTours = useMemo(
    () => filterAndSortTours(categoryFilteredTours, sortOrder, priceRange),
    [categoryFilteredTours, sortOrder, priceRange],
  );

  const handleResetFilters = () => {
    setSortOrder("asc");
    setPriceRange("all");
  };

  const showPriceRangeEmpty =
    tours.length > 0 &&
    categoryFilteredTours.length > 0 &&
    displayTours.length === 0 &&
    priceRange !== "all";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16 lg:px-12">
        <h1 className="text-center text-4xl font-bold tracking-tight text-[#0a192f] md:text-5xl">
          Excursions Catalog
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-center text-slate-600">
          Explore premium curated adventures across Punta Cana and filter by category.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {categories.map((category) => {
            const isActive = activeCategory === category.slug;
            return (
              <button
                key={category.slug}
                type="button"
                onClick={() => setActiveCategory(category.slug)}
                className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "border-[#0a192f] bg-[#0a192f] text-white shadow-md"
                    : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                {category.title}
              </button>
            );
          })}
        </div>

        {tours.length > 0 ? (
          <TourFilters
            sortOrder={sortOrder}
            priceRange={priceRange}
            onSortOrderChange={setSortOrder}
            onPriceRangeChange={setPriceRange}
          />
        ) : null}

        {showPriceRangeEmpty ? (
          <div className="mt-16 text-center">
            <p className="text-lg text-slate-600">{tFilters("noPriceRangeResults")}</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl border border-blue-800 bg-white px-6 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
            >
              {tFilters("resetFilters")}
            </button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayTours.map((tour) => {
              const firstPricingValue = getTourNumericPrice(tour);
              const computedPrice = Number.isFinite(firstPricingValue)
                ? formatTourPrice(tour.currency, firstPricingValue)
                : "Consultar precio";
              const priceTag = tour.priceTag?.trim() || "";
              const slug = tour.slug ?? "";
              const title = tour.title ?? "Tour";
              const peekUrl = tour.peekProId ? peekBookingUrl(tour.peekProId) : "#";

              return (
                <article
                  key={tour._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="relative">
                    <Link
                      href={tourExcursionPath(slug)}
                      aria-label={title}
                      className="block"
                    >
                      {tour.mainImage ? (
                        <Image
                          src={urlFor(tour.mainImage).width(1200).height(800).fit("crop").url()}
                          alt={title}
                          width={1200}
                          height={800}
                          className="h-56 w-full object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1400px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="h-56 w-full bg-slate-200" />
                      )}
                    </Link>
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                      <Clock3 className="h-4 w-4" />
                      <span>{tour.duration || "Duration on request"}</span>
                    </div>
                    <h2 className="text-xl font-semibold leading-tight text-slate-900">
                      <Link
                        href={tourExcursionPath(slug)}
                        className="transition hover:text-orange-600"
                      >
                        {title}
                      </Link>
                    </h2>
                    <p className="text-sm text-slate-600">
                      {tour.category?.title || tour.category?.slug || "Uncategorized"}
                    </p>
                    <p className="text-lg font-semibold text-blue-950">
                      From {computedPrice}
                      {priceTag ? (
                        <span className="ml-1.5 text-sm font-medium text-slate-500">
                          ({priceTag})
                        </span>
                      ) : null}
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <BookNowLink
                        href={peekUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        contentId={slug}
                        contentName={title}
                        value={Number.isFinite(firstPricingValue) ? firstPricingValue : undefined}
                        currency={tour.currency}
                        className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600"
                      >
                        Book Now
                      </BookNowLink>
                      <Link
                        href={tourExcursionPath(slug)}
                        className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                      >
                        More Info
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
