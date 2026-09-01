import { NextResponse } from "next/server";
import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { clientIp, rateLimit } from "@/lib/rateLimit";

const hotelsQuery = groq`*[_type == "transferHotel"] | order(title asc) {
  _id,
  title,
  "zone": {
    "id": zone._ref,
    "title": zone->title
  }
}`;

const routesQuery = groq`*[_type == "transferRoute"] {
  _id,
  originCode,
  "destinationZone": {
    "id": destinationZone._ref,
    "title": destinationZone->title
  },
  pricingRates[]{
    _key,
    priceOneWay,
    priceRoundTrip,
    peekOneWayUrl,
    peekRoundTripUrl,
    "vehicle": vehicle->{
      _id,
      title,
      capacity,
      "imageUrl": image.asset->url
    }
  }
}`;

/**
 * Generous for the buscador, useless for scraping.
 *
 * The hero search calls this once when someone opens the home page, so a person
 * browsing normally never reaches double figures in a minute. One response is
 * the entire transfer price list — every hotel, every vehicle, every rate — so
 * without a ceiling a competitor could pull the whole tariff on repeat.
 */
const REQUESTS_PER_MINUTE = 15;

export async function GET(request: Request) {
  const limit = rateLimit({
    key: `transfers:${clientIp(request)}`,
    limit: REQUESTS_PER_MINUTE,
    windowMs: 60_000,
  });

  if (!limit.ok) {
    return NextResponse.json(
      { hotels: [], routes: [] },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  try {
    const [hotels, routes] = await Promise.all([
      client.fetch(hotelsQuery),
      client.fetch(routesQuery),
    ]);
    return NextResponse.json({
      hotels: hotels ?? [],
      routes: routes ?? [],
    });
  } catch {
    return NextResponse.json({ hotels: [], routes: [] }, { status: 500 });
  }
}
