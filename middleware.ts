import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["en", "es", "fr-ca"],
  defaultLocale: "en",
  localePrefix: "always",
});

/**
 * Applies request-header overrides the same way as:
 * NextResponse.next({ request: { headers: requestHeaders } })
 * so Server Components can read them via headers().get(...).
 */
function applyRequestHeaderOverrides(
  response: NextResponse,
  overrides: Record<string, string>,
): NextResponse {
  const overrideKeys = new Set(
    (response.headers.get("x-middleware-override-headers") ?? "")
      .split(",")
      .map((key) => key.trim())
      .filter(Boolean),
  );

  for (const [key, value] of Object.entries(overrides)) {
    response.headers.set(`x-middleware-request-${key}`, value);
    overrideKeys.add(key);
  }

  response.headers.set(
    "x-middleware-override-headers",
    Array.from(overrideKeys).join(","),
  );

  return response;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/widget")) {
    return NextResponse.next();
  }

  const match = pathname.match(/^\/(en|es|fr-ca)(\/.*)?$/);
  const pathWithoutLocale = match ? match[2] || "/" : pathname;
  const locale = match?.[1] ?? "en";

  // Build the request headers object expected by NextResponse.next({ request }).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathWithoutLocale);
  requestHeaders.set("x-locale", locale);

  const intlResponse = intlMiddleware(request);

  // Redirect responses do not render Server Components.
  if (intlResponse.headers.has("location")) {
    return intlResponse;
  }

  // Keep next-intl rewrite/cookie behavior, and attach request headers so
  // generateMetadata / layouts can read x-pathname and x-locale.
  return applyRequestHeaderOverrides(intlResponse, {
    "x-pathname": requestHeaders.get("x-pathname") ?? "/",
    "x-locale": requestHeaders.get("x-locale") ?? "en",
  });
}

export const config = {
  matcher: ["/((?!api|widget|_next|_vercel|studio|.*\\..*).*)"],
};
