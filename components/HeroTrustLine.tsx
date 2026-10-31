"use client";

import { Check, Star } from "lucide-react";
import { useTranslations } from "next-intl";

type HeroTrustLineProps = {
  /** Same figures the Google reviews section shows lower on the page. */
  rating: number;
  reviewCount: number;
};

/**
 * Three promises under the hero title, in white because they sit on the photo.
 * Free cancellation and instant confirmation are the same claims every tour
 * page already makes; the rating is the average of the Google reviews shown
 * further down. Nothing here is new.
 */
export default function HeroTrustLine({ rating, reviewCount }: HeroTrustLineProps) {
  const t = useTranslations("Home");

  return (
    <ul className="mx-auto mt-3 flex w-fit max-w-full flex-col items-start gap-0.5 text-[13px] font-medium leading-5 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.65)] md:mt-7 md:flex-row md:items-center md:gap-0 md:rounded-full md:bg-black/35 md:px-2 md:py-2 md:text-sm md:leading-normal md:backdrop-blur-sm md:[text-shadow:none]">
      {reviewCount > 0 ? (
        <li className="md:px-4">
          <a href="#reviews" className="inline-flex items-center gap-1.5 hover:underline">
            <Star className="h-3.5 w-3.5 fill-[#fbbc04] text-[#fbbc04] md:h-4 md:w-4" strokeWidth={0} aria-hidden="true" />
            <span className="font-semibold">{rating.toFixed(1)}</span>
            <span>· {t("trustRating", { count: reviewCount })}</span>
          </a>
        </li>
      ) : null}
      <li className="inline-flex items-center gap-1.5 md:border-l md:border-white/25 md:px-4">
        <Check className="h-3.5 w-3.5 text-emerald-300 md:h-4 md:w-4" strokeWidth={3} aria-hidden="true" />
        {t("trustCancellation")}
      </li>
      <li className="inline-flex items-center gap-1.5 md:border-l md:border-white/25 md:px-4">
        <Check className="h-3.5 w-3.5 text-emerald-300 md:h-4 md:w-4" strokeWidth={3} aria-hidden="true" />
        {t("trustConfirmation")}
      </li>
    </ul>
  );
}
