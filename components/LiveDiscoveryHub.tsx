"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Clock3 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { urlFor } from "@/sanity/lib/image";
import { formatTourPrice, peekBookingUrl } from "@/lib/tourPrice";
import { tourExcursionPath } from "@/lib/tourSlug";
import {
  compareTourPriceZeroLast,
  parseNumericPrice,
} from "@/lib/tourFilters";

export type DiscoveryTour = {
  _id: string;
  title?: string;
  slug?: string;
  mainImage?: unknown;
  category?: string;
  duration?: string;
  currency?: string;
  peekProId?: string;
  priceTag?: string | null;
  pricing?: Array<{ price?: number | string | null }>;
};

type PriceRange = "all" | "under-100" | "100-200" | "premium";

const categoryFilters = [
  { id: "all", label: "All" },
  { id: "water-tours", label: "Water" },
  { id: "land-tours", label: "Land" },
  { id: "combo-tours", label: "Combos" },
  { id: "private-tours", label: "Private" },
  { id: "multidays-tours", label: "Multidays" },
] as const;

const priceRangeFilters: { id: PriceRange; label: string }[] = [
  { id: "all", label: "All Budgets" },
  { id: "under-100", label: "Under $100" },
  { id: "100-200", label: "$100-$200" },
  { id: "premium", label: "Premium" },
];

const getFirstPricingValue = (tour: DiscoveryTour) =>
  parseNumericPrice(tour.pricing?.[0]?.price);

const buildImageUrl = (image: unknown) => {
  try {
    return image ? urlFor(image).width(900).height(700).fit("crop").url() : null;
  } catch {
    return null;
  }
};

export default function LiveDiscoveryHub({ tours }: { tours?: DiscoveryTour[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activePriceRange, setActivePriceRange] = useState<PriceRange>("all");

  const filteredTours = useMemo(() => {
    const filtered = (tours ?? []).filter((tour) => {
      const safeCategory = tour.category ?? "";
      const matchesCategory = activeCategory === "all" || safeCategory === activeCategory;

      const firstPrice = getFirstPricingValue(tour);
      const matchesPriceRange =
        activePriceRange === "all" ||
        (activePriceRange === "under-100" &&
          Number.isFinite(firstPrice) &&
          firstPrice >= 0 &&
          firstPrice < 100) ||
        (activePriceRange === "100-200" &&
          Number.isFinite(firstPrice) &&
          firstPrice >= 100 &&
          firstPrice <= 200) ||
        (activePriceRange === "premium" && Number.isFinite(firstPrice) && firstPrice > 200);

      return matchesCategory && matchesPriceRange;
    });

    return [...filtered].sort((a, b) =>
      compareTourPriceZeroLast(getFirstPricingValue(a), getFirstPricingValue(b), "asc"),
    );
  }, [activePriceRange, activeCategory, tours]);

  const resultsHref = useMemo(() => {
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (activePriceRange !== "all") params.set("budget", activePriceRange);
    const query = params.toString();
    return query ? `/excursions?${query}` : "/excursions";
  }, [activePriceRange, activeCategory]);

  return (
    <div>
      <h2 className="mb-6 text-center text-3xl font-semibold tracking-tight text-[#0a192f] md:text-4xl">
        Live Discovery Hub
      </h2>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {categoryFilters.map((item) => {
          const isActive = activeCategory === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveCategory(item.id)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                isActive
                  ? "border-[#0a192f] bg-[#0a192f] text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {priceRangeFilters.map((item) => {
          const isActive = activePriceRange === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePriceRange(item.id)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                isActive
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {filteredTours.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <p className="text-lg font-semibold text-[#0a192f]">No tours found</p>
          <p className="mt-2 text-sm text-slate-600">
            Try a different category or budget to discover more experiences.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredTours.map((tour) => {
            const firstPricingValue = getFirstPricingValue(tour);
            const computedPrice = Number.isFinite(firstPricingValue)
              ? formatTourPrice(tour.currency ?? "USD", firstPricingValue)
              : "Consultar precio";
            const priceTag = tour.priceTag?.trim() || "";
            const slug = tour.slug ?? "";
            const title = tour.title ?? "Tour";
            const imageUrl = buildImageUrl(tour.mainImage);
            const peekUrl = tour.peekProId ? peekBookingUrl(tour.peekProId) : "#";

            return (
              <article
                key={tour._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative">
                  <Link href={tourExcursionPath(slug)} aria-label={title} className="block">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
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
                  <h3 className="text-xl font-semibold leading-tight text-slate-900">
                    <Link
                      href={tourExcursionPath(slug)}
                      className="transition hover:text-orange-600"
                    >
                      {title}
                    </Link>
                  </h3>
                  <p className="text-lg font-semibold text-blue-950">
                    From {computedPrice}
                    {priceTag ? (
                      <span className="ml-1.5 text-sm font-medium text-slate-500">
                        ({priceTag})
                      </span>
                    ) : null}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                      href={peekUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600"
                    >
                      Book Now
                    </a>
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

      {(activeCategory !== "all" || activePriceRange !== "all") && (
        <div className="mt-8 text-center">
          <Link
            href={resultsHref}
            className="inline-flex rounded-full border border-[#0a192f] px-6 py-3 text-sm font-semibold text-[#0a192f] transition hover:bg-[#0a192f] hover:text-white"
          >
            Ver todos los resultados
          </Link>
        </div>
      )}
    </div>
  );
}
