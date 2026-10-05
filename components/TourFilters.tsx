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
  /** Tour types present in the list; when given, a type row is shown first. */
  tourTypes?: TourTypeOption[];
  activeTourType?: string;
  onTourTypeChange?: (value: string) => void;
};

const priceRanges: PriceRange[] = ["all", "upTo100", "100to200", "200to500", "over500"];

const priceRangeLabelKey: Record<
  PriceRange,
  "priceAll" | "priceUpTo100" | "price100to200" | "price200to500" | "priceOver500"
> = {
  all: "priceAll",
  upTo100: "priceUpTo100",
  "100to200": "price100to200",
  "200to500": "price200to500",
  over500: "priceOver500",
};

const chipBase = "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300";
const chipActive = "border-blue-800 bg-blue-800 text-white shadow-md shadow-blue-800/20";
const chipIdle = "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50";

export default function TourFilters({
  sortOrder,
  priceRange,
  onSortOrderChange,
  onPriceRangeChange,
  tourTypes,
  activeTourType = "all",
  onTourTypeChange,
}: TourFiltersProps) {
  const t = useTranslations("TourFilters");
  const showTypes = Boolean(tourTypes && tourTypes.length > 1 && onTourTypeChange);

  return (
    <div className="mt-6 flex flex-col gap-4">
      {showTypes ? (
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
          <span className="text-sm font-medium text-slate-600 lg:w-24 lg:shrink-0">
            {t("typeLabel")}
          </span>
          <div className="-mx-1 flex flex-nowrap items-center gap-2 overflow-x-auto px-1 pb-1 lg:flex-1 lg:flex-wrap lg:overflow-visible">
            {[{ slug: "all", title: t("typeAll") }, ...(tourTypes ?? [])].map((type) => (
              <button
                key={type.slug}
                type="button"
                onClick={() => onTourTypeChange?.(type.slug)}
                aria-pressed={activeTourType === type.slug}
                className={`${chipBase} ${activeTourType === type.slug ? chipActive : chipIdle}`}
              >
                {type.title}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="flex flex-col gap-2 lg:flex-1 lg:flex-row lg:items-center lg:gap-4">
          {showTypes ? (
            <span className="text-sm font-medium text-slate-600 lg:w-24 lg:shrink-0">
              {t("priceLabel")}
            </span>
          ) : null}
          <div className="-mx-1 flex flex-nowrap items-center gap-2 overflow-x-auto px-1 pb-1 lg:flex-1 lg:flex-wrap lg:overflow-visible">
            {priceRanges.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => onPriceRangeChange(range)}
                aria-pressed={priceRange === range}
                className={`${chipBase} ${priceRange === range ? chipActive : chipIdle}`}
              >
                {t(priceRangeLabelKey[range])}
              </button>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <label htmlFor="tour-sort" className="text-sm font-medium text-slate-600">
            {t("sortLabel")}
          </label>
          <select
            id="tour-sort"
            value={sortOrder}
            onChange={(event) => onSortOrderChange(event.target.value as SortOrder)}
            className="h-11 min-w-[200px] rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
          >
            <option value="asc">{t("sortLowToHigh")}</option>
            <option value="desc">{t("sortHighToLow")}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
