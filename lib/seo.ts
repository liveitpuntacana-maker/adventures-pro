import type { Metadata } from "next";
import type { MetadataRoute } from "next";
import { routing, type AppLocale } from "@/i18n/routing";
import { categoryExcursionPath } from "@/lib/categoryPath";
import { destinationExcursionPath } from "@/lib/destinationPath";
import { tourExcursionPath } from "@/lib/tourSlug";

export const SITE_URL = "https://www.adventuresfinder.com";
export const SITE_NAME = "Adventures Finder Pro";
export const SITE_LOGO_URL = `${SITE_URL}/images/icon.png`;
export const SITE_DESCRIPTION =
  "DMC in Punta Cana offering curated tours, excursions, and airport transfers with local experts.";

export const STATIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/transfers",
  "/excursions",
  "/blog",
  "/terms-and-conditions",
  "/cancellation-policy",
  "/faqs",
] as const;

export function hreflangForLocale(locale: AppLocale): string {
  return locale === "fr-ca" ? "fr" : locale;
}

/** BCP 47 value for the HTML lang attribute. */
export function htmlLangForLocale(locale: string): string {
  if (locale === "fr-ca") return "fr-CA";
  if (locale === "es") return "es";
  return "en";
}

export function localizedUrl(locale: AppLocale, pathname: string): string {
  const normalizedPath = pathname === "/" ? "" : pathname;
  return `${SITE_URL}/${locale}${normalizedPath}`;
}

export function buildLanguageAlternates(pathname: string): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const locale of routing.locales) {
    languages[hreflangForLocale(locale)] = localizedUrl(locale, pathname);
  }

  languages["x-default"] = localizedUrl("en", pathname);

  return languages;
}

export function truncateMetaDescription(value: string, maxLength = 160): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  const sliced = normalized.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).trimEnd()}…`;
}

export function buildPageMetadata({
  locale,
  pathname,
  title,
  description,
  image,
  type = "website",
}: {
  locale: AppLocale;
  pathname: string;
  title?: string;
  description?: string;
  image?: string | null;
  type?: "website" | "article";
}): Metadata {
  const canonical = localizedUrl(locale, pathname);
  const languages = buildLanguageAlternates(pathname);
  const ogImages = image ? [{ url: image }] : [{ url: SITE_LOGO_URL }];

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type,
      url: canonical,
      siteName: SITE_NAME,
      locale: htmlLangForLocale(locale).replace("-", "_"),
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: image ? [image] : [SITE_LOGO_URL],
    },
  };
}

export function buildTravelAgencyJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_LOGO_URL,
    description: SITE_DESCRIPTION,
    areaServed: {
      "@type": "Place",
      name: "Punta Cana",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Punta Cana",
        addressRegion: "La Altagracia",
        addressCountry: "DO",
      },
    },
  };
}

export function buildTourProductJsonLd({
  name,
  description,
  image,
  url,
  price,
  priceCurrency = "USD",
}: {
  name: string;
  description?: string | null;
  image?: string | null;
  url: string;
  price?: number | null;
  priceCurrency?: string;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["Product", "TouristTrip"],
    name,
    url,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
  };

  if (description) data.description = description;
  if (image) data.image = image;

  if (typeof price === "number" && Number.isFinite(price)) {
    data.offers = {
      "@type": "Offer",
      url,
      price: price.toFixed(2),
      priceCurrency: priceCurrency || "USD",
      availability: "https://schema.org/InStock",
    };
  }

  return data;
}

export function buildSitemapEntry(
  pathname: string,
  lastModified?: string | Date,
): MetadataRoute.Sitemap[number] {
  return {
    url: localizedUrl("en", pathname),
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    alternates: {
      languages: buildLanguageAlternates(pathname),
    },
  };
}

export function categoryPathFromSlug(slug: string): string {
  return categoryExcursionPath(slug);
}

export function destinationPathFromSlug(slug: string): string {
  return destinationExcursionPath(slug);
}

export function tourPathFromSlug(slug: string): string {
  return tourExcursionPath(slug);
}

export function blogPathFromSlug(slug: string): string {
  return `/blog/${slug.replace(/^\/+|\/+$/g, "")}`;
}
