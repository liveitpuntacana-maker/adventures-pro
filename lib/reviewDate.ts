/**
 * Review dates are stored as free text in Sanity (DD/MM/YYYY), because that is
 * how they are copied across from Google. These helpers turn that string into
 * something sortable and into the "a month ago" wording Google itself uses.
 */

/** Parses DD/MM/YYYY. Returns null for anything else, so bad rows sort last. */
export function parseReviewDate(value?: string | null): Date | null {
  if (!value) return null;

  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    // Older entries may predate the DD/MM/YYYY rule; fall back to Date parsing.
    const loose = new Date(value);
    return Number.isNaN(loose.getTime()) ? null : loose;
  }

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

export type RelativeDateParts = {
  key: "justNow" | "daysAgo" | "weeksAgo" | "monthsAgo" | "yearsAgo";
  count: number;
};

/**
 * Picks the unit Google would show: days up to a week, then weeks, months and
 * years. Deliberately coarse — "a month ago" reads as a real review, an exact
 * timestamp reads as a database record.
 */
export function relativeDateParts(date: Date, now: Date = new Date()): RelativeDateParts {
  const days = Math.floor((now.getTime() - date.getTime()) / 86_400_000);

  if (days < 1) return { key: "justNow", count: 0 };
  if (days < 7) return { key: "daysAgo", count: days };
  if (days < 30) return { key: "weeksAgo", count: Math.floor(days / 7) };
  if (days < 365) return { key: "monthsAgo", count: Math.max(1, Math.floor(days / 30)) };
  return { key: "yearsAgo", count: Math.max(1, Math.floor(days / 365)) };
}

/** Newest first, entries without a usable date last. */
export function byNewestReviewDate(
  a: { date?: string | null },
  b: { date?: string | null },
): number {
  const dateA = parseReviewDate(a.date);
  const dateB = parseReviewDate(b.date);
  if (!dateA && !dateB) return 0;
  if (!dateA) return 1;
  if (!dateB) return -1;
  return dateB.getTime() - dateA.getTime();
}

/**
 * Carousel order: reviews with something written first, newest within each
 * group, star-only ones after.
 *
 * Sorting purely by date buries the reviews worth reading behind recent
 * ratings that carry no text — those render as an all-but-empty card. They
 * still count towards the summary; they just stop leading the carousel.
 */
export function byCommentThenDate(
  a: { date?: string | null; text?: string | null },
  b: { date?: string | null; text?: string | null },
): number {
  const aHasText = Boolean(a.text?.trim());
  const bHasText = Boolean(b.text?.trim());
  if (aHasText !== bHasText) return aHasText ? -1 : 1;
  return byNewestReviewDate(a, b);
}
