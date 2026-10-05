import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * Old WordPress URLs whose content no longer exists and has no replacement.
 *
 * They answer 410 Gone rather than 404 so Google drops them from the index
 * quickly instead of re-crawling them for months. Previously these were 301s
 * pointing at blog posts that were never migrated, which sent both crawlers
 * and visitors into a dead end.
 */
const GONE_PATHS = new Set([
  "/supermarkets-in-punta-cana",
  "/the-history-of-punta-cana",
  "/top-best-beaches-in-dominican-republic",
  "/shopping-center-in-punta-cana",
  // Sin equivalente en el sitio actual. Redirigirlas a una pagina no
  // relacionada seria un soft 404, que Google trata peor que un 410 limpio.
  "/best-restaurants-in-punta-cana",
  "/explore-the-secrets-of-punta-cana-unforgettable-adventures-await-you",
  // Articulos de estilo de vida del WordPress viejo que nunca se migraron y
  // siguen apareciendo en Search Console como 404 (octubre 2026).
  "/best-night-life-in-punta-cana",
  "/dominican-flavors",
  "/10-things-tourists-dont-realize-about-punta-cana-until-they-arrive",
  "/why-everyones-talking-about-punta-canas-real-estate-boom",
  "/are-punta-cana-excursions-safe",
  "/how-safe-is-punta-cana-real-talk-for-visitors-expats",
  "/shopping-center",
  "/supermarkets",
  "/top-best-beaches",
  // Basura: archivo por fecha de WordPress y un slug mal formado.
  "/2026/04",
  "/samana-",
  // Tour que se elimino del catalogo. 410 le dice a Google que no vuelva a
  // buscarlo; un 404 lo sigue reintentando. Cubre la URL antigua de WordPress
  // (raiz) y la del sitio actual.
  "/canam-buggy-punta-cana",
  "/excursions/canam-buggy-punta-cana",
]);

function normalizeForGoneCheck(pathname: string): string {
  const withoutLocale = pathname.replace(/^\/(en|es|fr-ca)(?=\/|$)/, "");
  const trimmed = withoutLocale.replace(/\/+$/, "");
  return trimmed || "/";
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (GONE_PATHS.has(normalizeForGoneCheck(pathname))) {
    return new NextResponse(
      "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>Page removed</title><meta name=\"robots\" content=\"noindex\"></head><body><h1>This page no longer exists</h1><p>The article you are looking for has been removed. Browse our <a href=\"/en/blog\">travel guide</a> or our <a href=\"/en/excursions\">excursions</a>.</p></body></html>",
      {
        status: 410,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "x-robots-tag": "noindex",
        },
      },
    );
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|widget|_next|_vercel|studio|.*\\..*).*)"],
};
