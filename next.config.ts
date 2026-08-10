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
    source: "/supermarkets-in-punta-cana",
    destination: "/en/blog/supermarkets-in-punta-cana",
    permanent: true,
  },
  {
    source: "/supermarkets-in-punta-cana/",
    destination: "/en/blog/supermarkets-in-punta-cana",
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
    source: "/the-history-of-punta-cana",
    destination: "/en/blog/the-history-of-punta-cana",
    permanent: true,
  },
  {
    source: "/the-history-of-punta-cana/",
    destination: "/en/blog/the-history-of-punta-cana",
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
    source: "/top-best-beaches-in-dominican-republic",
    destination: "/en/blog/top-best-beaches-in-dominican-republic",
    permanent: true,
  },
  {
    source: "/top-best-beaches-in-dominican-republic/",
    destination: "/en/blog/top-best-beaches-in-dominican-republic",
    permanent: true,
  },
  {
    source: "/shopping-center-in-punta-cana",
    destination: "/en/blog/shopping-center-in-punta-cana",
    permanent: true,
  },
  {
    source: "/shopping-center-in-punta-cana/",
    destination: "/en/blog/shopping-center-in-punta-cana",
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
  // sources ya cubiertos por wordpressRedirects (sin slash)
  "when-not-to-visit-punta-cana-costly-mistakes-tourists-make-and-the-best-months-instead",
  "sea-turtles-in-the-dominican-republic-when-where-and-how-to-see-them-responsibly",
  "supermarkets-in-punta-cana",
  "who-we-are",
  "the-history-of-punta-cana",
  "land-tours",
  "punta-cana-neighborhoods-explained-where-to-stay-rent-or-relocate",
  "top-best-beaches-in-dominican-republic",
  "shopping-center-in-punta-cana",
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
      ...legacyTourRedirects,
    ];
  },
};

export default withNextIntl(nextConfig);
