/**
 * Universal WhatsApp deep-link helper (Meta-compatible).
 * Works with WhatsApp, WhatsApp Business, and WhatsApp Web.
 */

/** Adventures Finder sales WhatsApp (digits only, international). */
export const ADVENTURES_WHATSAPP_PHONE = "18495700202";

/**
 * Strip spaces, "+", dashes, parentheses — keep international digits only.
 * Example: "+1 849-570-0202" → "18495700202"
 */
export function cleanWhatsAppPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Official Meta universal send URL.
 * Format: https://api.whatsapp.com/send/?phone={digits}&text={encoded}
 */
export function getUniversalWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = cleanWhatsAppPhone(phone);
  return `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
}

/**
 * Tours that cannot be booked through Peek and are reserved over WhatsApp
 * instead, keyed by tour slug. Their "Book Now" button opens a chat with the
 * message already typed.
 */
const WHATSAPP_BOOKING_MESSAGES: Record<string, Record<string, string>> = {
  // Two separate days, which Peek cannot schedule as one booking.
  "saona-island-monkeyland-combo": {
    en: "I'm writing from adventuresfinder.com and I want to book the Saona Island + Monkeyland tour",
    es: "Escribo desde adventuresfinder.com y quiero reservar el tour Saona Island + Monkeyland",
    "fr-ca":
      "Je vous écris depuis adventuresfinder.com et je souhaite réserver le tour Saona Island + Monkeyland",
  },
};

/** WhatsApp booking link for a tour that is reserved by chat, or null when it books on Peek. */
export function getWhatsAppBookingUrl(slug: string, locale: string): string | null {
  const messages = WHATSAPP_BOOKING_MESSAGES[slug];
  if (!messages) return null;
  return getUniversalWhatsAppUrl(
    ADVENTURES_WHATSAPP_PHONE,
    messages[locale] ?? messages.en,
  );
}
