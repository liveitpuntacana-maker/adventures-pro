import Image from "next/image";
import Link from "next/link";
import { ChevronsRight, ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { SANITY_TAGS, sanityCache } from "@/lib/sanityCache";
import {
  byCommentThenDate,
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

const REVIEWS_QUERY = `*[_type == "review"] {
  _id,
  author,
  photo,
  rating,
  date,
  text,
  googleReviewUrl
}`;

/**
 * Every rating, so the summary reflects the whole set rather than the twelve
 * reviews the carousel happens to show. Ratings come back raw and are bucketed
 * in JS, which also copes with half stars like 3.5.
 */
const ALL_RATINGS_QUERY = `*[_type == "review" && defined(rating)].rating`;

const GOOGLE_PROFILE_URL = "https://share.google/HGvwSZTd6I4BLW7Av";

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
      className={filled ? "h-4 w-4 text-[#fbbc04] md:h-5 md:w-5" : "h-4 w-4 text-slate-300 md:h-5 md:w-5"}
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
    <div className="flex items-center gap-1 md:gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} filled={i < safe} />
      ))}
    </div>
  );
}

export default async function ReviewsSection() {
  const t = await getTranslations("Reviews");

  const [reviews, allRatings] = await Promise.all([
    client
      .fetch<Review[]>(REVIEWS_QUERY, {}, sanityCache([SANITY_TAGS.review]))
      .catch(() => []),
    client
      .fetch<number[]>(ALL_RATINGS_QUERY, {}, sanityCache([SANITY_TAGS.review]))
      .catch(() => [] as number[]),
  ]);

  const total = allRatings.length;
  const average = total > 0 ? allRatings.reduce((sum, r) => sum + r, 0) / total : 0;

  // [5,4,3,2,1] — half stars round to the nearest whole bucket.
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: allRatings.filter((r) => Math.round(r) === stars).length,
  }));

  const orderedReviews = [...reviews].sort(byCommentThenDate);

  return (
    <section className="w-full bg-white py-10 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 md:gap-12 md:px-10 lg:grid-cols-[360px_1fr] lg:items-center lg:gap-16 lg:px-12">
        <div className="border border-slate-200 bg-slate-50 p-4 md:p-10">
          <p className="text-sm font-semibold text-slate-700">{t("summaryTitle")}</p>
          {total === 0 ? null : (
          <>

          <div className="mt-3 flex items-start gap-4 md:mt-6 md:gap-6">
            {/* Distribution bars, widest bucket on top, exactly as Google lays
                them out. */}
            <div className="flex-1 space-y-1 md:space-y-1.5">
              {distribution.map(({ stars, count }) => {
                const percent = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="w-2 text-right text-xs text-slate-500 tabular-nums">
                      {stars}
                    </span>
                    <span
                      className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 md:h-2.5"
                      role="img"
                      aria-label={t("starsBreakdown", { stars, count, total })}
                    >
                      <span
                        className="block h-full rounded-full bg-[#fbbc04]"
                        style={{ width: `${percent}%` }}
                      />
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="shrink-0 text-right">
              <p className="text-4xl font-normal leading-none text-slate-800 tabular-nums md:text-5xl">
                {average.toFixed(1)}
              </p>
              <div className="mt-1.5 flex justify-end md:mt-2">
                <Stars count={average} />
              </div>
              <p className="mt-1.5 text-xs text-slate-500 md:mt-2 md:text-sm">
                {t("reviewsCount", { count: total })}
              </p>
            </div>
          </div>

          </>
          )}

          <a
            href={GOOGLE_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 transition hover:border-slate-300 hover:shadow-sm md:mt-7 md:min-h-12 md:gap-3 md:px-4 md:py-2"
          >
            <GoogleMark className="h-5 w-5 md:h-6 md:w-6" />
            <span className="text-sm font-semibold text-slate-700">{t("google")}</span>
          </a>
        </div>

        <div className="overflow-hidden">
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:gap-5">
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
                  // On a phone the card is ~70% of the width so the next one peeks in from
                  // the right, which is what tells a visitor the row scrolls.
                  className="relative min-h-[200px] w-[72%] min-w-[240px] shrink-0 snap-start border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] md:min-h-[280px] md:w-auto md:min-w-[280px] md:max-w-[340px] md:flex-1 md:shrink md:p-6"
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
                <div className="mt-3 text-lg md:mt-4">
                  <Stars count={review.rating ?? 5} />
                </div>
                <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-slate-700 md:mt-4 md:line-clamp-4 md:text-sm">
                  {review.text ?? ""}
                </p>
                <Link
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-950 underline-offset-4 hover:underline md:mt-5 md:text-sm"
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
          {orderedReviews.length > 1 ? (
            <p className="mt-2 flex items-center justify-center gap-1 text-xs font-medium text-slate-500 md:hidden">
              {t("swipeHint")}
              <ChevronsRight className="h-4 w-4" aria-hidden="true" />
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}