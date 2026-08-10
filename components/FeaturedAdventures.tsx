import TourCard from "@/components/TourCard";
import FeaturedAdventuresHeading from "@/components/FeaturedAdventuresHeading";
import FeaturedAdventuresEmpty from "@/components/FeaturedAdventuresEmpty";
import { peekBookingUrl } from "@/lib/tourPrice";
import { sortToursPriceZeroLast } from "@/lib/tourFilters";

export type FeaturedTour = {
  _id: string;
  title?: string;
  slug?: string;
  duration?: string;
  listingImage?: { asset: unknown };
  highlightBadge?: string;
  peekProId?: string;
  currency?: string;
  pricing?: Array<{ price?: number | string | null }>;
  price?: number | string | null;
  rating?: number | null;
  reviewsCount?: number | null;
};

type FeaturedAdventuresProps = {
  tours: FeaturedTour[];
};

export default function FeaturedAdventures({ tours }: FeaturedAdventuresProps) {
  const sortedTours = sortToursPriceZeroLast(tours, "asc");

  return (
    <section className="w-full">
      <FeaturedAdventuresHeading />
      {sortedTours.length === 0 ? (
        <FeaturedAdventuresEmpty />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedTours.map((tour) => {
            const slug = tour.slug ?? "";
            const title = tour.title ?? "Tour";
            const peekUrl = tour.peekProId ? peekBookingUrl(tour.peekProId) : "#";
            return (
              <TourCard
                key={tour._id}
                tour={{
                  title,
                  slug,
                  duration: tour.duration,
                  listingImage: tour.listingImage,
                  highlightBadge: tour.highlightBadge,
                  pricing: tour.pricing,
                  currency: tour.currency,
                  peekUrl,
                  rating: tour.rating,
                  reviewsCount: tour.reviewsCount,
                }}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
