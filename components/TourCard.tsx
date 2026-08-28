import Image from "next/image";
import { Clock3 } from "lucide-react";
import BookNowLink from "@/components/meta/BookNowLink";
import StarRating from "@/components/StarRating";
import { urlFor } from "@/sanity/lib/image";
import { Link } from "@/i18n/navigation";
import { firstPaidPrice } from "@/lib/tourFilters";
import { formatTourPrice } from "@/lib/tourPrice";
import { hasTourRating } from "@/lib/tourRating";
import { tourExcursionPath } from "@/lib/tourSlug";

type TourCardProps = {
  tour: {
    title: string;
    slug: string;
    duration?: string;
    listingImage?: { asset: unknown };
    highlightBadge?: string;
    pricing?: Array<{ price?: number | string | null }>;
    currency?: string;
    priceTag?: string | null;
    fromPriceLabel?: string;
    peekUrl: string;
    rating?: number | null;
    reviewsCount?: number | null;
  };
};


export default function TourCard({ tour }: TourCardProps) {
  const firstPriceValue = firstPaidPrice(tour.pricing);
  const computedPrice = Number.isFinite(firstPriceValue)
    ? `From ${formatTourPrice(tour.currency || "USD", firstPriceValue)}`
    : tour.fromPriceLabel || "Consultar precio";
  const priceTag = tour.priceTag?.trim() || "";
  const safeSlug = tour.slug || "";
  const detailsHref = tourExcursionPath(safeSlug);
  const showRating = hasTourRating(tour.rating, tour.reviewsCount);
  const imageUrl = (() => {
    try {
      return tour.listingImage?.asset
        ? urlFor(tour.listingImage).width(1200).height(800).fit("crop").url()
        : null;
    } catch {
      return null;
    }
  })();

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative">
        {/* The photo is the biggest tap target on the card; on mobile people
            reach for it before any button. */}
        <Link href={detailsHref} aria-label={tour.title} className="block">
          {imageUrl ? (
            <div className="relative h-56 w-full">
              <Image
                src={imageUrl}
                alt={tour.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div className="h-56 w-full bg-slate-200" />
          )}
        </Link>
        {tour.highlightBadge ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-900">
            {tour.highlightBadge}
          </span>
        ) : null}
      </div>
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-600">
          <div className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            <span>{tour.duration || "Duration on request"}</span>
          </div>
          {showRating ? (
            <div className="inline-flex items-center gap-1.5">
              <StarRating rating={tour.rating ?? 0} size="sm" />
              <span className="text-slate-500">({tour.reviewsCount})</span>
            </div>
          ) : null}
        </div>
        <h3 className="text-xl font-semibold leading-tight text-slate-900">
          <Link href={detailsHref} className="transition hover:text-orange-600">
            {tour.title}
          </Link>
        </h3>
        <p className="text-lg font-semibold text-blue-950">
          {computedPrice}
          {priceTag ? (
            <span className="ml-1.5 text-sm font-medium text-slate-500">
              ({priceTag})
            </span>
          ) : null}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <BookNowLink
            href={tour.peekUrl}
            target="_blank"
            rel="noopener noreferrer"
            contentId={safeSlug}
            contentName={tour.title}
            value={Number.isFinite(firstPriceValue) ? firstPriceValue : undefined}
            currency={tour.currency || "USD"}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Book Now
          </BookNowLink>
          <Link
            href={detailsHref}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            More Info
          </Link>
        </div>
      </div>
    </article>
  );
}
