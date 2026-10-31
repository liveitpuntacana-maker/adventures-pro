"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import TrackedWhatsAppLink from "@/components/meta/TrackedWhatsAppLink";
import { trackMetaEvent } from "@/lib/meta/trackEvent";
import { formatTourPrice, withPriceTag } from "@/lib/tourPrice";
import { tourExcursionPath } from "@/lib/tourSlug";
import { ADVENTURES_WHATSAPP_PHONE, getUniversalWhatsAppUrl } from "@/lib/utils/whatsapp";
import { type AppLocale } from "@/i18n/routing";

type TripType = "one_way" | "round_trip";

type OriginCode = "PUJ" | "LRM";

type TransferPricingRate = {
  _key?: string;
  priceOneWay: number;
  priceRoundTrip: number;
  peekOneWayUrl: string;
  peekRoundTripUrl: string;
  vehicle: {
    _id: string;
    title: string;
    capacity: string;
    imageUrl?: string;
  };
};

type TransferRouteOption = {
  _id: string;
  originCode: OriginCode;
  destinationZone: {
    id?: string;
    title?: string;
  };
  pricingRates: TransferPricingRate[];
};

type TransferHotelOption = {
  _id: string;
  title: string;
  zone: {
    id?: string;
    title?: string;
  };
};

type TransferData = {
  hotels: TransferHotelOption[];
  routes: TransferRouteOption[];
};

type SearchTourResult = {
  _id: string;
  title?: string;
  slug?: string;
  imageUrl?: string;
  currency?: string;
  priceTag?: string | null;
  pricing?: Array<{ price?: number | string | null }>;
};

const parseNumericPrice = (value?: string | number | null) => {
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
};

const formatResultPrice = (tour: SearchTourResult) => {
  const firstPrice = parseNumericPrice(tour.pricing?.[0]?.price);
  if (Number.isFinite(firstPrice)) {
    return withPriceTag(
      `From ${formatTourPrice(tour.currency ?? "USD", firstPrice)}`,
      tour.priceTag,
    );
  }
  return null;
};

function buildPeekTransferHref(
  rate: TransferPricingRate,
  tripType: TripType,
  originLabel: string,
) {
  const base = tripType === "one_way" ? rate.peekOneWayUrl : rate.peekRoundTripUrl;
  const url = new URL(base);
  url.searchParams.set("pickup_airport", originLabel);
  return url.toString();
}

type HeroSearchProps = {
  /** Shows only the airport-transfer form, with no tab bar (the /transfers page). */
  transfersOnly?: boolean;
};

export default function HeroSearch({ transfersOnly = false }: HeroSearchProps) {
  const t = useTranslations("HeroSearch");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  // PUJ first: it is the fallback while the routes load.
  const allOriginOptions = useMemo(
    () =>
      [
        { code: "PUJ" as const, label: t("originPUJ") },
        { code: "LRM" as const, label: t("originLRM") },
      ] satisfies { code: OriginCode; label: string }[],
    [t],
  );

  const [tab, setTab] = useState<"activities" | "transfers">(
    transfersOnly ? "transfers" : "activities",
  );
  const [activityQuery, setActivityQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchTourResult[]>([]);
  const [activityListOpen, setActivityListOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [tripType, setTripType] = useState<TripType>("one_way");
  const [origin, setOrigin] = useState<OriginCode>("PUJ");
  const [hotelQuery, setHotelQuery] = useState("");
  const [transferHotels, setTransferHotels] = useState<TransferHotelOption[]>([]);
  const [transferRoutes, setTransferRoutes] = useState<TransferRouteOption[]>([]);
  const [transfersLoading, setTransfersLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<TransferHotelOption | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const activityWrapRef = useRef<HTMLDivElement>(null);

  // An airport with no priced route yet would only show an empty vehicle list,
  // so it stays hidden until Sanity has at least one route for it.
  const originOptions = useMemo(() => {
    const withRoutes = allOriginOptions.filter((o) =>
      transferRoutes.some((route) => route.originCode === o.code),
    );
    return withRoutes.length > 0 ? withRoutes : allOriginOptions.slice(0, 1);
  }, [allOriginOptions, transferRoutes]);

  const originLabel = originOptions.find((o) => o.code === origin)?.label ?? "";
  const quoteHref = getUniversalWhatsAppUrl(
    ADVENTURES_WHATSAPP_PHONE,
    hotelQuery.trim()
      ? t("quoteWhatsappMessage", { origin: originLabel, destination: hotelQuery.trim() })
      : t("quoteWhatsappMessageNoDestination", { origin: originLabel }),
  );

  const filteredHotels = useMemo(() => {
    const q = hotelQuery.trim().toLowerCase();
    if (!q) return transferHotels;
    return transferHotels.filter((hotel) => hotel.title.toLowerCase().includes(q));
  }, [hotelQuery, transferHotels]);

  const hotelNotListed =
    !selectedHotel &&
    !transfersLoading &&
    hotelQuery.trim().length > 0 &&
    filteredHotels.length === 0;

  const activeRoute = useMemo(() => {
    if (!selectedHotel?.zone?.id) return null;
    return (
      transferRoutes.find(
        (route) =>
          route.originCode === origin && route.destinationZone?.id === selectedHotel.zone.id,
      ) ?? null
    );
  }, [origin, selectedHotel, transferRoutes]);

  const availableRates = useMemo(() => {
    return (activeRoute?.pricingRates ?? []).filter((rate) => rate.vehicle?._id);
  }, [activeRoute]);

  // The rate follows the hotel: a vehicle picked first keeps its choice when the
  // hotel changes, and simply has no rate if the new zone doesn't offer it.
  const selectedRate = useMemo(
    () => availableRates.find((rate) => rate.vehicle._id === selectedVehicleId) ?? null,
    [availableRates, selectedVehicleId],
  );

  // On /transfers the vehicles are shown before the hotel, so a choice made there survives
  // changes to the hotel. Everywhere else the choice is cleared when the hotel changes.
  const resetVehicle = () => {
    if (!transfersOnly) setSelectedVehicleId(null);
  };

  // Every vehicle sold from the chosen airport, cheapest first, for the pre-hotel view.
  const allVehicles = useMemo(() => {
    const lowest = new Map<string, { vehicle: TransferPricingRate["vehicle"]; price: number }>();
    for (const route of transferRoutes) {
      if (route.originCode !== origin) continue;
      for (const rate of route.pricingRates ?? []) {
        if (!rate.vehicle?._id) continue;
        const known = lowest.get(rate.vehicle._id);
        if (!known || rate.priceOneWay < known.price) {
          lowest.set(rate.vehicle._id, { vehicle: rate.vehicle, price: rate.priceOneWay });
        }
      }
    }
    return [...lowest.values()].sort((a, b) => a.price - b.price).map((entry) => entry.vehicle);
  }, [origin, transferRoutes]);

  const vehicleCards = transfersOnly
    ? allVehicles.map((vehicle) => ({
        vehicle,
        rate: availableRates.find((rate) => rate.vehicle._id === vehicle._id) ?? null,
      }))
    : availableRates.map((rate) => ({ vehicle: rate.vehicle, rate }));

  const clearHotelField = () => {
    setHotelQuery("");
    setSelectedHotel(null);
    resetVehicle();
    setListOpen(true);
  };

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setListOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    let active = true;
    const loadTransfers = async () => {
      try {
        const response = await fetch("/api/transfers");
        if (!response.ok) return;
        const data = (await response.json()) as TransferData;
        if (active) {
          setTransferHotels(data.hotels ?? []);
          setTransferRoutes(data.routes ?? []);
        }
      } catch {
        if (active) {
          setTransferHotels([]);
          setTransferRoutes([]);
        }
      } finally {
        if (active) {
          setTransfersLoading(false);
        }
      }
    };
    loadTransfers();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!transfersOnly) setSelectedVehicleId(null);
  }, [origin, tripType, selectedHotel?._id, transfersOnly]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!activityWrapRef.current?.contains(e.target as Node)) setActivityListOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const trimmed = activityQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: trimmed, locale });
        const response = await fetch(`/api/tours/search?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          setSearchResults([]);
          setIsSearching(false);
          return;
        }
        const data = (await response.json()) as { tours?: SearchTourResult[] };
        setSearchResults(data.tours ?? []);
        setIsSearching(false);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSearchResults([]);
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [activityQuery, locale]);

  const navigateToTour = useCallback(
    (slug: string) => {
      setActivityListOpen(false);
      setActivityQuery("");
      setSearchResults([]);
      router.push(tourExcursionPath(slug));
    },
    [router],
  );

  const handleActivitySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActivityListOpen(true);
  };

  const transferHref =
    selectedRate && selectedHotel
      ? buildPeekTransferHref(selectedRate, tripType, originLabel)
      : "";

  const transferReady = Boolean(selectedHotel && selectedRate);

  // Picking a vehicle and pressing Search is the transfer equivalent of "Book Now".
  const trackTransferClick = () => {
    if (!selectedRate || !selectedHotel) return;
    const price = tripType === "one_way" ? selectedRate.priceOneWay : selectedRate.priceRoundTrip;
    trackMetaEvent("AddToCart", {
      content_ids: ["airport-transfer"],
      content_name: `Airport transfer to ${selectedHotel.title}`,
      content_type: "product",
      ...(Number.isFinite(price) ? { value: price, currency: "USD" } : {}),
    });
  };

  return (
    <div className="rounded-2xl bg-white p-1 shadow-lg md:p-2">
      {transfersOnly ? null : (
      <div className="flex border-b border-slate-200 px-2 pt-1 md:px-3">
        <button
          type="button"
          onClick={() => setTab("activities")}
          className={`relative px-4 py-3 text-sm font-semibold transition md:px-6 md:text-base ${
            tab === "activities"
              ? "text-blue-950"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {t("tabActivities")}
          {tab === "activities" ? (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-800" />
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setTab("transfers")}
          className={`relative px-4 py-3 text-sm font-semibold transition md:px-6 md:text-base ${
            tab === "transfers"
              ? "text-blue-950"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {t("tabAirportTransfers")}
          {tab === "transfers" ? (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-800" />
          ) : null}
        </button>
      </div>
      )}

      <div className="p-4 md:p-6">
        {tab === "activities" ? (
          <div ref={activityWrapRef} className="relative">
            <form
              onSubmit={handleActivitySubmit}
              className="flex flex-col gap-3 md:flex-row md:items-start"
            >
              <div className="relative w-full">
                <input
                  type="search"
                  name="q"
                  autoComplete="off"
                  value={activityQuery}
                  onChange={(event) => {
                    setActivityQuery(event.target.value);
                    setActivityListOpen(true);
                  }}
                  onFocus={() => setActivityListOpen(true)}
                  placeholder={t("searchPlaceholder")}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
                />
                {activityListOpen && activityQuery.trim().length > 0 ? (
                  searchResults.length > 0 ? (
                    <ul className="absolute z-50 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                      {searchResults.map((tour) => {
                        const slug = tour.slug ?? "";
                        const title = tour.title ?? "Tour";
                        const priceLabel = formatResultPrice(tour);

                        return (
                          <li key={tour._id}>
                            <button
                              type="button"
                              className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-slate-50"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => {
                                if (slug) navigateToTour(slug);
                              }}
                            >
                              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                {tour.imageUrl ? (
                                  <Image
                                    src={tour.imageUrl}
                                    alt={title}
                                    fill
                                    className="object-cover object-center"
                                    sizes="48px"
                                  />
                                ) : null}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {title}
                                </p>
                                {priceLabel ? (
                                  <p className="text-xs font-medium text-blue-950">{priceLabel}</p>
                                ) : null}
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : !isSearching ? (
                    <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-lg">
                      {t("noToursFound")}
                    </div>
                  ) : null
                ) : null}
              </div>
              <button
                type="submit"
                className="h-12 w-full shrink-0 rounded-xl bg-orange-500 px-6 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:bg-orange-600 md:w-auto"
              >
                {t("searchButton")}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-950">
                {t("tripType")}
              </p>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setTripType("one_way")}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                    tripType === "one_way"
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-slate-600 hover:text-blue-950"
                  }`}
                >
                  {t("oneWay")}
                </button>
                <button
                  type="button"
                  onClick={() => setTripType("round_trip")}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                    tripType === "round_trip"
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-slate-600 hover:text-blue-950"
                  }`}
                >
                  {t("roundTrip")}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="hero-origin"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-blue-950"
              >
                {t("origin")}
              </label>
              {originOptions.length > 1 ? (
                <select
                  id="hero-origin"
                  value={origin}
                  onChange={(e) => {
                    setOrigin(e.target.value as OriginCode);
                    resetVehicle();
                  }}
                  className="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
                >
                  {originOptions.map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p
                  id="hero-origin"
                  className="flex h-12 w-full items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800"
                >
                  {originLabel}
                </p>
              )}
            </div>

            <div ref={wrapRef} className="relative">
              <label
                htmlFor="hero-hotel"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-blue-950"
              >
                {t("hotelDestination")}
              </label>
              <div className="relative">
                <input
                  id="hero-hotel"
                  type="text"
                  autoComplete="off"
                  value={hotelQuery}
                  onChange={(e) => {
                    setHotelQuery(e.target.value);
                    setSelectedHotel(null);
                    resetVehicle();
                    setListOpen(true);
                  }}
                  onFocus={() => {
                    setListOpen(true);
                    if (selectedHotel) {
                      setSelectedHotel(null);
                      resetVehicle();
                    }
                  }}
                  placeholder={t("hotelSearchPlaceholder")}
                  className="h-12 w-full rounded-xl border border-slate-200 py-2 pl-4 pr-11 text-sm text-slate-800 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
                />
                {hotelQuery.trim().length > 0 || selectedHotel ? (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={t("clearHotel")}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => {
                      clearHotelField();
                    }}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" strokeWidth={2} />
                  </button>
                ) : null}
              </div>
              {listOpen ? (
                filteredHotels.length > 0 ? (
                  <ul className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                    {filteredHotels.map((hotel) => (
                      <li key={hotel._id}>
                        <button
                          type="button"
                          className="w-full px-4 py-3 text-left text-sm text-blue-950 transition hover:bg-blue-50"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSelectedHotel(hotel);
                            resetVehicle();
                            setHotelQuery(hotel.title);
                            setListOpen(false);
                          }}
                        >
                          <span className="block font-medium">{hotel.title}</span>
                          {hotel.zone?.title ? (
                            <span className="mt-0.5 block text-xs text-slate-500">{hotel.zone.title}</span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null
              ) : null}
              {hotelNotListed ? (
                <p className="mt-2 text-sm text-slate-500">{t("noHotelsMatch")}</p>
              ) : null}
              {/* Not every address is in the list: anything else is quoted by the team. */}
              <p className="mt-2 text-sm text-slate-600">
                {t("hotelNotListed")}{" "}
                <TrackedWhatsAppLink
                  href={quoteHref}
                  source="transfer_quote_whatsapp"
                  className="font-semibold text-blue-800 underline underline-offset-2 transition hover:text-blue-950"
                >
                  {t("quoteViaWhatsapp")}
                </TrackedWhatsAppLink>
              </p>
            </div>

            {selectedHotel || transfersOnly ? (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-blue-950">
                  {t("selectVehicle")}
                </p>
                {transfersOnly && transfersLoading ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2" aria-hidden="true">
                    {[0, 1, 2, 3].map((n) => (
                      <div key={n} className="h-28 animate-pulse rounded-xl bg-slate-100" />
                    ))}
                  </div>
                ) : vehicleCards.length > 0 && (!selectedHotel || availableRates.length > 0) ? (
                  <>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {vehicleCards.map(({ vehicle, rate }) => {
                        const active = selectedVehicleId === vehicle._id && Boolean(rate || !selectedHotel);
                        const unavailable = Boolean(selectedHotel) && !rate;
                        const showPrice = Boolean(selectedHotel && rate);
                        const price = rate
                          ? tripType === "one_way"
                            ? rate.priceOneWay
                            : rate.priceRoundTrip
                          : null;
                        return (
                          <button
                            key={vehicle._id}
                            type="button"
                            disabled={unavailable}
                            onClick={() => setSelectedVehicleId(vehicle._id)}
                            className={`flex w-full items-center gap-4 rounded-xl border p-3 text-left transition ${
                              transfersOnly ? "md:p-4" : ""
                            } ${
                              unavailable
                                ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-50"
                                : active
                                  ? "border-orange-500 bg-orange-50 shadow-sm"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div
                              className={`relative shrink-0 overflow-hidden rounded-lg bg-slate-100 ${
                                transfersOnly ? "h-20 w-28 md:h-24 md:w-32" : "h-16 w-20"
                              }`}
                            >
                              {vehicle.imageUrl ? (
                                <Image
                                  src={vehicle.imageUrl}
                                  alt={vehicle.title}
                                  fill
                                  className="object-cover object-center"
                                  sizes="128px"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-900 md:text-base">
                                {vehicle.title}
                              </p>
                              <p className="text-xs text-slate-600 md:text-sm">{vehicle.capacity}</p>
                              {showPrice && price != null ? (
                                <p className="mt-1 text-sm font-semibold text-blue-950 md:text-base">
                                  {formatTourPrice("USD", price)}
                                </p>
                              ) : unavailable ? (
                                <p className="mt-1 text-xs text-slate-500">{t("vehicleUnavailable")}</p>
                              ) : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {transfersOnly && !selectedHotel ? (
                      <p className="mt-3 text-sm text-slate-500">{t("selectHotelForPrice")}</p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm text-slate-500">{t("noVehiclesAvailable")}</p>
                )}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 pt-1 md:flex-row md:items-center md:justify-end">
              <a
                href={transferReady ? transferHref : undefined}
                aria-disabled={!transferReady}
                onClick={(e) => {
                  if (!transferReady) {
                    e.preventDefault();
                    return;
                  }
                  trackTransferClick();
                }}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex h-12 w-full items-center justify-center rounded-xl px-8 text-sm font-semibold uppercase tracking-wide transition md:ml-auto md:w-auto ${
                  transferReady
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/30 hover:bg-orange-600"
                    : "cursor-not-allowed bg-slate-200 text-slate-500"
                }`}
              >
                {t("searchButton")}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
