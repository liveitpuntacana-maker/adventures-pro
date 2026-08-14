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
