import { defineQuery } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { routing, type AppLocale } from "@/i18n/routing";

const HIGHLIGHT_MAX = 150;
const REVALIDATE_SECONDS = 3600;

export type ChatKnowledgeTour = {
  title: string;
  slug: string;
  priceFrom: number | null;
  priceTag: string | null;
  currency: string;
  category: string | null;
  highlight: string;
};

export type ChatKnowledgeFaq = {
  question: string;
  answer: string;
};

export type ChatKnowledge = {
  locale: AppLocale;
  tours: ChatKnowledgeTour[];
  faqs: ChatKnowledgeFaq[];
  policies: {
    cancellation: string;
    pickup: string;
  };
  /** Public path prefix for tour detail links (production routes). */
  tourPathPrefix: "/excursions";
  transfersPath: "/transfers";
};

/**
 * The whole catalogue for the sales concierge.
 *
 * This used to stop at the sixty cheapest, which quietly hid the twenty most
 * valuable products: the private charters, the yacht, the multi-day packages.
 * Asked for a yacht, the assistant answered that there was none. Eighty titles
 * with a price and one line of blurb cost very little context and the ones that
 * were missing are the ones worth selling.
 *
 * Blog posts stay out on purpose: the assistant sells, it does not narrate.
 */
export const CHAT_TOURS_QUERY = defineQuery(/* groq */ `
  *[_type == "tour" && defined(slug.current)]
  | order(
      coalesce(pricing[0].price, mainTour->pricing[0].price, 999999) asc
    ){
    "title": coalesce(
      select($locale == "fr-ca" => title.frCA, title[$locale]),
      title.en,
      title.es,
      title.frCA
    ),
    "slug": slug.current,
    "priceFrom": coalesce(pricing[0].price, mainTour->pricing[0].price),
    "priceTag": coalesce(priceTag, mainTour->priceTag),
    "currency": coalesce(currency, mainTour->currency, "USD"),
    "category": coalesce(
      select(
        isCombo == true => mainTour->category->slug.current,
        category->slug.current
      ),
      coalesce(comboDays, comboItems)[0].tour->category->slug.current
    ),
    "highlightSource": coalesce(
      select(defined(highlightBadge) && highlightBadge != "" => highlightBadge),
      select(
        $locale == "fr-ca" => infoTour.frCA,
        infoTour[$locale]
      ),
      infoTour.en,
      infoTour.es,
      infoTour.frCA,
      select(
        $locale == "fr-ca" => mainTour->infoTour.frCA,
        mainTour->infoTour[$locale]
      ),
      mainTour->infoTour.en,
      mainTour->infoTour.es,
      mainTour->infoTour.frCA
    )
  }
`);

/**
 * Official company FAQs / policies (same content as /faqs + /cancellation-policy).
 * Not stored as Sanity documents today — kept here so the model stays conversion-focused
 * without pulling blog or long CMS blobs.
 */
function officialFaqs(): ChatKnowledgeFaq[] {
  return [
    {
      question: "How do I book a tour?",
      answer:
        "Select the tour on the website, click Book Now, choose date/time and participants, then pay. For help use WhatsApp or email info@adventuresfinder.com / reservations@adventuresfinder.com.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "Online booking accepts major credit/debit cards and the payment options shown at checkout (including PayPal when available).",
    },
    {
      question: "How do I receive confirmation and pickup details?",
      answer:
        "After booking you receive a confirmation email with a confirmation number and pickup details. Provide an accurate hotel name. For condos/private stays, email the exact location after booking — missing location can cause a missed pickup treated as a no-show.",
    },
    {
      question: "Is transportation included?",
      answer:
        "Yes, transportation is included on tours. Pickup/drop-off points depend on the hotel; some use the lobby, others a meeting point. Condos use the nearest designated pickup once the exact address is shared.",
    },
    {
      question: "Age or health restrictions?",
      answer:
        "Restrictions vary by tour. Always check the specific tour page for age and health requirements.",
    },
    {
      question: "Are meals included?",
      answer:
        "Depends on the tour. Check Includes on the tour page for meals, drinks, or water.",
    },
    {
      question: "Weather cancellations?",
      answer:
        "Safety first. If Adventures Finder cancels for weather, guests may reschedule or receive a full refund per the cancellation policy.",
    },
    {
      question: "Are tours guided / languages?",
      answer:
        "Tours are guided by certified bilingual guides (Spanish and English). French support is also available.",
    },
    {
      question: "Private tours?",
      answer:
        "Yes. Contact reservations@adventuresfinder.com or WhatsApp for private-tour pricing and customization.",
    },
  ];
}

function officialPolicies() {
  return {
    cancellation: [
      "Cancel more than 24 hours before the scheduled tour: 100% refund.",
      "Cancel less than 24 hours before: no refund.",
      "Illness on tour day: valid medical report required for refund eligibility; otherwise standard policy applies.",
      "Weather cancellation by Adventures Finder: reschedule OR full refund.",
    ].join(" "),
    pickup: [
      "Drivers wait a maximum of 10 minutes at the designated pickup point.",
      "Missing the 10-minute window is a no-show with no refund.",
      "Provide accurate hotel/condo location before the tour to avoid missed pickup.",
    ].join(" "),
  };
}

function truncateHighlight(value: unknown): string {
  if (typeof value !== "string") return "";
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= HIGHLIGHT_MAX) return compact;
  return `${compact.slice(0, HIGHLIGHT_MAX - 1).trimEnd()}…`;
}

function normalizeLocale(locale: string): AppLocale {
  return routing.locales.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : routing.defaultLocale;
}

type RawChatTour = {
  title?: string | null;
  slug?: string | null;
  priceFrom?: number | null;
  priceTag?: string | null;
  currency?: string | null;
  category?: string | null;
  highlightSource?: string | null;
};

type RawKnowledgeBase = {
  faqs?: Array<{ question?: string; answer?: string }>;
  cancellationPolicy?: string;
  pickupPolicy?: string;
};

/**
 * FAQs and policies as an editor maintains them.
 *
 * Falls back to the values written in this file when the document does not
 * exist or a field is left empty, so the assistant is never left without an
 * answer about refunds or pickup while someone fills the form in.
 */
const KNOWLEDGE_BASE_QUERY = defineQuery(/* groq */ `
  *[_type == "chatKnowledgeBase"][0]{
    "faqs": faqs[]{
      "question": coalesce(select($locale == "fr-ca" => question.frCA, question[$locale]), question.en, question.es),
      "answer": coalesce(select($locale == "fr-ca" => answer.frCA, answer[$locale]), answer.en, answer.es)
    },
    "cancellationPolicy": coalesce(
      select($locale == "fr-ca" => cancellationPolicy.frCA, cancellationPolicy[$locale]),
      cancellationPolicy.en, cancellationPolicy.es
    ),
    "pickupPolicy": coalesce(
      select($locale == "fr-ca" => pickupPolicy.frCA, pickupPolicy[$locale]),
      pickupPolicy.en, pickupPolicy.es
    )
  }
`);

/**
 * Server-side chat knowledge with Next.js Data Cache (1 hour).
 * Blog content is intentionally excluded.
 */
export async function getChatKnowledge(locale: string): Promise<ChatKnowledge> {
  const activeLocale = normalizeLocale(locale);

  const [rawTours, base] = await Promise.all([
    client.fetch<RawChatTour[]>(
      CHAT_TOURS_QUERY,
      { locale: activeLocale },
      { next: { revalidate: REVALIDATE_SECONDS, tags: ["chat-knowledge", "tour"] } },
    ),
    client
      .fetch<RawKnowledgeBase | null>(
        KNOWLEDGE_BASE_QUERY,
        { locale: activeLocale },
        { next: { revalidate: REVALIDATE_SECONDS, tags: ["chat-knowledge"] } },
      )
      .catch(() => null),
  ]);

  const editedFaqs = (base?.faqs ?? [])
    .filter((faq) => faq?.question?.trim() && faq?.answer?.trim())
    .map((faq) => ({ question: faq.question!.trim(), answer: faq.answer!.trim() }));

  const fallback = officialPolicies();

  const tours: ChatKnowledgeTour[] = (rawTours ?? [])
    .filter((tour): tour is RawChatTour & { title: string; slug: string } =>
      Boolean(tour?.title?.trim() && tour?.slug?.trim()),
    )
    .map((tour) => ({
      title: tour.title.trim(),
      slug: tour.slug.replace(/^\/+|\/+$/g, ""),
      priceFrom:
        typeof tour.priceFrom === "number" && Number.isFinite(tour.priceFrom)
          ? tour.priceFrom
          : null,
      priceTag: tour.priceTag?.trim() || null,
      currency: (tour.currency || "USD").trim() || "USD",
      category: tour.category?.trim() || null,
      highlight: truncateHighlight(tour.highlightSource),
    }));

  return {
    locale: activeLocale,
    tours,
    faqs: editedFaqs.length > 0 ? editedFaqs : officialFaqs(),
    policies: {
      cancellation: base?.cancellationPolicy?.trim() || fallback.cancellation,
      pickup: base?.pickupPolicy?.trim() || fallback.pickup,
    },
    tourPathPrefix: "/excursions",
    transfersPath: "/transfers",
  };
}

export function tourPublicPath(locale: AppLocale, slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  return `/${locale}/excursions/${clean}`;
}

export function transfersPublicPath(locale: AppLocale): string {
  return `/${locale}/transfers`;
}
