import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["en", "es", "fr-ca"],
  defaultLocale: "en",
  localePrefix: "always",
});

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/(en|es|fr-ca)(\/.*)?$/);
  const pathWithoutLocale = match ? match[2] || "/" : pathname;

  response.headers.set("x-pathname", pathWithoutLocale);

  return response;
}

export const config = {
  matcher: ["/((?!api|widget|_next|_vercel|studio|.*\\..*).*)"],
};
