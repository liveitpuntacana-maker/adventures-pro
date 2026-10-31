"use client";

import { Check, Star } from "lucide-react";
import { useTranslations } from "next-intl";

type HeroTrustLineProps = {
  /** Same figures the Google reviews section shows lower on the page. */
  rating: number;
  reviewCount: number;
};

/**
 * Three promises under the search box. Free cancellation and instant
 * confirmation are the same claims every tour page already makes; the rating is
 * the average of the Google reviews shown further down. Nothing here is new.
 */
export default function HeroTrustLine({ rating, reviewCount }: HeroTrustLineProps) {
  const t = useTranslations("Home");

  return (
    <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
      {reviewCount > 0 ? (
        <li>
          <a href="#reviews" className="inline-flex items-center gap-1.5 hover:underline">
            <Star className="h-4 w-4 fill-[#fbbc04] text-[#fbbc04]" strokeWidth={0} aria-hidden="true" />
            <span className="font-semibold">{rating.toFixed(1)}</span>
            <span>· {t("trustRating", { count: reviewCount })}</span>
          </a>
        </li>
      ) : null}
      <li className="inline-flex items-center gap-1.5">
        <Check className="h-4 w-4 text-emerald-300" strokeWidth={3} aria-hidden="true" />
        {t("trustCancellation")}
      </li>
      <li className="inline-flex items-center gap-1.5">
        <Check className="h-4 w-4 text-emerald-300" strokeWidth={3} aria-hidden="true" />
        {t("trustConfirmation")}
      </li>
    </ul>
  );
}
