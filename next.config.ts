import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { RETIRED_POST_REDIRECTS } from "./lib/content/retiredPosts";

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
  // Slugs de WordPress que el catch-all mandaba a /en/excursions/<slug>, donde
  // no existen: unos eran articulos y otros cambiaron de slug al migrar.
  // Confirmados con Search Console (28d, agosto 2026).
  ...[
    [
      "/punta-cana-helicopter-tour-scenic-flights-over-bavaro-cap-cana",
      "/en/excursions/helicopter-tour-punta-cana-bavaro-cap-cana",
    ],
    [
      "/catalina-island-snorkeling-tour-punta-cana",
      "/en/excursions/catalina-island-snorkeling-punta-cana",
    ],
    ["/private-infinity-catamaran", "/en/excursions/private-infinity-catamaran-punta-cana"],
    ["/dolphin-experience-punta-cana", "/en/excursions/swim-with-dolphins-explorer"],
    // El combo Saona + buggy ya no se vende; el tour de Saona es lo mas cercano.
    ["/saona-island-buggy-combo", "/en/excursions/saona-island-classic-tour"],
    ["/golfnshots", "/en/excursions/golf-n-shots-punta-cana-interactive-golf-experience"],
    // Articulos del blog, no tours: acababan en /en/excursions/<slug> y morian.
    [
      "/how-much-a-real-day-in-punta-cana-actually-costs-2025-breakdown",
      "/en/blog/how-much-a-real-day-in-punta-cana-actually-costs",
    ],
    [
      "/the-best-excursions-in-punta-cana-ranked-by-experience-not-price",
      "/en/blog/the-best-excursions-in-punta-cana-ranked-by-experience-not-price",
    ],
    [
      "/what-you-should-know-before-booking-excursions-in-punta-cana",
      "/en/blog/what-you-should-know-before-booking-excursions-in-punta-cana",
    ],
    ["/some-of-the-best-resorts-in-punta-cana", "/en/blog/best-all-inclusive-resorts-punta-cana-deals"],
    ["/vlog", "/en/blog"],
    ["/category/blog", "/en/blog"],
  ].flatMap(([source, destination]) => [
    { source, destination, permanent: true as const },
    { source: `${source}/`, destination, permanent: true as const },
  ]),
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
  "punta-cana-helicopter-tour-scenic-flights-over-bavaro-cap-cana",
  "catalina-island-snorkeling-tour-punta-cana",
  "private-infinity-catamaran",
  "dolphin-experience-punta-cana",
  "saona-island-buggy-combo",
  "golfnshots",
  "how-much-a-real-day-in-punta-cana-actually-costs-2025-breakdown",
  "the-best-excursions-in-punta-cana-ranked-by-experience-not-price",
  "what-you-should-know-before-booking-excursions-in-punta-cana",
  "some-of-the-best-resorts-in-punta-cana",
  "vlog",
  // Retiradas sin equivalente: el proxy les responde 410.
  "best-restaurants-in-punta-cana",
  "explore-the-secrets-of-punta-cana-unforgettable-adventures-await-you",
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
 * Old WordPress root URLs whose slug changed on the way in, so the generic
 * catch-all above sends them to an /en/excursions/<old-slug> that never
 * existed and they land on a 404 instead of the tour or article they used to
 * be.
 *
 * Found by testing every URL in WordPress's own sitemap against the live
 * site: 19 of the 404s Search Console reported were exactly this — a tour or
 * post that still exists today, just renamed, silently losing whatever
 * ranking signal Google had attached to the old address. A genuine handful
 * (lifestyle articles, retired packages, WordPress category archives) really
 * have nowhere to go and are left to 404 on purpose.
 *
 * Runs before legacyTourRedirects, so a listed slug never reaches the
 * catch-all.
 */
const legacyRootSlugRedirects: Array<{
  source: string;
  destination: string;
  permanent: true;
}> = (
  [
    ["excursions", "montana-redonda-horse-back-riding", "montana-redonda-punta-cana"],
    ["excursions", "private-tour-to-higuey-and-montana-redonda", "private-tour-higuey-montana-redonda-punta-cana"],
    ["excursions", "montana-redonda-four-wheel-adventure", "montana-redonda-four-wheel-adventure-punta-cana"],
    ["excursions", "ultimate-buggies-monkeys", "buggy-monkeyland-combo-punta-cana"],
    ["excursions", "zipline-monkeys-experience", "zipline-monkeyland-punta-cana"],
    ["excursions", "coco-bongo-disco", "coco-bongo-punta-cana"],
    ["excursions", "party-boat-punta-cana", "party-boat-tour-in-punta-cana"],
    ["excursions", "catalina-island-altos-de-chavon", "catalina-island-and-altos-de-chavon"],
    ["excursions", "samana-waterfall-el-limon-bacardi-island", "samana-waterfall-el-limon-bacardi-island-punta-cana"],
    ["excursions", "power-dive-snorkeling-punta-cana", "power-diving-snorkeling-in-punta-cana"],
    ["excursions", "punta-cana-helicopter-ride-and-golf-experience", "helicopter-golf-experience-punta-cana"],
    ["excursions", "private-catamaran-tour-along-bavaro-coast", "private-catamaran-bavaro-coast-punta-cana"],
    ["excursions", "private-fishing-tour-in-the-crystal-waters-of-punta-cana", "private-fishing-tour-punta-cana-crystal-waters"],
    ["excursions", "private-luxury-yacht-experience-in-punta-cana", "private-luxury-yacht-experience-punta-cana"],
    ["excursions", "private-express-cruise-tour-in-punta-cana", "private-express-cruise-punta-cana"],
    ["excursions", "cap-cana-adventure-park-yacht-40", "private-charter-sea-ray-40ft"],
    ["excursions", "4-wheels-atv-punta-cana", "atv-tour-punta-cana"],
    ["excursions", "dominican-culture-safari", "dominican-culture-safari-punta-cana"],
    ["excursions", "wellness-retreat", "wellness-retreat-package"],
    ["blog", "living-in-punta-cana-costs-visas-healthcare-daily-life", "living-in-punta-cana-costs-visas-healthcare-and-daily-life"],
  ] as const
).map(([section, from, to]) => ({
  source: `/${from}`,
  destination: `/en/${section}/${to}`,
  permanent: true as const,
}));

/** Old WordPress hub pages: no single tour to send them to, but a category that still exists. */
const legacyRootCategoryRedirects: Array<{
  source: string;
  destination: string;
  permanent: true;
}> = [
  { source: "/combo-experiences", destination: "/en/excursions/categoria/combo-tours", permanent: true },
  { source: "/golf-in-punta-cana", destination: "/en/excursions/categoria/golf-tours", permanent: true },
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

/**
 * Slugs que cambiaron en Sanity despues de que Google ya los tuviera indexados.
 *
 * Se declaran por locale porque las variantes /es y /fr-ca tambien estaban
 * indexadas y devolvian 404: Search Console (28d, agosto 2026) registraba 168
 * impresiones en /es/blog/9-best-golf-courses-in-punta-cana y 108 en
 * /es/excursions/golf-n-shots-punta-cana, ambas muertas.
 */
const slugMigrationRedirects: Array<{
  source: string;
  destination: string;
  permanent: true;
}> = (
  [
    // section, slug antiguo, slug nuevo
    ["excursions", "deep-sea-fishing-private", "private-deep-sea-fishing-punta-cana"],
    ["excursions", "full-day-tour-in-samana-serenity", "samana-full-day-tour-punta-cana"],
    ["excursions", "party-boat", "party-boat-tour-in-punta-cana"],
    ["excursions", "panaca-horse-show-punta-cana", "panaca-world-show-punta-cana"],
    ["excursions", "macao-beach-buggy-adventure", "macao-beach-buggy-punta-cana"],
    ["excursions", "golf-n-shots-punta-cana", "golf-n-shots-punta-cana-interactive-golf-experience"],
    ["excursions", "domitai-park-punta-cana", "domitai-park-punta-cana-adventures"],
    ["excursions", "iberostar-golf-bavaro-punta-cana", "iberostar-golf-club-bavaro"],
    // El documento se recreo en Sanity y quedo con sufijo -2.
    ["blog", "9-best-golf-courses-in-punta-cana", "9-best-golf-courses-in-punta-cana-2"],
    ["excursions", "vip-brunch-boat-tour-punta-cana", "vip-brunch-private-boat-tour-punta-cana"],
  ] as const
).map(([section, from, to]) => ({
  source: `/:locale(en|es|fr-ca)/${section}/${from}`,
  destination: `/:locale/${section}/${to}`,
  permanent: true as const,
}));

/**
 * Articulos que se publicaron como tour y viven en el blog (o al reves).
 * Cambian de seccion, asi que no encajan en slugMigrationRedirects.
 */
/**
 * Articles retired when the blog was consolidated (agosto 2026).
 *
 * Twenty-two URLs across six themes were competing for the same queries and
 * producing four clicks between them; Google had to pick one of four transfer
 * pages and picked none. Each cluster keeps the article with the most
 * impressions and the rest redirect into it, so the little authority they hold
 * lands somewhere instead of being thrown away with a 410.
 *
 * The redirects must ship before the documents are deleted in Sanity, or the
 * URLs answer 404 in between.
 */
const consolidatedPostRedirects: Array<{
  source: string;
  destination: string;
  permanent: true;
}> = RETIRED_POST_REDIRECTS.map(([from, to]) => ({
  source: `/:locale(en|es|fr-ca)/blog/${from}`,
  destination: `/:locale/blog/${to}`,
  permanent: true as const,
}));

const sectionMigrationRedirects: Array<{
  source: string;
  destination: string;
  permanent: true;
}> = [
  {
    source:
      "/:locale(en|es|fr-ca)/excursions/samana-beyond-instagram-the-side-of-paradise-most-tourists-never-see",
    destination:
      "/:locale/blog/samana-beyond-instagram-the-side-of-paradise-most-tourists-never-see",
    permanent: true,
  },
  {
    source: "/:locale(en|es|fr-ca)/excursions/sea-turtles",
    destination:
      "/:locale/blog/sea-turtles-in-the-dominican-republic-when-where-and-how-to-see-them-responsibly",
    permanent: true,
  },
];

/**
 * URLs de WordPress con la categoria en la ruta: /water-tours/<slug>.
 *
 * next-intl les mete el prefijo de idioma y acaban en /en/water-tours/<slug>,
 * que es un 404. La primera regla resuelve el caso con mas trafico perdido
 * (355 impresiones/28d en posicion 9.5) porque ademas cambio de slug; la
 * generica cubre el resto de la familia.
 */
const legacyCategoryPathRedirects: Array<{
  source: string;
  destination: string;
  permanent: true;
}> = [
  ...["", "/"].map((trailing) => ({
    source: `/water-tours/deep-sea-half-day-shared-fishing-charter${trailing}`,
    destination: "/en/excursions/deep-sea-fishing-share",
    permanent: true as const,
  })),
  {
    source: `/:category(${categorySlugs})/:slug([a-z0-9]+(?:-[a-z0-9]+)*)`,
    destination: "/en/excursions/:slug",
    permanent: true,
  },
];

const nextConfig: NextConfig = {
  images: {
    // Sanity y Unsplash sirven ya la imagen recortada y en webp; pasarla ademas
    // por el optimizador de Vercel agoto la cuota de imagenes remotas y todo
    // /_next/image empezo a responder 402. Ver lib/imageLoader.ts.
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
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
  /**
   * Baseline security headers.
   *
   * No Content-Security-Policy here on purpose: the site pulls images from
   * Sanity, scripts from Google Analytics and Meta, and talks to Gemini, so a
   * policy written blind would break the page before it protected it. That one
   * needs its own pass with the browser open.
   */
  async headers() {
    const baseline = [
      // Stop the page being framed and passed off as someone else's site.
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      // A .jpg that is really a script stays a .jpg.
      { key: "X-Content-Type-Options", value: "nosniff" },
      // Other sites see only our origin, never the full path the visitor came from.
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Nothing here needs a camera, a microphone or the visitor's location.
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=()",
      },
    ];

    return [
      {
        // Everything except the widgets, which exist to be embedded elsewhere:
        // X-Frame-Options on those would break the sites that host them.
        source: "/((?!widget).*)",
        headers: baseline,
      },
      {
        source: "/widget/:path*",
        headers: baseline.filter((header) => header.key !== "X-Frame-Options"),
      },
    ];
  },

  async redirects() {
    return [
      ...faviconRedirects,
      ...wordpressRedirects,
      ...localePrefixRedirects,
      // Structure fixes run before the root catch-all so /tours/<slug> is not
      // swallowed by it.
      ...legacyStructureRedirects,
      // Las migraciones de slug van antes de legacyCategoryPathRedirects: si no,
      // la regla generica /water-tours/:slug se llevaria los slugs renombrados
      // a /en/excursions/<slug antiguo>, que ya no existe.
      ...slugMigrationRedirects,
      ...sectionMigrationRedirects,
      ...consolidatedPostRedirects,
      ...legacyCategoryPathRedirects,
      ...legacyRootSlugRedirects,
      ...legacyRootCategoryRedirects,
      ...legacyTourRedirects,
    ];
  },
};

export default withNextIntl(nextConfig);
