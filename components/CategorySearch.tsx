"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import TourCard from "@/components/TourCard";
import TourFilters, {
  priceRangeLabelKey,
  type TourTypeOption,
} from "@/components/TourFilters";
import { peekBookingUrl } from "@/lib/tourPrice";
import {
  filterAndSortTours,
  getTourNumericPrice,
  matchesPriceRange,
  priceBandOf,
  sortToursPriceZeroLast,
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
  /** Category plus any extra categories, for the tour-type filter. */
  types?: TourTypeOption[];
};

type CategorySearchProps = {
  tours: CategoryTour[];
  categorySlug: string;
  messagesNamespace?: "CategoryPage" | "DestinationPage";
  /** Adds the tour-type dropdown; destination pages mix land, water, golf, etc. */
  showTypeFilter?: boolean;
  /** Name of this page's destination or category, for the "not here, but there" notice. */
  scopeLabel?: string;
  /** What a match from outside this page is labelled with. */
  elsewhereBy?: "destination" | "category";
};

type ElsewhereTour = CategoryTour & { destinationTitle?: string | null; categoryTitle?: string | null };

const BANDS = ["upTo100", "100to200", "200to500", "over500"] as const;

function TourGrid({ tours, gridKey }: { tours: CategoryTour[]; gridKey: string }) {
  return (
    <div
      key={gridKey}
      className="mt-5 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
    >
      {tours.map((tour) => {
        const slug = tour.slug ?? "";
        const title = tour.title ?? "Tour";
        const peekUrl = tour.peekProId ? peekBookingUrl(tour.peekProId) : "#";

        return (
          <TourCard
            key={tour._id}
            compactOnMobile
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
  );
}

export default function CategorySearch({
  tours,
  categorySlug,
  messagesNamespace = "CategoryPage",
  showTypeFilter = false,
  scopeLabel = "",
  elsewhereBy = "destination",
}: CategorySearchProps) {
  const t = useTranslations(messagesNamespace);
  const locale = useLocale();
  const tFilters = useTranslations("TourFilters");
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [tourType, setTourType] = useState("all");

  const scoped = useMemo(() => tours.filter((tour) => Boolean(tour.slug)), [tours]);
  const [catalogMatches, setCatalogMatches] = useState<ElsewhereTour[]>([]);

  // Only the types this list actually has, most tours first, so an option never
  // leads to an empty page and the common ones come first.
  const tourTypes = useMemo(() => {
    if (!showTypeFilter) return [];
    const found = new Map<string, { type: TourTypeOption; count: number }>();
    for (const tour of scoped) {
      for (const type of tour.types ?? []) {
        if (!type.slug || !type.title) continue;
        const entry = found.get(type.slug);
        if (entry) entry.count += 1;
        else found.set(type.slug, { type, count: 1 });
      }
    }
    return [...found.values()].sort((x, y) => y.count - x.count).map((entry) => entry.type);
  }, [showTypeFilter, scoped]);

  const hasType = (tour: CategoryTour) =>
    tourType === "all" || Boolean(tour.types?.some((type) => type.slug === tourType));

  // Price bands that exist within the chosen type. This deliberately ignores the
  // search text: the dropdown should not change while someone is typing.
  const typeTours = useMemo(
    () => scoped.filter(hasType),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scoped, tourType],
  );
  const availablePriceRanges = useMemo(
    () =>
      BANDS.filter((range) =>
        typeTours.some((tour) => matchesPriceRange(getTourNumericPrice(tour), range)),
      ),
    [typeTours],
  );

  // A band picked earlier may disappear when the type changes (or the whole
  // dropdown does, below two bands); fall back to all rather than keep filtering
  // by something the visitor can no longer see or undo.
  const activePriceRange: PriceRange =
    availablePriceRanges.length > 1 && (availablePriceRanges as PriceRange[]).includes(priceRange)
      ? priceRange
      : "all";

  const trimmedQuery = query.trim().toLowerCase();

  // The page only holds its own destination or category, but someone searching
  // for "Santo Domingo" while on Punta Cana still wants that tour. Ask the whole
  // catalogue, and show whatever this page does not already have.
  useEffect(() => {
    // Below two characters nothing is requested; `elsewhere` below already ignores
    // whatever an earlier query left in state, so there is nothing to reset here.
    if (trimmedQuery.length < 2) return;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query.trim(), locale });
        const response = await fetch(`/api/tours/search?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = response.ok ? ((await response.json()) as { tours?: ElsewhereTour[] }) : null;
        setCatalogMatches(data?.tours ?? []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setCatalogMatches([]);
      }
    }, 350);
    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [trimmedQuery, query, locale]);

  const elsewhere = useMemo(() => {
    if (trimmedQuery.length < 2) return [];
    const here = new Set(scoped.map((tour) => tour.slug));
    return sortToursPriceZeroLast(
      catalogMatches.filter((tour) => tour.slug && !here.has(tour.slug)),
      sortOrder,
    );
  }, [catalogMatches, scoped, trimmedQuery, sortOrder]);


  const matchesQuery = (tour: CategoryTour) =>
    !trimmedQuery || (tour.title ?? "").toLowerCase().includes(trimmedQuery);

  // A search is never silenced by a filter. Tours that match the text but fall
  // outside the selected type or price are kept apart and shown under a note
  // that says where they are, instead of vanishing.
  const { inFilter, outsideFilter } = useMemo(() => {
    const textMatches = scoped.filter(matchesQuery);
    const within = textMatches.filter(
      (tour) => hasType(tour) && matchesPriceRange(getTourNumericPrice(tour), activePriceRange),
    );
    const withinIds = new Set(within.map((tour) => tour._id));
    return {
      inFilter: filterAndSortTours(within, sortOrder, "all"),
      outsideFilter: trimmedQuery
        ? sortToursPriceZeroLast(
            textMatches.filter((tour) => !withinIds.has(tour._id)),
            sortOrder,
          )
        : [],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoped, trimmedQuery, tourType, activePriceRange, sortOrder]);

  const outsideNote = useMemo(() => {
    if (outsideFilter.length === 0) return null;

    const activeFilters: string[] = [];
    if (tourType !== "all") {
      const type = tourTypes.find((item) => item.slug === tourType);
      if (type) activeFilters.push(type.title);
    }
    if (activePriceRange !== "all") {
      activeFilters.push(tFilters(priceRangeLabelKey[activePriceRange]));
    }

    const where = new Set<string>();
    for (const tour of outsideFilter) {
      if (tourType !== "all" && !hasType(tour)) {
        for (const type of tour.types ?? []) where.add(type.title);
      }
      if (activePriceRange !== "all") {
        const band = priceBandOf(getTourNumericPrice(tour));
        if (band && band !== activePriceRange) where.add(tFilters(priceRangeLabelKey[band]));
      }
    }

    return tFilters(inFilter.length === 0 ? "searchOutsideEmpty" : "searchOutsideMore", {
      query: query.trim(),
      filters: activeFilters.join(" · "),
      where: [...where].join(", "),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outsideFilter, inFilter.length, tourType, activePriceRange, tourTypes, query, tFilters]);

  const elsewhereNote = useMemo(() => {
    if (elsewhere.length === 0) return null;
    const where = [
      ...new Set(
        elsewhere
          .map((tour) => (elsewhereBy === "category" ? tour.categoryTitle : tour.destinationTitle))
          .filter((label): label is string => Boolean(label)),
      ),
    ].join(", ");
    const hasHere = inFilter.length > 0 || outsideFilter.length > 0;
    return tFilters(hasHere ? "searchElsewhereMore" : "searchElsewhereEmpty", {
      query: query.trim(),
      scope: scopeLabel,
      where,
    });
  }, [elsewhere, elsewhereBy, scopeLabel, query, tFilters, inFilter.length, outsideFilter.length]);

  const handleResetFilters = () => {
    setSortOrder("asc");
    setPriceRange("all");
    setTourType("all");
  };

  const nothingToShow =
    inFilter.length === 0 && outsideFilter.length === 0 && elsewhere.length === 0;
  const showPriceRangeEmpty =
    scoped.length > 0 && nothingToShow && !trimmedQuery && activePriceRange !== "all";
  const gridKey = `${categorySlug}-${sortOrder}-${activePriceRange}-${tourType}`;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-12 pt-0 md:px-10 md:pb-16 lg:px-12">
      {/* The page title is the h1; the tour cards are h3, so give them an h2 to
          sit under instead of skipping a level. */}
      {scopeLabel ? <h2 className="sr-only">{scopeLabel}</h2> : null}
      {/* Only the search bar stays pinned while scrolling; the filters scroll
          away with the page so they do not take screen space. */}
      <div className="sticky top-20 z-30 -mx-6 bg-white px-6 pb-3 pt-3 shadow-[0_4px_6px_-4px_rgba(0,0,0,0.1)] md:-mx-10 md:px-10 xl:top-24">
        <form
          onSubmit={(event) => event.preventDefault()}
          className="mx-auto flex max-w-3xl flex-row items-center gap-2 md:gap-3"
        >
          <input
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
          />
          <button
            type="submit"
            className="h-12 shrink-0 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:bg-orange-600 md:px-6"
          >
            {t("searchButton")}
          </button>
        </form>
      </div>

      {scoped.length > 0 ? (
        <TourFilters
          sortOrder={sortOrder}
          priceRange={activePriceRange}
          availablePriceRanges={availablePriceRanges}
          onSortOrderChange={setSortOrder}
          onPriceRangeChange={setPriceRange}
          tourTypes={tourTypes}
          activeTourType={tourType}
          onTourTypeChange={setTourType}
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
            className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl border border-blue-800 bg-white px-6 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
          >
            {tFilters("resetFilters")}
          </button>
        </div>
      ) : nothingToShow ? (
        <p className="mt-16 text-center text-lg text-slate-600">{t("noResults")}</p>
      ) : (
        <>
          {inFilter.length > 0 ? <TourGrid tours={inFilter} gridKey={gridKey} /> : null}
          {outsideNote ? (
            <p
              role="status"
              className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900"
            >
              {outsideNote}
            </p>
          ) : null}
          {outsideFilter.length > 0 ? (
            <TourGrid tours={outsideFilter} gridKey={`${gridKey}-outside`} />
          ) : null}
          {elsewhereNote ? (
            <p
              role="status"
              className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900"
            >
              {elsewhereNote}
            </p>
          ) : null}
          {elsewhere.length > 0 ? (
            <TourGrid tours={elsewhere} gridKey={`${gridKey}-elsewhere`} />
          ) : null}
        </>
      )}
    </div>
  );
}
