import Parser from "rss-parser";
import { toIsoDateTime } from "@/lib/seo";
import { SORO_RSS_URL } from "@/lib/soro/constants";

export type SoroRssItem = {
  guid: string;
  title: string;
  content: string;
  excerpt: string;
  publishedAt: string;
  imageUrl?: string;
  link?: string;
};

type RawItem = {
  guid?: string;
  id?: string;
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  content?: string;
  contentSnippet?: string;
  summary?: string;
  "content:encoded"?: string;
  enclosure?: { url?: string; type?: string };
};

const parser = new Parser({
  customFields: {
    item: [
      ["content:encoded", "content:encoded"],
      ["media:content", "media:content", { keepArray: true }],
      ["media:thumbnail", "media:thumbnail", { keepArray: true }],
    ],
  },
});

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/(p|div|h[1-6]|li|br|tr)[^>]*>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function firstImageFromHtml(html: string): string | undefined {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1];
}

function mediaUrl(item: RawItem & Record<string, unknown>): string | undefined {
  if (item.enclosure?.url && (!item.enclosure.type || item.enclosure.type.startsWith("image/"))) {
    return item.enclosure.url;
  }

  const mediaContent = item["media:content"];
  if (Array.isArray(mediaContent)) {
    for (const entry of mediaContent) {
      if (entry && typeof entry === "object") {
        const url =
          (entry as { $?: { url?: string } }).$?.url ||
          (entry as { url?: string }).url;
        if (url) return url;
      }
    }
  }

  const mediaThumb = item["media:thumbnail"];
  if (Array.isArray(mediaThumb)) {
    for (const entry of mediaThumb) {
      if (entry && typeof entry === "object") {
        const url =
          (entry as { $?: { url?: string } }).$?.url ||
          (entry as { url?: string }).url;
        if (url) return url;
      }
    }
  }

  return undefined;
}

const RSS_FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/rss+xml, application/xml, text/xml, */*",
  "Accept-Language": "en-US,en;q=0.9",
} as const;

async function fetchSoroRssXml(): Promise<string> {
  console.log(`[soro-sync] requesting RSS feed URL exactly: ${SORO_RSS_URL}`);
  console.log(`[soro-sync] RSS request headers: ${JSON.stringify(RSS_FETCH_HEADERS)}`);

  const response = await fetch(SORO_RSS_URL, {
    method: "GET",
    headers: RSS_FETCH_HEADERS,
    redirect: "follow",
    cache: "no-store",
  });

  const bodyText = await response.text();
  const headersObject: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headersObject[key] = value;
  });

  console.log(`[soro-sync] RSS response status: ${response.status} ${response.statusText}`);
  console.log(`[soro-sync] RSS response ok: ${response.ok}`);
  console.log(`[soro-sync] RSS response url (final): ${response.url}`);
  console.log(`[soro-sync] RSS response headers: ${JSON.stringify(headersObject)}`);
  console.log(
    `[soro-sync] RSS response body (first 2000 chars): ${bodyText.slice(0, 2000)}`,
  );
  if (bodyText.length > 2000) {
    console.log(
      `[soro-sync] RSS response body truncated; full length=${bodyText.length}`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Soro RSS fetch failed with status ${response.status} ${response.statusText}. Body: ${bodyText.slice(0, 500)}`,
    );
  }

  return bodyText;
}

export async function fetchSoroRssItems(): Promise<SoroRssItem[]> {
  const xml = await fetchSoroRssXml();
  const feed = await parser.parseString(xml);
  const items: SoroRssItem[] = [];

  for (const raw of feed.items as unknown as Array<RawItem & Record<string, unknown>>) {
    const guid = String(raw.guid || raw.id || raw.link || "").trim();
    const title = String(raw.title || "").trim();
    if (!guid || !title) continue;

    const html = String(
      raw["content:encoded"] || raw.content || raw.summary || "",
    );
    const content = stripHtml(html);
    const excerpt =
      String(raw.contentSnippet || "").trim() ||
      content.split(/\n\n+/)[0]?.slice(0, 280) ||
      "";

    // An external feed can send anything in a date field, and one bad item used
    // to abort the whole import: the throw happened before any item was
    // returned, so a single malformed entry blocked the rest of the batch.
    const publishedAt =
      toIsoDateTime(raw.isoDate) ??
      toIsoDateTime(raw.pubDate) ??
      new Date().toISOString();
    const imageUrl = mediaUrl(raw) || firstImageFromHtml(html);

    items.push({
      guid,
      title,
      content,
      excerpt,
      publishedAt,
      imageUrl,
      link: raw.link,
    });
  }

  console.log(`[soro-sync] parsed RSS items count=${items.length}`);
  return items;
}
