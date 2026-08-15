import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { SANITY_TAGS, sanityCache } from "@/lib/sanityCache";
import {
  byNewestReviewDate,
  parseReviewDate,
  relativeDateParts,
} from "@/lib/reviewDate";

type Review = {
  _id: string;
  author?: string;
  photo?: { asset: unknown };
  rating?: number;
  date?: string;
  text?: string;
  googleReviewUrl?: string;
};

const REVIEWS_QUERY = `*[_type == "review"] | order(_createdAt desc) [0...12] {
  _id,
  author,
  photo,
  rating,
  date,
  text,
  googleReviewUrl
}`;

/** Editable in Sanity so the headline number does not go stale in code. */
const REVIEW_COUNT_QUERY = `*[_type == "landingPage"][0]{ googleReviewsCount }`;

function GoogleMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.57-5.15 3.57-8.65Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.86-3A7.19 7.19 0 0 1 12 19.3a7.28 7.28 0 0 1-6.86-5.02H1.15v3.09A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC04" d="M5.14 14.28A7.2 7.2 0 0 1 4.73 12c0-.79.14-1.55.41-2.28V6.64H1.15a12 12 0 0 0 0 10.73l3.99-3.09Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.77l3.43-3.43C17.95 1.18 15.23 0 12 0A12 12 0 0 0 1.15 6.64l3.99 3.09A7.28 7.28 0 0 1 12 4.77Z" />
    </svg>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={filled ? "h-5 w-5 text-[#fbbc04]" : "h-5 w-5 text-slate-300"}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.5l2.94 5.96 6.57.95-4.75 4.63 1.12 6.54L12 17.5l-5.88 3.08 1.12-6.54-4.75-4.63 6.57-.95L12 2.5z" />
    </svg>
  );
}

function Stars({ count }: { count: number }) {
  const safe = Math.max(1, Math.min(5, Math.round(count)));
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} filled={i < safe} />
      ))}
    </div>
  );
}

export default async function ReviewsSection() {
  const t = await getTranslations("Reviews");

  const [reviews, summary] = await Promise.all([
    client
      .fetch<Review[]>(REVIEWS_QUERY, {}, sanityCache([SANITY_TAGS.review]))
      .catch(() => []),
    client
      .fetch<{ googleReviewsCount?: number } | null>(
        REVIEW_COUNT_QUERY,
        {},
        sanityCache([SANITY_TAGS.landingPage]),
      )
      .catch(() => null),
  ]);

  const reviewsCount = summary?.googleReviewsCount ?? 40;

  // Google orders by review date; _createdAt only reflects when someone got
  // round to copying it into Sanity.
  const orderedReviews = [...reviews].sort(byNewestReviewDate);

  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:px-10 lg:grid-cols-[360px_1fr] lg:items-center lg:gap-16 lg:px-12">
        <div className="border border-slate-200 bg-slate-50 p-8 md:p-10">
          <p className="text-2xl font-extrabold tracking-tight text-blue-950">
            {t("excellent")}
          </p>
          <div className="mt-5 flex items-center gap-1.5">
            <Star filled />
            <Star filled />
            <Star filled />
            <Star filled />
            <Star filled />
          </div>
          <p className="mt-5 text-base font-medium text-slate-700">
            {t("basedOn", { count: reviewsCount })}
          </p>
          <div className="mt-6 inline-flex items-center gap-3 border border-slate-200 bg-white px-4 py-2">
            <GoogleMark className="h-6 w-6" />
            <span className="text-sm font-semibold text-slate-700">Google</span>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:gap-5">
            {orderedReviews.map((review) => {
              const author = review.author ?? "Guest";
              const googleReviewUrl =
                review.googleReviewUrl?.trim() || "https://www.google.com/maps";
              const imageUrl = (() => {
                try {
                  return review.photo?.asset
                    ? urlFor(review.photo).width(80).height(80).fit("crop").url()
                    : null;
                } catch {
                  return null;
                }
              })();
              return (
                <article
                  key={review._id}
                  className="relative min-h-[280px] min-w-[280px] max-w-[340px] flex-1 snap-start border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
                >
                <div className="absolute right-4 top-4">
                  <GoogleMark className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-3">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={author}
                      width={44}
                      height={44}
                      className="h-11 w-11 border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="h-11 w-11 border border-slate-200 bg-slate-100" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-blue-950">{author}</p>
                    {(() => {
                      const parsed = parseReviewDate(review.date);
                      if (!parsed) {
                        return (
                          <p className="text-xs text-slate-500">{review.date ?? ""}</p>
                        );
                      }
                      const { key, count } = relativeDateParts(parsed);
                      return (
                        <time
                          dateTime={parsed.toISOString().slice(0, 10)}
                          className="text-xs text-slate-500"
                        >
                          {t(key, { count })}
                        </time>
                      );
                    })()}
                  </div>
                </div>
                <div className="mt-4 text-lg">
                  <Stars count={review.rating ?? 5} />
                </div>
                <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-slate-700">
                  {review.text ?? ""}
                </p>
                <Link
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-950 underline-offset-4 hover:underline"
                >
                  {t("readMore")}
                  <ExternalLink className="h-4 w-4" strokeWidth={2} />
                </Link>
                </article>
              );
            })}
            {reviews.length === 0 ? (
              <div className="min-w-full border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                Reviews will appear here when added in the CMS.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}