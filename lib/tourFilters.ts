export type SortOrder = "asc" | "desc";
export type PriceRange = "all" | "upTo200" | "upTo500" | "over500";

export type TourWithPrice = {
  price?: number | string | null;
  pricing?: Array<{ price?: number | string | null }>;
};

export function parseNumericPrice(value?: string | number | null): number {
  if (value == null) return Number.NaN;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return Number.NaN;
  const trimmed = value.trim();
  if (!trimmed) return Number.NaN;
  const cleaned = trimmed.replace(/[^\d.,-]/g, "");
  if (!cleaned) return Number.NaN;
  let normalized = cleaned;
  if (cleaned.includes(",") && cleaned.includes(".")) {
    normalized = cleaned.replace(/,/g, "");
  } else if (cleaned.includes(",") && !cleaned.includes(".")) {
    normalized = /,\d{1,2}$/.test(cleaned) ? cleaned.replace(",", ".") : cleaned.replace(/,/g, "");
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

/**
 * First row that costs money.
 *
 * Eight tours advertise infants or young children at 0 on purpose, and that
 * belongs on the page — but it is not what the tour costs. Reading row zero
 * blindly turns those into "From USD 0" on the card and sorts them to the top
 * of a cheapest-first list.
 */
export function firstPaidPrice(
  rows?: Array<{ price?: number | string | null }> | null,
): number {
  for (const row of rows ?? []) {
    const value = parseNumericPrice(row?.price);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return Number.NaN;
}

export function getTourNumericPrice(tour: TourWithPrice): number {
  if (tour.price != null) {
    const parsed = parseNumericPrice(tour.price);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return firstPaidPrice(tour.pricing);
}

export function matchesPriceRange(price: number, range: PriceRange): boolean {
  if (range === "all") return true;
  if (!Number.isFinite(price)) return false;
  if (range === "upTo200") return price <= 200;
  if (range === "upTo500") return price <= 500;
  return price > 500;
}

export function compareTourPriceZeroLast(
  priceA: number,
  priceB: number,
  sortOrder: SortOrder = "asc",
): number {
  const aFinite = Number.isFinite(priceA);
  const bFinite = Number.isFinite(priceB);
  const aVal = aFinite ? priceA : sortOrder === "asc" ? Infinity : -Infinity;
  const bVal = bFinite ? priceB : sortOrder === "asc" ? Infinity : -Infinity;

  if (aVal === 0 && bVal !== 0) return 1;
  if (bVal === 0 && aVal !== 0) return -1;

  return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
}

export function sortToursPriceZeroLast<T extends TourWithPrice>(
  tours: T[],
  sortOrder: SortOrder = "asc",
): T[] {
  return [...tours].sort((a, b) =>
    compareTourPriceZeroLast(
      getTourNumericPrice(a),
      getTourNumericPrice(b),
      sortOrder,
    ),
  );
}

export function filterAndSortTours<T extends TourWithPrice>(
  tours: T[],
  sortOrder: SortOrder,
  priceRange: PriceRange,
): T[] {
  const filtered = tours.filter((tour) =>
    matchesPriceRange(getTourNumericPrice(tour), priceRange),
  );

  return sortToursPriceZeroLast(filtered, sortOrder);
}
