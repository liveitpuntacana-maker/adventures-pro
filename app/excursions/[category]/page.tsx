import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock3 } from "lucide-react";
import { groq } from "next-sanity";
import { Link } from "@/i18n/navigation";
import { client } from "@/sanity/lib/client";
import Breadcrumbs from "@/components/Breadcrumbs";
import { formatTourPrice, peekBookingUrl } from "@/lib/tourPrice";
import { tourExcursionPath } from "@/lib/tourSlug";
import { sortToursPriceZeroLast } from "@/lib/tourFilters";
import { urlFor } from "@/sanity/lib/image";

type ListingPageProps = {
  params: Promise<{ category: string }>;
};

type ListingTour = {
  _id: string;
  title: string;
  slug: string;
  duration?: string;
  listingImage?: unknown;
  peekProId?: string;
  currency?: string;
  pricing?: Array<{ price?: number | string | null }>;
};

const CATEGORIES = [
  "water-tours",
  "land-tours",
  "private-tours",
  "combo-experience",
  "multidays-tours",
];

const TOURS_BY_CATEGORY_QUERY = groq`*[_type == "tour" && (
  $category in categories[]->slug.current ||
  category->slug.current == $category
)]{
  _id,
  "title": coalesce(title.en, title.es, title.frCA, title),
  "slug": slug.current,
  "duration": coalesce(duration.en, duration.es, duration.frCA, duration),
  listingImage,
  peekProId,
  "currency": coalesce(currency, "USD"),
  pricing[]{price},
  "price": coalesce(pricing[0].price, 0)
} | order(price asc)`;

const parseNumericPrice = (value?: string | number | null) => {
  if (value == null) return Number.NaN;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return Number.NaN;
  const trimmed = value.trim();
  if (!trimmed) return Number.NaN;
  const cleaned = trimmed.replace(/[^\d.,-]/g, "");
  if (!cleaned) return Number.NaN;
  let normalized = cleaned;
  if (cleaned.includes(",") && cleaned.includes(".")) {
    normalized = cleaned.replace(/,/g, "");
  } else if (cleaned.includes(",") && !cleaned.includes(".")) {
    normalized = /,\d{1,2}$/.test(cleaned) ? cleaned.replace(",", ".") : cleaned.replace(/,/g, "");
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const getFirstPricingValue = (tour: ListingTour) => parseNumericPrice(tour.pricing?.[0]?.price);

const buildImageUrl = (image: unknown) => {
  try {
    return image ? urlFor(image).width(900).height(700).fit("crop").url() : null;
  } catch {
    return null;
  }
};

const formatCategoryTitle = (value: string) =>
  (value?.split("-") || [])
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default async function CategoryPage({ params }: ListingPageProps) {
  const { category } = await params;

  if (!CATEGORIES.includes(category)) {
    notFound();
  }

  const tours = sortToursPriceZeroLast(
    await client.fetch<ListingTour[]>(TOURS_BY_CATEGORY_QUERY, {
      category,
    }),
    "asc",
  );

  const categoryTitle = formatCategoryTitle(category);

  return (
    <div className="bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-10 md:py-12 lg:px-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: categoryTitle },
          ]}
        />
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          {categoryTitle}
        </h1>
        <p className="mt-3 text-slate-600">
          Find your perfect excursion.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(tours || []).map((tour) => {
            const firstPricingValue = getFirstPricingValue(tour);
            const computedPrice = Number.isFinite(firstPricingValue)
              ? formatTourPrice(tour.currency ?? "USD", firstPricingValue)
              : "Consultar precio";
            const slug = tour.slug ?? "";
            const title = tour.title ?? "Tour";
            const imageUrl = buildImageUrl(tour.listingImage);
            const peekUrl = tour.peekProId ? peekBookingUrl(tour.peekProId) : "#";

            return (
              <article
                key={tour._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={title}
                      width={1200}
                      height={800}
                      className="h-56 w-full object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1400px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="h-56 w-full bg-slate-200" />
                  )}
                </div>
                <div className="space-y-4 p-5">
                  <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <Clock3 className="h-4 w-4" />
                    <span>{tour.duration || "Duration on request"}</span>
                  </div>
                  <h3 className="text-xl font-semibold leading-tight text-slate-900">{title}</h3>
                  <p className="text-lg font-semibold text-blue-950">From {computedPrice}</p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                      href={peekUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600"
                    >
                      Book Now
                    </a>
                    <Link
                      href={tourExcursionPath(slug)}
                      className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                    >
                      More Info
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
