import { NextRequest, NextResponse } from "next/server";
import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { routing, type AppLocale } from "@/i18n/routing";
import { tourRatingProjection } from "@/lib/tourRating";

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
  "currency": coalesce(currency, mainTour->currency, "USD"),
  // The listing pages use these to show a match from another destination or
  // category as a full card instead of a bare link.
  "listingImage": coalesce(listingImage, mainTour->listingImage),
  highlightBadge,
  peekProId,
  "duration": coalesce(
    select(isCombo == true => coalesce(
      select($locale == "fr-ca" => mainTour->duration.frCA, mainTour->duration[$locale]),
      mainTour->duration.en,
      mainTour->duration.es,
      mainTour->duration.frCA
    ), null),
    coalesce(select($locale == "fr-ca" => duration.frCA, duration[$locale]), duration.en, duration.es, duration.frCA)
  ),
  "destinationTitle": destination->{
    "title": coalesce(select($locale == "fr-ca" => title.frCA, title[$locale]), title.en, title.es, title.frCA)
  }.title,
  "categoryTitle": category->{
    "title": coalesce(select($locale == "fr-ca" => title.frCA, title[$locale]), title.en, title.es, title.frCA)
  }.title,
  ${tourRatingProjection}
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
