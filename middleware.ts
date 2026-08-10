import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["en", "es", "fr-ca"],
  defaultLocale: "en",
  localePrefix: "always",
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/widget")) {
    return NextResponse.next();
  }

  const response = intlMiddleware(request);
  const match = pathname.match(/^\/(en|es|fr-ca)(\/.*)?$/);
  const pathWithoutLocale = match ? match[2] || "/" : pathname;

  response.headers.set("x-pathname", pathWithoutLocale);

  return response;
}

export const config = {
  matcher: ["/((?!api|widget|_next|_vercel|studio|.*\\..*).*)"],
};
