/**
 * Turns the plain-text body of a blog post into segments, some of which link
 * into the catalogue.
 *
 * The body is a plain `text` field in Sanity, so there is nowhere to store a
 * link inside it. Rather than migrate 49 articles in three languages to rich
 * text, the links are resolved at render time from a curated map, which also
 * means a tour that gets renamed or unpublished simply stops being linked
 * instead of leaving a dead anchor in the prose.
 */
export type BodyLink = {
  /** Surface forms to look for, tried in order — longest first. */
  phrases: readonly string[];
  href: string;
};

export type BodySegment = {
  text: string;
  /** Set when this segment should render as a link. */
  href?: string;
};

/** Characters that may not sit next to a match, so "buggy" never hits "buggys". */
const BOUNDARY = "\\p{L}\\p{N}";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function firstMatch(
  haystack: string,
  phrases: readonly string[],
): { start: number; end: number } | null {
  let best: { start: number; end: number } | null = null;

  for (const phrase of phrases) {
    const trimmed = phrase.trim();
    if (!trimmed) continue;

    const pattern = new RegExp(
      `(?<![${BOUNDARY}])${escapeRegExp(trimmed)}(?![${BOUNDARY}])`,
      "iu",
    );
    const found = pattern.exec(haystack);
    if (!found) continue;

    // Earliest wins; on a tie the longer phrase does, so "Saona Island" is
    // preferred over the bare "Saona" that follows it in the list.
    const candidate = { start: found.index, end: found.index + found[0].length };
    if (
      !best ||
      candidate.start < best.start ||
      (candidate.start === best.start && candidate.end > best.end)
    ) {
      best = candidate;
    }
  }

  return best;
}

export type BodyBlock = {
  /** 0 renders as a paragraph; 2 and 3 render as h2 and h3. */
  level: 0 | 2 | 3;
  segments: BodySegment[];
};

/**
 * Splits the body into blocks, promoting Markdown-style `##` lines to headings.
 *
 * The body is a plain `text` field, so until now an article was a flat run of
 * paragraphs with no subheadings at all — nothing for Google to build a
 * featured snippet from, and nothing for an assistant to quote a section of.
 * A line of its own that starts with `##` or `###` becomes a heading; every
 * existing article was checked and not one uses that syntax, so nothing that
 * is already published changes.
 *
 * Headings are deliberately left unlinked. Each curated link fires once per
 * article, and it is worth more inside a sentence a reader is following than
 * in a title they are skimming past.
 */
export function buildBodyBlocks(
  body: string,
  links: readonly BodyLink[],
): BodyBlock[] {
  const raw = body
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean);

  const parsed = raw.map((block) => {
    // A heading is a block that is one line and nothing else; `## ` at the top
    // of a longer block is prose that happens to begin with a hash.
    const heading = /^(#{2,3})[ \t]+(\S.*)$/.exec(block);
    return heading
      ? { level: heading[1].length as 2 | 3, text: heading[2].trim() }
      : { level: 0 as const, text: block };
  });

  const prose = parsed.filter((block) => block.level === 0).map((block) => block.text);
  const linked = linkifyBody(prose, links);

  let next = 0;
  return parsed.map((block) =>
    block.level === 0
      ? { level: 0 as const, segments: linked[next++] ?? [{ text: block.text }] }
      : { level: block.level, segments: [{ text: block.text }] },
  );
}

/** The prose of a body, headings removed — for excerpts and structured data. */
export function bodyProseParagraphs(body: string): string[] {
  return body
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter((block) => block && !/^#{2,3}[ \t]+\S/.test(block));
}

/**
 * Links the first occurrence of each entry, at most once per article.
 *
 * Paragraphs are walked in order so the link lands on the first mention a
 * reader actually reaches, which is also the one worth the most.
 */
export function linkifyBody(
  paragraphs: readonly string[],
  links: readonly BodyLink[],
): BodySegment[][] {
  const pending = links.filter((link) => link.phrases.length > 0);

  return paragraphs.map((paragraph) => {
    const segments: BodySegment[] = [];
    let rest = paragraph;

    for (;;) {
      let winner: { index: number; start: number; end: number } | null = null;

      for (const [index, link] of pending.entries()) {
        const match = firstMatch(rest, link.phrases);
        if (!match) continue;
        if (!winner || match.start < winner.start) {
          winner = { index, start: match.start, end: match.end };
        }
      }

      if (!winner) break;

      const link = pending[winner.index];
      pending.splice(winner.index, 1);

      if (winner.start > 0) segments.push({ text: rest.slice(0, winner.start) });
      segments.push({ text: rest.slice(winner.start, winner.end), href: link.href });
      rest = rest.slice(winner.end);
    }

    if (rest) segments.push({ text: rest });
    return segments;
  });
}
