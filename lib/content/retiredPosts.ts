/**
 * Blog posts deleted in the August 2026 consolidation, and what replaced them.
 *
 * Six themes had several articles competing for the same queries and earning
 * four clicks between them. The editor kept the survivor of each theme plus
 * seven others that were worth saving; only the slugs below were actually
 * deleted from Sanity.
 *
 * A slug belongs here only once its document is gone. Redirecting a post that
 * still exists makes it unreachable — the content is there and nothing can
 * link to it — so the two states must stay in step.
 *
 * Shared by next.config.ts, which turns these into 308s, and the sitemap,
 * which leaves them out.
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
  ["what-to-do-in-punta-cana-11-best-ideas", "10-best-tours-in-punta-cana-worth-booking"],
  ["custom-punta-cana-vacation-packages-that-fit", "resort-booking-vs-travel-planner-which-fits"],
  ["punta-cana-catamaran-cruise-what-to-expect", "are-catamaran-tours-worth-it-the-honest-answer"],
];

/** Slugs that no longer resolve and must stay out of the sitemap. */
export const RETIRED_POST_SLUGS: ReadonlySet<string> = new Set(
  RETIRED_POST_REDIRECTS.map(([from]) => from),
);
