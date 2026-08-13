import { NextRequest, NextResponse } from "next/server";
import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { routing, type AppLocale } from "@/i18n/routing";

const tourSearchQuery = groq`*[_type == "tour" && defined(slug.current) && (
  coalesce(title.en, "") match $pattern ||
  coalesce(title.es, "") match $pattern ||
  coalesce(title.frCA, "") match $pattern
)] {
  _id,
  "title": coalesce(select($locale == "fr-ca" => title.frCA, title[$locale]), title.en, title),
  "slug": slug.current,
  "imageUrl": coalesce(listingImage, mainTour->listingImage).asset->url,
  pricing[]{price},
  "price": coalesce(pricing[0].price, mainTour->pricing[0].price, 0),
  "priceTag": coalesce(priceTag, mainTour->priceTag),
  "currency": coalesce(currency, mainTour->currency, "USD")
} | order(price asc) [0...8]`;

function sanitizeSearchTerm(value: string) {
  return value.trim().replace(/[^\p{L}\p{N}\s-]/gu, "");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = sanitizeSearchTerm(searchParams.get("q") ?? "");
    const localeParam = searchParams.get("locale") ?? routing.defaultLocale;
    const locale = routing.locales.includes(localeParam as AppLocale)
      ? (localeParam as AppLocale)
      : routing.defaultLocale;

    if (!q) {
      return NextResponse.json({ tours: [] });
    }

    const pattern = `*${q}*`;
    const tours = await client.fetch(tourSearchQuery, { pattern, locale });

    return NextResponse.json({ tours: tours ?? [] });
  } catch {
    return NextResponse.json({ tours: [] }, { status: 500 });
  }
}
