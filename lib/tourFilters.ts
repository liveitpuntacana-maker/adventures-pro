export type SortOrder = "asc" | "desc";
/**
 * Consecutive bands: each one starts where the previous one ends, so picking a
 * different chip always changes the list. The old ranges were cumulative
 * ("up to 200", "up to 500") and every one of them began at zero, which made
 * most of the catalogue show up under all of them. A tour priced exactly at a
 * boundary belongs to the lower band.
 */
export type PriceRange = "all" | "upTo100" | "100to200" | "200to500" | "over500";

export const PRICE_BANDS: Record<Exclude<PriceRange, "all">, { min: number; max: number }> = {
  upTo100: { min: 0, max: 100 },
  "100to200": { min: 100, max: 200 },
  "200to500": { min: 200, max: 500 },
  over500: { min: 500, max: Number.POSITIVE_INFINITY },
};

/** The band a price falls in, or null when there is no paid price to place. */
export function priceBandOf(price: number): Exclude<PriceRange, "all"> | null {
  if (!Number.isFinite(price) || price <= 0) return null;
  const bands = Object.keys(PRICE_BANDS) as Array<Exclude<PriceRange, "all">>;
  return bands.find((band) => price > PRICE_BANDS[band].min && price <= PRICE_BANDS[band].max) ?? null;
}

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
  const band = PRICE_BANDS[range];
  return price > band.min && price <= band.max;
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
