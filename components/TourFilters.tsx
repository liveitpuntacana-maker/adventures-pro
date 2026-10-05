"use client";

import { useTranslations } from "next-intl";
import { type PriceRange, type SortOrder } from "@/lib/tourFilters";

export type TourTypeOption = {
  slug: string;
  title: string;
};

type TourFiltersProps = {
  sortOrder: SortOrder;
  priceRange: PriceRange;
  onSortOrderChange: (value: SortOrder) => void;
  onPriceRangeChange: (value: PriceRange) => void;
  /** Tour types present in the list; when given, a type dropdown is shown. */
  tourTypes?: TourTypeOption[];
  activeTourType?: string;
  onTourTypeChange?: (value: string) => void;
  /**
   * Bands that have at least one tour in the current list. A band that would
   * lead to an empty page is not offered; when fewer than two remain the whole
   * price dropdown goes, since there is nothing left to choose between.
   */
  availablePriceRanges?: PriceRange[];
};

const priceRanges: PriceRange[] = ["all", "upTo100", "100to200", "200to500", "over500"];

export const priceRangeLabelKey: Record<
  PriceRange,
  "priceAll" | "priceUpTo100" | "price100to200" | "price200to500" | "priceOver500"
> = {
  all: "priceAll",
  upTo100: "priceUpTo100",
  "100to200": "price100to200",
  "200to500": "price200to500",
  over500: "priceOver500",
};

// Dropdowns, not chips: a row of chips that scrolls sideways gives no hint
// that there is more to the right, and a select is understood at a glance.
const selectClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15";
const labelClass = "mb-1 block text-xs font-medium text-slate-500";

export default function TourFilters({
  sortOrder,
  priceRange,
  onSortOrderChange,
  onPriceRangeChange,
  tourTypes,
  activeTourType = "all",
  onTourTypeChange,
  availablePriceRanges,
}: TourFiltersProps) {
  const t = useTranslations("TourFilters");
  const showTypes = Boolean(tourTypes && tourTypes.length > 1 && onTourTypeChange);
  const visiblePriceRanges = availablePriceRanges
    ? priceRanges.filter((range) => range === "all" || availablePriceRanges.includes(range))
    : priceRanges;
  const showPrices = !availablePriceRanges || availablePriceRanges.length > 1;

  return (
    <div className="mt-4 grid grid-cols-2 gap-3 lg:flex lg:items-end lg:gap-4">
      {showTypes ? (
        <div className="min-w-0 lg:w-64">
          <label htmlFor="tour-type" className={labelClass}>
            {t("typeLabel")}
          </label>
          <select
            id="tour-type"
            value={activeTourType}
            onChange={(event) => onTourTypeChange?.(event.target.value)}
            className={selectClass}
          >
            <option value="all">{t("typeAll")}</option>
            {(tourTypes ?? []).map((type) => (
              <option key={type.slug} value={type.slug}>
                {type.title}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {showPrices ? (
        <div className="min-w-0 lg:w-56">
          <label htmlFor="tour-price" className={labelClass}>
            {t("priceLabel")}
          </label>
          <select
            id="tour-price"
            value={priceRange}
            onChange={(event) => onPriceRangeChange(event.target.value as PriceRange)}
            className={selectClass}
          >
            {visiblePriceRanges.map((range) => (
              <option key={range} value={range}>
                {t(priceRangeLabelKey[range])}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="col-span-2 min-w-0 lg:col-span-1 lg:ml-auto lg:w-56">
        <label htmlFor="tour-sort" className={labelClass}>
          {t("sortLabel")}
        </label>
        <select
          id="tour-sort"
          value={sortOrder}
          onChange={(event) => onSortOrderChange(event.target.value as SortOrder)}
          className={selectClass}
        >
          <option value="asc">{t("sortLowToHigh")}</option>
          <option value="desc">{t("sortHighToLow")}</option>
        </select>
      </div>
    </div>
  );
}
