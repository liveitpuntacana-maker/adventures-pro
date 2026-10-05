"use client";

import Image from "next/image";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { type AppLocale } from "@/i18n/routing";
import { firstPaidPrice } from "@/lib/tourFilters";
import { formatTourPrice, withPriceTag } from "@/lib/tourPrice";
import { tourExcursionPath } from "@/lib/tourSlug";

type SearchTourResult = {
  _id: string;
  title?: string;
  slug?: string;
  imageUrl?: string;
  currency?: string;
  priceTag?: string | null;
  pricing?: Array<{ price?: number | string | null }>;
};

/**
 * Search in the header, on every page.
 *
 * The only activity search used to live in the home hero, so as soon as the
 * visitor scrolled there was no way to search at all — and on a phone, where
 * most of the traffic is, the header is the one thing that stays on screen.
 * It uses the same endpoint as the hero search.
 */
export default function HeaderSearch() {
  const t = useTranslations("HeroSearch");
  const tNav = useTranslations("Nav");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchTourResult[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  // A page change (any link, the back button) closes the panel.
  useEffect(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
  }, [pathname]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: trimmed, locale });
        const response = await fetch(`/api/tours/search?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = response.ok ? ((await response.json()) as { tours?: SearchTourResult[] }) : null;
        setResults(data?.tours ?? []);
        setSearching(false);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([]);
          setSearching(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query, locale]);

  const go = (slug: string) => {
    close();
    router.push(tourExcursionPath(slug));
  };

  const hasQuery = query.trim().length > 0;

  return (
    <div ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={tNav("search")}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50"
      >
        {open ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-50 border-t border-slate-200 bg-white shadow-lg">
          <div className="mx-auto w-full max-w-3xl px-4 py-4 md:px-10">
            <input
              ref={inputRef}
              type="search"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              className="h-12 w-full rounded-xl border border-slate-200 px-4 text-base text-slate-800 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
            />
            {hasQuery ? (
              results.length > 0 ? (
                <ul className="mt-3 max-h-[60vh] overflow-auto rounded-xl border border-slate-200 bg-white py-1">
                  {results.map((tour) => {
                    const slug = tour.slug ?? "";
                    const title = tour.title ?? "Tour";
                    const price = firstPaidPrice(tour.pricing);
                    const priceLabel = Number.isFinite(price)
                      ? withPriceTag(
                          `From ${formatTourPrice(tour.currency ?? "USD", price)}`,
                          tour.priceTag,
                        )
                      : null;

                    return (
                      <li key={tour._id}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-slate-50"
                          onClick={() => {
                            if (slug) go(slug);
                          }}
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            {tour.imageUrl ? (
                              <Image
                                src={tour.imageUrl}
                                alt=""
                                fill
                                className="object-cover object-center"
                                sizes="48px"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
                            {priceLabel ? (
                              <p className="text-xs font-medium text-blue-950">{priceLabel}</p>
                            ) : null}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : !searching ? (
                <p className="mt-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-500">
                  {t("noToursFound")}
                </p>
              ) : null
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
