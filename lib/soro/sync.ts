import { formatStepError } from "@/lib/soro/errors";
import { uploadRemoteImageToSanity } from "@/lib/soro/image";
import { fetchSoroRssItems, type SoroRssItem } from "@/lib/soro/rss";
import { getSanityWriteClient } from "@/lib/soro/sanityWriteClient";
import { slugifyPostTitle, uniqueSlugCandidate } from "@/lib/soro/slug";
import { translatePostFields } from "@/lib/soro/translate";
import { dataset, projectId } from "@/sanity/env";

/**
 * Ceiling on articles created per invocation.
 *
 * The real limiter is TIME_BUDGET_MS below; this is just a guard so a single
 * run can never monopolise the function slot. It sits well above the feed's
 * publishing rate (one article every ~2 days) so a backlog drains in days.
 */
export const MAX_ARTICLES_PER_RUN = 1;

/**
 * When to stop starting new articles, measured from the top of the run.
 *
 * Must stay under the route's maxDuration. One article costs roughly 45s,
 * almost all of it sequential MyMemory calls, so the guard is what stops a run
 * being killed halfway through and leaving a half-written document behind.
 */
const TIME_BUDGET_MS = 45_000;

/** Rough cost of one article, used to decide whether another one still fits. */
const ESTIMATED_ARTICLE_MS = 50_000;

export type SoroSyncResult = {
  fetched: number;
  skippedExisting: number;
  pendingNew: number;
  processedThisRun: number;
  remainingPending: number;
  created: number;
  failed: number;
  errors: Array<{ guid: string; title?: string; message: string }>;
  createdSlugs: string[];
  createdIds: string[];
};

/**
 * Every sourceGuid already imported, in one query.
 *
 * This used to be one query per feed item. That made the check cost grow with
 * the feed: at ~50 items it took about 10s, at 101 it took 20s, and once the
 * whole run crossed the function timeout nothing was ever created again — the
 * sync stopped silently in April 2026 with no failing article to point at.
 */
async function fetchImportedGuids(
  client: ReturnType<typeof getSanityWriteClient>,
): Promise<Set<string>> {
  const guids = await client.fetch<Array<string | null>>(
    `*[_type == "post" && defined(sourceGuid)].sourceGuid`,
  );
  return new Set((guids ?? []).filter((guid): guid is string => Boolean(guid)));
}

async function resolveUniqueSlug(
  client: ReturnType<typeof getSanityWriteClient>,
  titleEn: string,
): Promise<string> {
  const base = slugifyPostTitle(titleEn) || `soro-post-${Date.now()}`;

  for (let attempt = 1; attempt <= 20; attempt += 1) {
    const candidate = uniqueSlugCandidate(base, attempt);
    const taken = await client.fetch<string | null>(
      `*[_type == "post" && slug.current == $slug][0]._id`,
      { slug: candidate },
    );
    if (!taken) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`.slice(0, 96);
}

async function createPostFromItem(
  client: ReturnType<typeof getSanityWriteClient>,
  item: SoroRssItem,
): Promise<{ slug: string; id: string }> {
  let localized: Awaited<ReturnType<typeof translatePostFields>>;
  try {
    const t0 = Date.now();
    console.log(`[soro-sync] step=translation start guid=${item.guid}`);
    localized = await translatePostFields({
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
    });
    console.log(
      `[soro-sync] step=translation ok guid=${item.guid} durationMs=${Date.now() - t0}`,
    );
  } catch (error) {
    throw formatStepError("translation failed", error);
  }

  let slug: string;
  try {
    const t0 = Date.now();
    console.log(`[soro-sync] step=slug start guid=${item.guid}`);
    slug = await resolveUniqueSlug(client, item.title);
    console.log(
      `[soro-sync] step=slug ok guid=${item.guid} slug=${slug} durationMs=${Date.now() - t0}`,
    );
  } catch (error) {
    throw formatStepError("slug resolution failed", error);
  }

  let mainImage: Awaited<ReturnType<typeof uploadRemoteImageToSanity>> | undefined;
  if (item.imageUrl) {
    try {
      const t0 = Date.now();
      console.log(
        `[soro-sync] step=image start guid=${item.guid} url=${item.imageUrl}`,
      );
      mainImage = await uploadRemoteImageToSanity(client, item.imageUrl, slug);
      console.log(
        `[soro-sync] step=image ok guid=${item.guid} asset=${mainImage.asset._ref} durationMs=${Date.now() - t0}`,
      );
    } catch (error) {
      const labeled = formatStepError("image processing failed", error);
      // Non-fatal for image: continue without mainImage, but log the specific step.
      console.warn(
        `[soro-sync] ${labeled.message}; continuing without image guid=${item.guid}`,
      );
    }
  }

  const doc = {
    _type: "post" as const,
    title: localized.title,
    excerpt: localized.excerpt,
    body: localized.body,
    publishedAt: item.publishedAt,
    slug: {
      _type: "slug" as const,
      current: slug,
    },
    sourceGuid: item.guid,
    ...(mainImage ? { mainImage } : {}),
  };

  try {
    const t0 = Date.now();
    console.log(
      `[soro-sync] step=sanity.create start guid=${item.guid} projectId=${projectId} dataset=${dataset}`,
    );
    const created = await client.create(doc);
    console.log(
      `[soro-sync] step=sanity.create ok _id=${created._id} slug=${slug} guid=${item.guid} durationMs=${Date.now() - t0} (published, not draft)`,
    );
    return { slug, id: created._id };
  } catch (error) {
    throw formatStepError("sanity create failed", error);
  }
}

function sortOldestFirst(items: SoroRssItem[]): SoroRssItem[] {
  return [...items].sort(
    (a, b) =>
      new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
  );
}

export async function syncSoroFeedToSanity(): Promise<SoroSyncResult> {
  const result: SoroSyncResult = {
    fetched: 0,
    skippedExisting: 0,
    pendingNew: 0,
    processedThisRun: 0,
    remainingPending: 0,
    created: 0,
    failed: 0,
    errors: [],
    createdSlugs: [],
    createdIds: [],
  };

  console.log(
    `[soro-sync] starting sync (MAX_ARTICLES_PER_RUN=${MAX_ARTICLES_PER_RUN}) projectId=${projectId} dataset=${dataset}`,
  );
  const startedAt = Date.now();
  const client = getSanityWriteClient();
  const items = sortOldestFirst(await fetchSoroRssItems());
  result.fetched = items.length;
  console.log(`[soro-sync] fetched ${items.length} RSS items (oldest-first)`);

  let imported: Set<string>;
  try {
    const t0 = Date.now();
    imported = await fetchImportedGuids(client);
    console.log(
      `[soro-sync] step=existing ok known=${imported.size} durationMs=${Date.now() - t0}`,
    );
  } catch (error) {
    throw formatStepError("existence check failed", error);
  }

  const pendingItems = items.filter((item) => {
    if (!imported.has(item.guid)) return true;
    result.skippedExisting += 1;
    return false;
  });

  result.pendingNew = pendingItems.length;
  const batch = pendingItems.slice(0, MAX_ARTICLES_PER_RUN);

  console.log(
    `[soro-sync] pending new=${result.pendingNew}; up to ${batch.length} this run`,
  );

  for (const item of batch) {
    const elapsed = Date.now() - startedAt;
    if (result.processedThisRun > 0 && elapsed + ESTIMATED_ARTICLE_MS > TIME_BUDGET_MS) {
      // Better to leave it for tomorrow than to be killed mid-article.
      console.log(
        `[soro-sync] time budget reached after ${elapsed}ms; stopping before guid=${item.guid}`,
      );
      break;
    }

    result.processedThisRun += 1;
    try {
      const { slug, id } = await createPostFromItem(client, item);
      result.created += 1;
      result.createdSlugs.push(slug);
      result.createdIds.push(id);
    } catch (error) {
      // Errors thrown from individual steps already include the step label.
      result.failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      result.errors.push({
        guid: item.guid,
        title: item.title,
        message,
      });
      console.error(
        `[soro-sync] article failed guid=${item.guid} title="${item.title}": ${message}`,
      );
    }
  }

  result.remainingPending = Math.max(0, result.pendingNew - result.created);

  console.log(
    `[soro-sync] done fetched=${result.fetched} created=${result.created} skipped=${result.skippedExisting} failed=${result.failed} remainingPending=${result.remainingPending} createdIds=${JSON.stringify(result.createdIds)}`,
  );

  return result;
}
