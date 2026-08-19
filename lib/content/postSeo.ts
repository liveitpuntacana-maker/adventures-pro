import type { AppLocale } from "@/i18n/routing";

/**
 * SERP title and description overrides for blog posts.
 *
 * An article's H1 is written for the reader who is already on the page; the
 * <title> is written for the person deciding whether to click in the results.
 * When those two jobs pull apart, this file lets them differ without touching
 * the editorial headline.
 *
 * Sanity wins when `seoTitle` / `seoDescription` are filled in on the post, the
 * same way `seoIntro` overrides the defaults in `listingIntro.ts`. This map is
 * only the seed for pages where Search Console showed the mismatch costing
 * real clicks.
 */
export type PostSeoOverride = {
  /** Keep at or under 60 characters or Google truncates it. */
  title: string;
  description: string;
};

const POST_SEO: Record<string, Partial<Record<AppLocale, PostSeoOverride>>> = {
  /*
   * Ranks on page 1 for "best time to visit/go to punta cana" (1728 + 1196
   * impressions in 28 days, average position 6.3-6.8) but converts at 0.41%
   * CTR, roughly a tenth of what that position normally earns.
   *
   * Two reasons, both in the title: it read "When NOT to Visit Punta Cana",
   * the opposite of what those searchers typed, and at 89 characters Google
   * cut it mid-sentence. The override answers the query first and keeps the
   * contrarian angle as the differentiator.
   */
  "when-not-to-visit-punta-cana-costly-mistakes-tourists-make-and-the-best-months-instead": {
    en: {
      title: "Best Time to Visit Punta Cana (and the Months to Avoid)",
      description:
        "Month-by-month guide to Punta Cana: hurricane season, rain, crowds and prices. The cheapest weeks, the riskiest ones, and when the weather is actually best.",
    },
    es: {
      title: "Mejor Época para Viajar a Punta Cana (y Meses a Evitar)",
      description:
        "Guía mes a mes de Punta Cana: temporada de huracanes, lluvia, gente y precios. Las semanas más baratas, las de más riesgo y cuándo el clima es mejor.",
    },
    "fr-ca": {
      title: "Quand Partir à Punta Cana (et les Mois à Éviter)",
      description:
        "Guide mois par mois de Punta Cana : saison des ouragans, pluie, affluence et prix. Les semaines les moins chères, les plus risquées et la meilleure météo.",
    },
  },
};

export function postSeoOverride(
  slug: string,
  locale: AppLocale,
): PostSeoOverride | null {
  return POST_SEO[slug]?.[locale] ?? null;
}
