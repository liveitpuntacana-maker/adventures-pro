"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { formatTourPrice, withPriceTag } from "@/lib/tourPrice";
import { tourExcursionPath } from "@/lib/tourSlug";
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

function rateKey(rate: TransferPricingRate) {
  return rate._key ?? rate.vehicle._id;
}

export default function HeroSearch() {
  const t = useTranslations("HeroSearch");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const originOptions = useMemo(
    () =>
      [
        { code: "PUJ" as const, label: t("originPUJ") },
        { code: "LRM" as const, label: t("originLRM") },
      ] satisfies { code: OriginCode; label: string }[],
    [t],
  );

  const [tab, setTab] = useState<"activities" | "transfers">("activities");
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
  const [selectedRate, setSelectedRate] = useState<TransferPricingRate | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const activityWrapRef = useRef<HTMLDivElement>(null);

  const filteredHotels = useMemo(() => {
    const q = hotelQuery.trim().toLowerCase();
    if (!q) return transferHotels;
    return transferHotels.filter((hotel) => hotel.title.toLowerCase().includes(q));
  }, [hotelQuery, transferHotels]);

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

  const clearHotelField = () => {
    setHotelQuery("");
    setSelectedHotel(null);
    setSelectedRate(null);
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
    setSelectedRate(null);
  }, [origin, tripType, selectedHotel?._id]);

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
      ? buildPeekTransferHref(
          selectedRate,
          tripType,
          originOptions.find((o) => o.code === origin)?.label ?? "",
        )
      : "";

  const transferReady = Boolean(selectedHotel && selectedRate);

  return (
    <div className="rounded-2xl bg-white p-1 shadow-lg md:p-2">
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

      <div className="p-4 md:p-6">
        {tab === "activities" ? (
          <div ref={activityWrapRef} className="relative pb-6 md:pb-8">
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
                      ? "bg-blue-800 text-white shadow-sm"
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
                      ? "bg-blue-800 text-white shadow-sm"
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
              <select
                id="hero-origin"
                value={origin}
                onChange={(e) => {
                  setOrigin(e.target.value as OriginCode);
                  setSelectedRate(null);
                }}
                className="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
              >
                {originOptions.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.label}
                  </option>
                ))}
              </select>
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
                    setSelectedRate(null);
                    setListOpen(true);
                  }}
                  onFocus={() => {
                    setListOpen(true);
                    if (selectedHotel) {
                      setSelectedHotel(null);
                      setSelectedRate(null);
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
                            setSelectedRate(null);
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
                ) : hotelQuery.trim().length > 0 && !transfersLoading ? (
                  <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-lg">
                    {t("noHotelsMatch")}
                  </div>
                ) : null
              ) : null}
            </div>

            {selectedHotel ? (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-blue-950">
                  {t("selectVehicle")}
                </p>
                {availableRates.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {availableRates.map((rate) => {
                      const active = selectedRate ? rateKey(selectedRate) === rateKey(rate) : false;
                      const price =
                        tripType === "one_way" ? rate.priceOneWay : rate.priceRoundTrip;
                      const priceLabel = formatTourPrice("USD", price);
                      const vehicle = rate.vehicle;
                      return (
                        <button
                          key={rateKey(rate)}
                          type="button"
                          onClick={() => setSelectedRate(rate)}
                          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                            active
                              ? "border-cyan-500 bg-cyan-50 shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            {vehicle.imageUrl ? (
                              <Image
                                src={vehicle.imageUrl}
                                alt={vehicle.title}
                                fill
                                className="object-cover object-center"
                                sizes="80px"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">{vehicle.title}</p>
                            <p className="text-xs text-slate-600">{vehicle.capacity}</p>
                            <p className="mt-1 text-sm font-semibold text-blue-950">{priceLabel}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
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
                  if (!transferReady) e.preventDefault();
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
