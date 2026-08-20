/**
 * Blog posts retired in the August 2026 consolidation, and what replaced them.
 *
 * Six themes had several articles competing for the same queries and earning
 * four clicks between them. One survivor per theme keeps its URL; the rest
 * redirect into it.
 *
 * Shared by next.config.ts, which turns these into 308s, and the sitemap,
 * which must leave them out: the documents still exist in Sanity until an
 * editor deletes them, so without this the sitemap advertises URLs that
 * redirect — 19 of them, times three locales.
 */
export const RETIRED_POST_REDIRECTS: ReadonlyArray<readonly [from: string, to: string]> = [
  ["do-i-need-airport-transfer-for-my-trip", "vip-transportation-punta-cana-what-to-expect"],
  ["punta-cana-airport-transfers-done-right", "vip-transportation-punta-cana-what-to-expect"],
  ["dominican-republic-resort-transfer-review", "vip-transportation-punta-cana-what-to-expect"],
  ["private-vs-shared-tours-in-punta-cana-what-s-really-worth-it", "group-tours-vs-private-tours-which-fits"],
  ["private-punta-cana-tours-worth-booking", "group-tours-vs-private-tours-which-fits"],
  ["luxury-tours-punta-cana-that-feel-worth-it", "group-tours-vs-private-tours-which-fits"],
  ["private-excursions-punta-cana-worth-booking", "group-tours-vs-private-tours-which-fits"],
  ["the-best-excursions-in-punta-cana-ranked-by-experience-not-price", "10-best-tours-in-punta-cana-worth-booking"],
  ["how-to-book-dominican-excursions-right", "10-best-tours-in-punta-cana-worth-booking"],
  ["what-you-should-know-before-booking-excursions-in-punta-cana", "10-best-tours-in-punta-cana-worth-booking"],
  ["what-to-do-in-punta-cana-11-best-ideas", "10-best-tours-in-punta-cana-worth-booking"],
  ["punta-cana-excursion-planning-guide", "10-best-tours-in-punta-cana-worth-booking"],
  ["how-adventures-finder-simplifies-your-trip", "resort-booking-vs-travel-planner-which-fits"],
  ["custom-punta-cana-vacation-packages-that-fit", "resort-booking-vs-travel-planner-which-fits"],
  ["how-to-choose-a-punta-cana-dmc", "resort-booking-vs-travel-planner-which-fits"],
  ["punta-cana-catamaran-cruise-what-to-expect", "are-catamaran-tours-worth-it-the-honest-answer"],
  ["catamaran-cruise-vs-speedboat-excursion", "are-catamaran-tours-worth-it-the-honest-answer"],
  ["luxury-travel-trends-punta-cana-guests-want", "punta-cana-travel-trends-2026-to-watch"],
  ["punta-cana-corporate-retreat-planning-tips", "punta-cana-travel-trends-2026-to-watch"],
];

/** Slugs that no longer resolve and must stay out of the sitemap. */
export const RETIRED_POST_SLUGS: ReadonlySet<string> = new Set(
  RETIRED_POST_REDIRECTS.map(([from]) => from),
);
