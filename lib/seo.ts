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

/** Real contact data, kept in sync with components/Footer.tsx. */
export const SITE_CONTACT = {
  telephone: "+1-849-570-0202",
  email: "reservations@adventuresfinder.com",
  sameAs: [
    "https://www.facebook.com/adventurefinder1/",
    "https://www.instagram.com/adventuresfinder1",
    "https://www.youtube.com/@adventuresfinder",
  ],
} as const;

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/**
 * Minimum number of genuine customer reviews before we emit aggregateRating.
 * Google rarely renders stars below this, and marking up a single review
 * invites a structured-data spam action. Raise, never lower.
 */
export const MIN_REVIEWS_FOR_AGGREGATE_RATING = 3;

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

/**
 * hreflang map for a path.
 *
 * `availableLocales` limits the set to the locales that actually have
 * translated content. Declaring a translation that doesn't exist makes Google
 * treat the locales as duplicates of each other.
 */
export function buildLanguageAlternates(
  pathname: string,
  availableLocales?: readonly AppLocale[],
): Record<string, string> {
  const locales =
    availableLocales && availableLocales.length > 0
      ? routing.locales.filter((locale) => availableLocales.includes(locale))
      : routing.locales;

  const languages: Record<string, string> = {};

  for (const locale of locales) {
    languages[hreflangForLocale(locale)] = localizedUrl(locale, pathname);
  }

  const defaultLocale = locales.includes("en") ? "en" : locales[0];
  if (defaultLocale) {
    languages["x-default"] = localizedUrl(defaultLocale, pathname);
  }

  return languages;
}

/** Suffix appended by the title template in the locale layout. */
const TITLE_SUFFIX = " | Adventures Finder";
/** Google truncates around 60 characters; past that the tail is wasted. */
const MAX_TITLE_LENGTH = 60;

/**
 * Decides whether a page title should carry the brand suffix.
 *
 * Returns a plain string when the suffix fits (the layout template appends it),
 * or `{ absolute }` when it does not — so long CMS titles are not cut off by
 * Google, and titles that already end in the brand name never get it twice.
 */
export function resolveTitle(title: string): string | { absolute: string } {
  const clean = title.trim().replace(/\s*\|\s*Adventures Finder\s*$/i, "").trim();
  const withSuffix = clean.length + TITLE_SUFFIX.length;

  if (withSuffix <= MAX_TITLE_LENGTH) return clean;
  return { absolute: clean };
}

export function truncateMetaDescription(value: string, maxLength = 160): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  const sliced = normalized.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).trimEnd()}…`;
}

export type PageMetadataInput = {
  locale: AppLocale;
  pathname: string;
  title?: string;
  description?: string;
  image?: string | null;
  imageAlt?: string | null;
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  noIndex?: boolean;
  /** Locales that actually have translated content for this page. */
  availableLocales?: readonly AppLocale[];
};

/**
 * Canonical + hreflang + OG/Twitter for one page.
 *
 * `pathname` is the locale-less path (e.g. "/excursions/categoria/water-tours").
 * It must come from the route's own params, never from a request header, so the
 * page can still be statically prerendered.
 */
export function buildPageMetadata({
  locale,
  pathname,
  title,
  description,
  image,
  imageAlt,
  type = "website",
  publishedTime,
  modifiedTime,
  noIndex,
  availableLocales,
}: PageMetadataInput): Metadata {
  const canonical = localizedUrl(locale, pathname);
  const languages = buildLanguageAlternates(pathname, availableLocales);
  const resolvedImage = image || SITE_LOGO_URL;
  const resolvedAlt = imageAlt || title || SITE_NAME;
  const resolvedDescription = description
    ? truncateMetaDescription(description)
    : undefined;

  const ogImages = [
    {
      url: resolvedImage,
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      alt: resolvedAlt,
    },
  ];

  return {
    ...(title ? { title: resolveTitle(title) } : {}),
    ...(resolvedDescription ? { description: resolvedDescription } : {}),
    alternates: {
      canonical,
      languages,
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type,
      url: canonical,
      siteName: SITE_NAME,
      locale: htmlLangForLocale(locale).replace("-", "_"),
      ...(title ? { title } : {}),
      ...(resolvedDescription ? { description: resolvedDescription } : {}),
      images: ogImages,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
      ...(type === "article" && modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      ...(title ? { title } : {}),
      ...(resolvedDescription ? { description: resolvedDescription } : {}),
      images: [{ url: resolvedImage, alt: resolvedAlt }],
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  JSON-LD                                                                    */
/* -------------------------------------------------------------------------- */

/** Stable @id so every graph node points at the same organization. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function buildTravelAgencyJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_LOGO_URL,
    image: SITE_LOGO_URL,
    description: SITE_DESCRIPTION,
    telephone: SITE_CONTACT.telephone,
    email: SITE_CONTACT.email,
    priceRange: "$$",
    sameAs: [...SITE_CONTACT.sameAs],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Punta Cana",
      addressRegion: "La Altagracia",
      addressCountry: "DO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 18.582,
      longitude: -68.4055,
    },
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
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "reservations",
      telephone: SITE_CONTACT.telephone,
      email: SITE_CONTACT.email,
      availableLanguage: ["en", "es", "fr"],
    },
  };
}

export function buildWebSiteJsonLd(locale: AppLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: htmlLangForLocale(locale),
    publisher: { "@id": ORGANIZATION_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${localizedUrl(locale, "/excursions")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export type BreadcrumbEntry = {
  name: string;
  /** Locale-less path; omit for the current (last) item. */
  path?: string;
};

export function buildBreadcrumbJsonLd(
  locale: AppLocale,
  entries: BreadcrumbEntry[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      ...(entry.path ? { item: localizedUrl(locale, entry.path) } : {}),
    })),
  };
}

export type FaqEntry = { question: string; answer: string };

export function buildFaqJsonLd(entries: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}

export type ItemListEntry = {
  name: string;
  /** Locale-less path to the item. */
  path: string;
  image?: string | null;
};

/**
 * Turns a list of CMS rows into ItemList entries, dropping anything without
 * both a title and a slug.
 */
export function toItemListEntries(
  rows: Array<{ title?: string | null; slug?: string | null }>,
  pathFor: (slug: string) => string,
): ItemListEntry[] {
  return rows.flatMap((row) => {
    const name = row.title?.trim();
    const slug = row.slug?.trim();
    if (!name || !slug) return [];
    return [{ name, path: pathFor(slug) }];
  });
}

export function buildItemListJsonLd(
  locale: AppLocale,
  name: string,
  entries: ItemListEntry[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      url: localizedUrl(locale, entry.path),
      ...(entry.image ? { image: entry.image } : {}),
    })),
  };
}

export function buildBlogPostingJsonLd({
  locale,
  pathname,
  title,
  description,
  image,
  datePublished,
  dateModified,
  body,
}: {
  locale: AppLocale;
  pathname: string;
  title: string;
  description?: string | null;
  image?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  body?: string | null;
}) {
  const url = localizedUrl(locale, pathname);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: title.slice(0, 110),
    name: title,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: htmlLangForLocale(locale),
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };

  if (description) data.description = description;
  if (image) data.image = [image];
  if (datePublished) data.datePublished = new Date(datePublished).toISOString();
  data.dateModified = new Date(
    dateModified || datePublished || Date.now(),
  ).toISOString();

  if (body) {
    const words = body.trim().split(/\s+/).filter(Boolean).length;
    if (words > 0) data.wordCount = words;
  }

  return data;
}

export type TourReviewJsonLd = {
  author?: string | null;
  rating?: number | null;
  date?: string | null;
  text?: string | null;
};

export function buildTourProductJsonLd({
  name,
  description,
  image,
  url,
  price,
  priceCurrency = "USD",
  rating,
  reviewsCount,
  reviews,
}: {
  name: string;
  description?: string | null;
  image?: string | null;
  url: string;
  price?: number | null;
  priceCurrency?: string;
  rating?: number | null;
  reviewsCount?: number | null;
  reviews?: TourReviewJsonLd[] | null;
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
    provider: { "@id": ORGANIZATION_ID },
  };

  if (description) data.description = description;
  if (image) data.image = image;

  if (typeof price === "number" && Number.isFinite(price)) {
    // Offers must stay valid for a while or Google warns about expiry.
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    data.offers = {
      "@type": "Offer",
      url,
      price: price.toFixed(2),
      priceCurrency: priceCurrency || "USD",
      availability: "https://schema.org/InStock",
      priceValidUntil: validUntil.toISOString().slice(0, 10),
    };
  }

  // Only genuine, on-page customer reviews get marked up, and only once there
  // are enough of them to be meaningful. See MIN_REVIEWS_FOR_AGGREGATE_RATING.
  const count = reviewsCount ?? 0;
  const average = rating ?? 0;

  if (count >= MIN_REVIEWS_FOR_AGGREGATE_RATING && average > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: average.toFixed(1),
      reviewCount: count,
      bestRating: 5,
      worstRating: 1,
    };

    const usableReviews = (reviews ?? []).filter(
      (review) => review.text?.trim() && (review.rating ?? 0) > 0,
    );

    if (usableReviews.length > 0) {
      data.review = usableReviews.slice(0, 10).map((review) => ({
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
        },
        author: {
          "@type": "Person",
          name: review.author?.trim() || "Traveler",
        },
        ...(review.date
          ? { datePublished: new Date(review.date).toISOString().slice(0, 10) }
          : {}),
        reviewBody: review.text?.trim(),
      }));
    }
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/*  Sitemap                                                                    */
/* -------------------------------------------------------------------------- */

export function buildSitemapEntry(
  pathname: string,
  lastModified?: string | Date,
): MetadataRoute.Sitemap[number] {
  return {
    url: localizedUrl("en", pathname),
    ...(lastModified ? { lastModified: new Date(lastModified) } : {}),
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
