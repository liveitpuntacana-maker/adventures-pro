import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const faviconRedirects: Array<{ source: string; destination: string; permanent: true }> = [
  {
    source: "/favicon.ico",
    destination: "/images/icon.png",
    permanent: true,
  },
  {
    source: "/icon.png",
    destination: "/images/icon.png",
    permanent: true,
  },
];

const wordpressRedirects: Array<{ source: string; destination: string; permanent: true }> = [
  {
    source: "/when-not-to-visit-punta-cana-costly-mistakes-tourists-make-and-the-best-months-instead",
    destination: "/en/blog/when-not-to-visit-punta-cana-costly-mistakes-tourists-make-and-the-best-months-instead",
    permanent: true,
  },
  {
    source: "/when-not-to-visit-punta-cana-costly-mistakes-tourists-make-and-the-best-months-instead/",
    destination: "/en/blog/when-not-to-visit-punta-cana-costly-mistakes-tourists-make-and-the-best-months-instead",
    permanent: true,
  },
  {
    source: "/sea-turtles-in-the-dominican-republic-when-where-and-how-to-see-them-responsibly",
    destination: "/en/blog/sea-turtles-in-the-dominican-republic-when-where-and-how-to-see-them-responsibly",
    permanent: true,
  },
  {
    source: "/sea-turtles-in-the-dominican-republic-when-where-and-how-to-see-them-responsibly/",
    destination: "/en/blog/sea-turtles-in-the-dominican-republic-when-where-and-how-to-see-them-responsibly",
    permanent: true,
  },
  {
    source: "/transfers",
    destination: "/en/transfers",
    permanent: true,
  },
  {
    source: "/transfers/",
    destination: "/en/transfers",
    permanent: true,
  },
  {
    source: "/who-we-are",
    destination: "/en/about",
    permanent: true,
  },
  {
    source: "/who-we-are/",
    destination: "/en/about",
    permanent: true,
  },
  {
    source: "/land-tours",
    destination: "/en/excursions/categoria/land-tours",
    permanent: true,
  },
  {
    source: "/land-tours/",
    destination: "/en/excursions/categoria/land-tours",
    permanent: true,
  },
  {
    source: "/punta-cana-neighborhoods-explained-where-to-stay-rent-or-relocate",
    destination: "/en/blog/punta-cana-neighborhoods-explained-where-to-stay-rent-or-relocate",
    permanent: true,
  },
  {
    source: "/punta-cana-neighborhoods-explained-where-to-stay-rent-or-relocate/",
    destination: "/en/blog/punta-cana-neighborhoods-explained-where-to-stay-rent-or-relocate",
    permanent: true,
  },
  {
    source: "/private-tours",
    destination: "/en/excursions/categoria/private-tours",
    permanent: true,
  },
  {
    source: "/private-tours/",
    destination: "/en/excursions/categoria/private-tours",
    permanent: true,
  },
  {
    source: "/water-tours",
    destination: "/en/excursions/categoria/water-tours",
    permanent: true,
  },
  {
    source: "/water-tours/",
    destination: "/en/excursions/categoria/water-tours",
    permanent: true,
  },
  {
    source: "/multidays-tours",
    destination: "/en/excursions/categoria/multidays-tours",
    permanent: true,
  },
  {
    source: "/multidays-tours/",
    destination: "/en/excursions/categoria/multidays-tours",
    permanent: true,
  },
  {
    source: "/power-cruise-catamaran-snorkeling",
    destination: "/en/excursions/power-cruise-catamaran-snorkeling",
    permanent: true,
  },
  {
    source: "/power-cruise-catamaran-snorkeling/",
    destination: "/en/excursions/power-cruise-catamaran-snorkeling",
    permanent: true,
  },
  {
    source: "/faqs-tours",
    destination: "/en/faqs",
    permanent: true,
  },
  {
    source: "/faqs-tours/",
    destination: "/en/faqs",
    permanent: true,
  },
  {
    source: "/about-our-vlog",
    destination: "/en/blog",
    permanent: true,
  },
  {
    source: "/about-our-vlog/",
    destination: "/en/blog",
    permanent: true,
  },
  {
    source: "/",
    destination: "/en",
    permanent: true,
  },
];

const reservedRootSlugs = [
  // locales — evita loops con next-intl
  "en",
  "es",
  "fr-ca",
  // sitio
  "about",
  "contact",
  "transfers",
  "excursions",
  "blog",
  "faqs",
  "terms-and-conditions",
  "cancellation-policy",
  "studio",
  "tours",
  "api",
  "widget",
  "_next",
  "_vercel",
  // favicon / system / crawlers
  "favicon\\.ico",
  "icon\\.png",
  "robots\\.txt",
  "sitemap\\.xml",
  "manifest\\.json",
  "apple-touch-icon\\.png",
  "ads\\.txt",
  "\\.well-known",
  // URLs retiradas: el middleware les responde 410 Gone. Deben quedar excluidas
  // del catch-all o este las redirigiria a /en/excursions/<slug>, que es un 404.
  "supermarkets-in-punta-cana",
  "the-history-of-punta-cana",
  "top-best-beaches-in-dominican-republic",
  "shopping-center-in-punta-cana",
  // sources ya cubiertos por wordpressRedirects (sin slash)
  "when-not-to-visit-punta-cana-costly-mistakes-tourists-make-and-the-best-months-instead",
  "sea-turtles-in-the-dominican-republic-when-where-and-how-to-see-them-responsibly",
  "who-we-are",
  "land-tours",
  "punta-cana-neighborhoods-explained-where-to-stay-rent-or-relocate",
  "private-tours",
  "water-tours",
  "multidays-tours",
  "power-cruise-catamaran-snorkeling",
  "faqs-tours",
  "about-our-vlog",
].join("|");

// Exact-match negative lookahead: (?!(?:a|b)$) excludes only the full segment "a" or "b",
// not prefixes (e.g. "about-our-team-tour" is NOT excluded by "about").
// Trailing pattern only allows kebab-case (letters/digits/hyphens) so root static
// assets like /logo-v3.png or /file.svg are never captured by this redirect.
const legacyTourSlugPattern = `((?!(?:${reservedRootSlugs})$)[a-z0-9]+(?:-[a-z0-9]+)*)`;

const legacyTourRedirects: Array<{
  source: string;
  destination: string;
  permanent: true;
}> = [
  {
    source: `/:slug${legacyTourSlugPattern}`,
    destination: "/en/excursions/:slug",
    permanent: true,
  },
  {
    source: `/:slug${legacyTourSlugPattern}/`,
    destination: "/en/excursions/:slug",
    permanent: true,
  },
];

/**
 * Locale-less versions of the site's own pages.
 *
 * next-intl answers these with a 307 (temporary). Google follows a 307 but
 * only a 301/308 transfers ranking signals cleanly, so the permanent ones are
 * declared here and never reach the proxy.
 */
const localePrefixRedirects: Array<{
  source: string;
  destination: string;
  permanent: true;
}> = [
  "/about",
  "/contact",
  "/excursions",
  "/blog",
  "/faqs",
  "/terms-and-conditions",
  "/cancellation-policy",
].map((pathname) => ({
  source: pathname,
  destination: `/en${pathname}`,
  permanent: true as const,
}));

/**
 * Category slugs that used to live at /excursions/<slug> before the
 * /excursions/categoria/<slug> structure existed.
 */
const categorySlugs = [
  "water-tours",
  "land-tours",
  "combo-tours",
  "private-tours",
  "golf-tours",
  "packages",
  "multidays-tours",
].join("|");

/**
 * Old internal URL shapes that no longer resolve.
 *
 * /tours/<slug> and /excursions/<category> used to be real pages; after the
 * move to /[locale]/excursions/... they were left redirecting into 404s.
 */
const legacyStructureRedirects: Array<{
  source: string;
  destination: string;
  permanent: true;
}> = [
  {
    source: `/:locale(en|es|fr-ca)/excursions/:category(${categorySlugs})`,
    destination: "/:locale/excursions/categoria/:category",
    permanent: true,
  },
  {
    source: `/excursions/:category(${categorySlugs})`,
    destination: "/en/excursions/categoria/:category",
    permanent: true,
  },
  {
    source: "/:locale(en|es|fr-ca)/tours/:slug*",
    destination: "/:locale/excursions/:slug*",
    permanent: true,
  },
  {
    source: "/tours/:slug*",
    destination: "/en/excursions/:slug*",
    permanent: true,
  },
];

const slugMigrationRedirects: Array<{
  source: string;
  destination: string;
  permanent: true;
}> = [
  {
    source: "/en/excursions/deep-sea-fishing-private",
    destination: "/en/excursions/private-deep-sea-fishing-punta-cana",
    permanent: true,
  },
  {
    source: "/en/excursions/full-day-tour-in-samana-serenity",
    destination: "/en/excursions/samana-full-day-tour-punta-cana",
    permanent: true,
  },
  {
    source: "/en/excursions/party-boat",
    destination: "/en/excursions/party-boat-tour-in-punta-cana",
    permanent: true,
  },
  {
    source: "/en/excursions/panaca-horse-show-punta-cana",
    destination: "/en/excursions/panaca-world-show-punta-cana",
    permanent: true,
  },
  {
    source: "/en/excursions/macao-beach-buggy-adventure",
    destination: "/en/excursions/macao-beach-buggy-punta-cana",
    permanent: true,
  },
  {
    source: "/en/excursions/samana-beyond-instagram-the-side-of-paradise-most-tourists-never-see",
    destination: "/en/blog/samana-beyond-instagram-the-side-of-paradise-most-tourists-never-see",
    permanent: true,
  },
  {
    source: "/en/excursions/sea-turtles",
    destination:
      "/en/blog/sea-turtles-in-the-dominican-republic-when-where-and-how-to-see-them-responsibly",
    permanent: true,
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      ...faviconRedirects,
      ...wordpressRedirects,
      ...localePrefixRedirects,
      // Structure fixes run before the root catch-all so /tours/<slug> is not
      // swallowed by it.
      ...legacyStructureRedirects,
      ...slugMigrationRedirects,
      ...legacyTourRedirects,
    ];
  },
};

export default withNextIntl(nextConfig);
