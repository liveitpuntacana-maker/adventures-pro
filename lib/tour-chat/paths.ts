import type { AppLocale } from "@/i18n/routing";

/**
 * Public URL helpers shared by the chat prompt (server) and the chat widget
 * (browser).
 *
 * They live apart from lib/sanity/queries/chatKnowledge.ts on purpose: that
 * module imports the Sanity client, and anything that imports it ships the
 * client — plus the Node HTTP stack it configures — to the browser. The chat
 * widget is on every page, so keeping these two functions next to the queries
 * put close to a megabyte of unused JavaScript on every visit.
 */
export function tourPublicPath(locale: AppLocale, slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  return `/${locale}/excursions/${clean}`;
}

export function transfersPublicPath(locale: AppLocale): string {
  return `/${locale}/transfers`;
}
