import { getSanityWriteClient } from "@/lib/soro/sanityWriteClient";
import type { AppLocale } from "@/i18n/routing";
import type { TourChatMessage } from "@/lib/tour-chat/types";

/** How long a conversation is kept before the cron deletes it. */
export const CHAT_LOG_RETENTION_DAYS = 90;

const MAX_STORED_CONTENT = 4000;

/**
 * Strips contact details a visitor may have typed.
 *
 * The assistant only answers questions, but nothing stops someone from writing
 * "call me at +1 809...". Redacting on the way in means the log never holds
 * contact data in the first place.
 */
export function redactContactDetails(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
    // Digit count decides, not shape: a plain pattern match also swallows
    // dates like 2026-03-15, and the date is exactly the useful part of
    // "I want Saona on March 15".
    .replace(/\(?\+?\d[\d\s().+-]{6,}\d/g, (match) => {
      const digits = match.replace(/\D/g, "");
      return digits.length >= 9 && digits.length <= 15 ? "[teléfono]" : match;
    });
}

/** Tour slugs the assistant linked to, so we can see what it recommended. */
function extractRecommendedTours(text: string): string[] {
  const slugs = [...text.matchAll(/\/(?:en|es|fr-ca)\/excursions\/([a-z0-9-]+)/g)].map(
    (match) => match[1],
  );
  return [...new Set(slugs)].filter(
    (slug) => slug !== "categoria" && slug !== "destino",
  );
}

export type ChatLogInput = {
  sessionId: string;
  locale: AppLocale;
  messages: TourChatMessage[];
  reply: string;
  currentPath?: string | null;
  pageTourTitle?: string | null;
};

/**
 * Saves the conversation so far, replacing the previous snapshot of the
 * same session.
 *
 * The client sends the whole history on every turn, so a full replace keeps
 * this simple and idempotent — no patching, no partial writes. Failures are
 * swallowed: a logging problem must never cost the visitor their answer.
 */
export async function logChatSession(input: ChatLogInput): Promise<void> {
  if (!process.env.SANITY_WRITE_TOKEN) return;

  try {
    const now = new Date().toISOString();

    const turns = [...input.messages, { role: "assistant" as const, content: input.reply }]
      .map((message) => ({
        _key: `${message.role}-${Math.random().toString(36).slice(2, 10)}`,
        role: message.role,
        content: redactContactDetails(message.content).slice(0, MAX_STORED_CONTENT),
      }));

    const recommended = extractRecommendedTours(input.reply);

    const client = getSanityWriteClient();
    const id = `chatSession.${input.sessionId}`;

    const existing = await client.fetch<{ startedAt?: string } | null>(
      `*[_id == $id][0]{ startedAt }`,
      { id },
    );

    await client.createOrReplace({
      _id: id,
      _type: "chatSession",
      sessionId: input.sessionId,
      locale: input.locale,
      startedAt: existing?.startedAt ?? now,
      lastMessageAt: now,
      currentPath: input.currentPath ?? undefined,
      pageTourTitle: input.pageTourTitle ?? undefined,
      messageCount: turns.length,
      recommendedTours: recommended.length > 0 ? recommended : undefined,
      messages: turns,
    });
  } catch (error) {
    console.error("[chat-log] could not store session", error);
  }
}
