import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const DISALLOW = ["/studio/", "/api/"];

/**
 * Crawlers of AI assistants and the search engines that feed them.
 *
 * The `*` rule already lets them in; they are named so the permission is explicit
 * rather than implied, which is what audit tools and some crawlers look for. A
 * bot with its own group ignores the `*` group, so the two disallows are repeated.
 *
 * - ChatGPT: GPTBot (training), OAI-SearchBot (search index), ChatGPT-User (a
 *   visitor asking ChatGPT to open a page)
 * - Perplexity: PerplexityBot (index), Perplexity-User (on-demand fetch)
 * - Claude: ClaudeBot, Claude-SearchBot, Claude-User
 * - Google-Extended / Applebot-Extended: opt-in tokens for Gemini and Apple's AI
 * - Bingbot: Bing's index is what ChatGPT search draws on
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
