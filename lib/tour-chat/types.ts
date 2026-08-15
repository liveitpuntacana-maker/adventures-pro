import type { AppLocale } from "@/i18n/routing";

export type TourChatMessageRole = "user" | "assistant";

export type TourChatMessage = {
  role: TourChatMessageRole;
  content: string;
};

/** @deprecated Prefer SiteChatRequestBody — kept for transitional imports. */
export type TourChatPricingItem = {
  label: string;
  price?: number | string | null;
};

/** @deprecated Prefer page context via currentPath. */
export type TourChatContext = {
  title: string;
  slug: string;
  duration?: string | null;
  currency?: string | null;
  pricing?: TourChatPricingItem[] | null;
  infoTour?: string | null;
  whatHappens?: string | null;
  includes?: string | null;
  excludes?: string | null;
  goodToKnow?: string | null;
  faq?: string | null;
};

export type SiteChatRequestBody = {
  messages?: TourChatMessage[];
  locale?: AppLocale | string;
  currentPath?: string;
  pageTourSlug?: string;
  pageTourTitle?: string;
  /** Groups the turns of one conversation together in the chat log. */
  sessionId?: string;
};

/** @deprecated Use SiteChatRequestBody */
export type TourChatRequestBody = SiteChatRequestBody & {
  tourContext?: TourChatContext;
};

export type TourChatSuccessResponse = {
  ok: true;
  reply: string;
  model: string;
};

export type TourChatErrorResponse = {
  ok: false;
  error: "invalid_payload" | "unavailable" | "timeout" | "model_failed";
  fallback: "whatsapp";
};

export type TourChatResponse = TourChatSuccessResponse | TourChatErrorResponse;
export type SiteChatResponse = TourChatResponse;
