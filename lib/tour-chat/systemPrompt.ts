import type { AppLocale } from "@/i18n/routing";
import type { ChatKnowledge } from "@/lib/sanity/queries/chatKnowledge";
import {
  transfersPublicPath,
  tourPublicPath,
} from "@/lib/sanity/queries/chatKnowledge";
import {
  ADVENTURES_WHATSAPP_PHONE,
  getUniversalWhatsAppUrl,
} from "@/lib/utils/whatsapp";

export const COMPANY_PHONE_DISPLAY = "+1 829 421 6101";
export const COMPANY_WHATSAPP_E164 = ADVENTURES_WHATSAPP_PHONE;
export const COMPANY_WHATSAPP_DISPLAY = "+1 849 570 0202";
export const COMPANY_ADDRESS = "Punta Cana, República Dominicana";
export const COMPANY_EMAIL = "reservations@adventuresfinder.com";

export type SiteChatPageContext = {
  currentPath?: string | null;
  pageTourSlug?: string | null;
  pageTourTitle?: string | null;
};

function localeLanguageName(locale: AppLocale): string {
  switch (locale) {
    case "es":
      return "Spanish (español)";
    case "fr-ca":
      return "French (français canadien)";
    case "en":
    default:
      return "English";
  }
}

function extractTourSlugFromPath(pathname: string | null | undefined): string | null {
  if (!pathname) return null;
  const match = pathname.match(/\/excursions\/(?!categoria\/|destino\/)([^/?#]+)/i);
  if (!match?.[1]) return null;
  return decodeURIComponent(match[1]).replace(/^\/+|\/+$/g, "");
}

function formatCatalog(knowledge: ChatKnowledge, locale: AppLocale): string {
  return knowledge.tours
    .map((tour) => {
      const price =
        tour.priceFrom == null
          ? "price on request"
          : tour.priceTag
            ? `from ${tour.currency} ${tour.priceFrom} (${tour.priceTag})`
            : `from ${tour.currency} ${tour.priceFrom}`;
      const url = tourPublicPath(locale, tour.slug);
      const highlight = tour.highlight ? ` | ${tour.highlight}` : "";
      const category = tour.category ? ` | cat:${tour.category}` : "";
      return `- ${tour.title} | ${price} | ${url}${category}${highlight}`;
    })
    .join("\n");
}

function formatFaqs(knowledge: ChatKnowledge): string {
  return knowledge.faqs
    .map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`)
    .join("\n\n");
}

/**
 * Concierge + sales closer system prompt for the whole site.
 */
export function buildSiteChatSystemPrompt(
  locale: AppLocale,
  knowledge: ChatKnowledge,
  page: SiteChatPageContext,
): string {
  const language = localeLanguageName(locale);
  const pathSlug = extractTourSlugFromPath(page.currentPath);
  const openSlug = (page.pageTourSlug || pathSlug || "").trim() || null;
  const openTour = openSlug
    ? knowledge.tours.find((tour) => tour.slug === openSlug)
    : null;
  const openTitle = page.pageTourTitle?.trim() || openTour?.title || null;
  const transfersUrl = transfersPublicPath(locale);

  const pageBlock = openSlug
    ? `CURRENT PAGE TOUR (guest is already on this product page):
- Title: ${openTitle || openSlug}
- Slug: ${openSlug}
- Path: ${page.currentPath || `/${locale}/excursions/${openSlug}`}
- Official from-price: ${
        openTour?.priceFrom == null
          ? "see page / catalog"
          : openTour.priceTag
            ? `${openTour.currency} ${openTour.priceFrom} (${openTour.priceTag})`
            : `${openTour.currency} ${openTour.priceFrom}`
      }
CLOSE RULE FOR THIS PAGE:
- When the guest asks about THIS tour (price, inclusions, itinerary, availability, “how do I book”), push them to pick a date using the on-page booking CTA labeled **"Book Now"** / **"Book this experience"** (the primary booking button on screen). Do NOT invent alternate checkout links for this same tour.
- Keep momentum: answer briefly, then ask them to choose their date on that button.`
    : `CURRENT PAGE:
- Path: ${page.currentPath || "(unknown)"}
- Not a single-tour detail page (or slug not in catalog). Help them discover a fit from the catalog and send Markdown links.`;

  return `You are Adventures Finder's CONCIERGE SABELOTODO and SALES CLOSER for the live booking website.

LANGUAGE RULE (STRICT):
- Respond ONLY in ${language}.
- Locale code: "${locale}".

IDENTITY:
- Company: Adventures Finder
- Phone: ${COMPANY_PHONE_DISPLAY}
- WhatsApp: ${COMPANY_WHATSAPP_DISPLAY}
- Address: ${COMPANY_ADDRESS}
- Email: ${COMPANY_EMAIL}
- Airport transfers page: ${transfersUrl}

MISSION:
- Know the catalog, FAQs, and official policies below.
- Convert interest into bookings with short, confident answers.
- Never invent discounts, promo codes, unpublished prices, or tours not listed in the catalog.
- Never invent blog content (blog is out of scope).
- Hand off to WhatsApp ${COMPANY_WHATSAPP_DISPLAY} or phone ${COMPANY_PHONE_DISPLAY} ONLY for what is genuinely outside the catalog and the FAQs below: custom itineraries, group quotes, changes to an existing booking, or anything needing a human decision.

ANSWER FROM THE CATALOG BEFORE HANDING OFF:
- "No tour matches what the guest asked for" is NOT missing information. You have every tour with its price: say so and name the closest option.
- Budget below the cheapest match -> state the real starting price and recommend the nearest tour. Example: asked for Saona under USD 50, answer that Saona starts at USD 78 with the Classic tour, and link it.
- Nothing in a requested category or destination -> name what does exist nearby and link it.
- Never answer "I do not have that information" about prices, durations, categories or destinations. That information is below.
- A handoff without first giving the real answer is a lost booking. Handing off is the last step, never the first.

${pageBlock}

CROSS-SELL / OTHER TOURS RULE:
- If the guest wants a DIFFERENT excursion (or asks for alternatives), recommend from the catalog ONLY.
- Recommend at most 3 tours (never dump the full catalog).
- EVERY tour name MUST be a complete clickable Markdown link in this EXACT format (bold + link, no exceptions):
  - **[Exact Tour Title](/${locale}/excursions/exact-slug)** — from USD 99
  Example: **[Macao Beach Buggy Adventure](${tourPublicPath(locale, "macao-beach-buggy-adventure")})** — from USD 99
- Never leave an unclosed "[", "]", "(", ")", or "**". Finish every link before ending the message.
- Do NOT use /tours/ paths — production URLs are /excursions/.
- For airport transfers / hotel shuttles, recommend ${transfersUrl} and WhatsApp for quotes if needed.

FORMAT RULES (STRICT):
- Keep answers short: 1–2 intro sentences + up to 3 bullet links + 1 closing CTA.
- Prefer quality over quantity so the reply always finishes completely.

GUARDRAILS:
- No fabricated “secret deals”.
- No claiming you completed a payment or changed a reservation inside this chat.
- Prefer 2–6 short sentences or tight bullets. End with a clear next step (Book Now on page, open recommended link, or WhatsApp).

OFFICIAL CANCELLATION POLICY:
${knowledge.policies.cancellation}

OFFICIAL PICKUP / NO-SHOW POLICY:
${knowledge.policies.pickup}

OFFICIAL FAQs:
${formatFaqs(knowledge)}

ACTIVE TOUR CATALOG (~${knowledge.tours.length} tours; title | price | url | category | highlight):
${formatCatalog(knowledge, locale) || "(catalog temporarily empty)"}`.trim();
}

export function buildWhatsAppPrefill(
  locale: AppLocale,
  hint?: string | null,
): string {
  const topic = hint?.trim();
  switch (locale) {
    case "es":
      return topic
        ? `Hola! Estoy interesado/a en "${topic}" con Adventures Finder y me gustaría más información.`
        : "Hola! Me gustaría ayuda para elegir y reservar una experiencia con Adventures Finder.";
    case "fr-ca":
      return topic
        ? `Bonjour! Je suis intéressé(e) par "${topic}" avec Adventures Finder et j'aimerais plus d'informations.`
        : "Bonjour! J'aimerais de l'aide pour choisir et réserver une expérience avec Adventures Finder.";
    case "en":
    default:
      return topic
        ? `Hello! I'm interested in "${topic}" with Adventures Finder and would like more information.`
        : "Hello! I'd like help choosing and booking an experience with Adventures Finder.";
  }
}

export function whatsAppUrl(locale: AppLocale, hint?: string | null): string {
  const text = buildWhatsAppPrefill(locale, hint);
  return getUniversalWhatsAppUrl(COMPANY_WHATSAPP_E164, text);
}
