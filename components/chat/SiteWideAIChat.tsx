"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import {
  looksTruncatedMarkdown,
  renderAssistantMarkdown,
} from "@/components/chat/renderAssistantMarkdown";
import { getAnalyticsDevice, trackGAEvent } from "@/lib/utils/analytics";
import { whatsAppUrl } from "@/lib/tour-chat/systemPrompt";
import type { TourChatMessage, TourChatResponse } from "@/lib/tour-chat/types";

const CLIENT_TIMEOUT_MS = 10_000;
const TEASER_DELAY_MS = 6_000;

type SiteWideAIChatProps = {
  locale: AppLocale;
};

type UiCopy = {
  launcher: string;
  title: string;
  subtitle: string;
  placeholder: string;
  send: string;
  thinking: string;
  welcome: string;
  whatsappCta: string;
  whatsappHint: string;
  close: string;
  teaser: string;
  teaserGeneral: string;
  dismissTeaser: string;
};

function copyForLocale(locale: AppLocale): UiCopy {
  switch (locale) {
    case "es":
      return {
        launcher: "Pregúntame",
        title: "Asistente de Reservas",
        subtitle: "Catálogo, precios y reservas",
        placeholder: "Escribe tu pregunta…",
        send: "Enviar",
        thinking: "Pensando…",
        welcome:
          "¡Hola! Soy el Asistente de Reservas de Adventures Finder. ¿Buscas un tour, un traslado o ayuda para reservar?",
        whatsappCta: "Continuar por WhatsApp",
        whatsappHint:
          "Nuestro equipo te responde por WhatsApp al +1 849 570 0202.",
        close: "Cerrar chat",
        teaser: "👋 ¿Dudas sobre este tour? ¡Pregúntame!",
        teaserGeneral: "👋 ¿Buscas el tour perfecto? ¡Pregúntame!",
        dismissTeaser: "Cerrar sugerencia",
      };
    case "fr-ca":
      return {
        launcher: "Posez-moi une question",
        title: "Assistant de Réservation",
        subtitle: "Catalogue, prix et réservations",
        placeholder: "Écrivez votre question…",
        send: "Envoyer",
        thinking: "Réflexion…",
        welcome:
          "Bonjour! Je suis l'Assistant de Réservation d'Adventures Finder. Excursion, transfert ou réservation — comment puis-je vous aider?",
        whatsappCta: "Continuer sur WhatsApp",
        whatsappHint:
          "Notre équipe vous répond sur WhatsApp au +1 849 570 0202.",
        close: "Fermer le chat",
        teaser: "👋 Des questions sur cette excursion? Demandez-moi!",
        teaserGeneral: "👋 Besoin d'aide pour choisir? Demandez-moi!",
        dismissTeaser: "Fermer la suggestion",
      };
    case "en":
    default:
      return {
        launcher: "Ask me",
        title: "Booking Assistant",
        subtitle: "Catalog, prices & bookings",
        placeholder: "Type your question…",
        send: "Send",
        thinking: "Thinking…",
        welcome:
          "Hi! I'm the Adventures Finder Booking Assistant. Looking for a tour, a transfer, or help booking?",
        whatsappCta: "Continue on WhatsApp",
        whatsappHint: "Our team will reply on WhatsApp at +1 849 570 0202.",
        close: "Close chat",
        teaser: "👋 Questions about this tour? Ask me!",
        teaserGeneral: "👋 Looking for the perfect tour? Ask me!",
        dismissTeaser: "Dismiss tip",
      };
  }
}

function pageTourSlugFromPath(pathname: string): string | null {
  const match = pathname.match(/\/excursions\/(?!categoria\/|destino\/)([^/?#]+)/i);
  if (!match?.[1]) return null;
  return decodeURIComponent(match[1]).replace(/^\/+|\/+$/g, "");
}

/**
 * Stable id for this conversation, so every turn is logged into the same
 * record instead of a new one. Lives in sessionStorage: it disappears when the
 * tab closes and is never used to identify the visitor across visits.
 */
function getChatSessionId(): string {
  const KEY = "af-chat-session";
  try {
    const existing = window.sessionStorage.getItem(KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(KEY, id);
    return id;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

async function fetchSiteChat(
  payload: {
    messages: TourChatMessage[];
    locale: AppLocale;
    currentPath: string;
    pageTourSlug?: string | null;
    sessionId: string;
  },
  signal: AbortSignal,
): Promise<TourChatResponse> {
  const response = await fetch("/api/site-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  try {
    return (await response.json()) as TourChatResponse;
  } catch {
    return { ok: false, error: "model_failed", fallback: "whatsapp" };
  }
}

export default function SiteWideAIChat({ locale }: SiteWideAIChatProps) {
  const copy = copyForLocale(locale);
  const pathname = usePathname();
  const currentPath = useMemo(() => {
    const path = pathname?.startsWith("/") ? pathname : `/${pathname || ""}`;
    // next-intl usePathname omits the locale prefix — restore it for the API/prompt.
    if (path === "/" || path === "") return `/${locale}`;
    return `/${locale}${path}`;
  }, [locale, pathname]);

  const pageTourSlug = useMemo(
    () => pageTourSlugFromPath(currentPath),
    [currentPath],
  );

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<TourChatMessage[]>([]);
  const [showWhatsAppFallback, setShowWhatsAppFallback] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [teaserDismissed, setTeaserDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const waHref = whatsAppUrl(locale, pageTourSlug);

  useEffect(() => {
    if (open || teaserDismissed) return;
    const timer = window.setTimeout(() => setShowTeaser(true), TEASER_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [open, teaserDismissed]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, messages, showWhatsAppFallback, isPending]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  function openChat() {
    setOpen(true);
    setShowTeaser(false);
    trackGAEvent("open_booking_assistant", {
      locale,
      device: getAnalyticsDevice(),
      page_path: currentPath,
    });
  }

  function dismissTeaser() {
    setShowTeaser(false);
    setTeaserDismissed(true);
  }

  function activateWhatsAppFallback() {
    setShowWhatsAppFallback(true);
  }

  function handleRecommendationClick(destinationUrl: string) {
    trackGAEvent("click_assistant_recommendation", {
      destination_url: destinationUrl,
    });
  }

  function handleWhatsAppFallbackClick() {
    trackGAEvent("click_whatsapp_fallback", {
      locale,
      page_path: currentPath,
    });
  }

  function handleSend() {
    const text = input.trim();
    if (!text || isPending) return;

    const nextMessages: TourChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(nextMessages);
    setInput("");
    setShowWhatsAppFallback(false);

    startTransition(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const timeoutId = window.setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

      try {
        const result = await fetchSiteChat(
          {
            messages: nextMessages,
            locale,
            currentPath,
            pageTourSlug,
            sessionId: getChatSessionId(),
          },
          controller.signal,
        );

        if (!result.ok) {
          activateWhatsAppFallback();
          return;
        }

        if (looksTruncatedMarkdown(result.reply)) {
          activateWhatsAppFallback();
          return;
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.reply },
        ]);
      } catch {
        activateWhatsAppFallback();
      } finally {
        window.clearTimeout(timeoutId);
      }
    });
  }

  return (
    <div className="pointer-events-none fixed bottom-24 right-4 z-50 transition-[bottom,right] duration-300 ease-out md:bottom-6 md:right-6">
      {!open ? (
        <div className="pointer-events-auto relative flex flex-col items-end gap-2">
          {showTeaser ? (
            <div
              role="status"
              className="max-w-[16rem] rounded-2xl border border-orange-200 bg-white px-3 py-2 text-sm leading-snug text-slate-800 shadow-lg shadow-orange-500/20"
            >
              <div className="flex items-start gap-2">
                <p className="flex-1">
                  {pageTourSlug ? copy.teaser : copy.teaserGeneral}
                </p>
                <button
                  type="button"
                  onClick={dismissTeaser}
                  className="rounded-md p-0.5 text-slate-400 transition hover:bg-orange-50 hover:text-slate-700"
                  aria-label={copy.dismissTeaser}
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>
          ) : null}
          <button
            type="button"
            onClick={openChat}
            className="relative inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/40 transition hover:bg-orange-600"
            aria-label={copy.launcher}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 animate-ping rounded-2xl bg-orange-400/40"
            />
            <MessageCircle className="relative h-5 w-5 shrink-0 animate-pulse" strokeWidth={1.75} />
            <span className="relative max-w-[11rem] truncate sm:max-w-none">{copy.launcher}</span>
          </button>
        </div>
      ) : (
        <section
          className="pointer-events-auto flex h-[min(28rem,70vh)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-orange-200/80 bg-white shadow-2xl shadow-orange-500/20"
          aria-label={copy.title}
        >
          <header className="flex items-start justify-between gap-3 border-b border-orange-200/80 bg-orange-500 px-4 py-3 text-white">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">{copy.title}</p>
              <p className="truncate text-xs text-orange-50/95">{copy.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-orange-50 transition hover:bg-white/15 hover:text-white"
              aria-label={copy.close}
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-3 py-3">
            <p className="rounded-2xl rounded-tl-md bg-white px-3 py-2 text-sm leading-relaxed text-slate-700 shadow-sm">
              {copy.welcome}
            </p>

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}-${message.content.slice(0, 24)}`}
                className={
                  message.role === "user"
                    ? "ml-6 rounded-2xl rounded-tr-md bg-orange-500 px-3 py-2 text-sm leading-relaxed text-white"
                    : "mr-6 rounded-2xl rounded-tl-md bg-white px-3 py-2 text-sm leading-relaxed text-slate-700 shadow-sm whitespace-pre-wrap"
                }
              >
                {message.role === "assistant"
                  ? renderAssistantMarkdown(message.content, {
                      onLinkClick: handleRecommendationClick,
                    })
                  : message.content}
              </div>
            ))}

            {isPending ? (
              <p className="mr-6 rounded-2xl rounded-tl-md bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
                {copy.thinking}
              </p>
            ) : null}

            {showWhatsAppFallback ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-950">
                <p className="leading-relaxed">{copy.whatsappHint}</p>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsAppFallbackClick}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
                >
                  {copy.whatsappCta}
                </a>
              </div>
            ) : null}
          </div>

          <form
            className="flex items-end gap-2 border-t border-slate-200 bg-white p-3"
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
          >
            <label className="sr-only" htmlFor="site-ai-chat-input">
              {copy.placeholder}
            </label>
            <textarea
              id="site-ai-chat-input"
              rows={2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={copy.placeholder}
              className="max-h-24 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-orange-500/25 placeholder:text-slate-400 focus:ring-2"
              disabled={isPending}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              type="submit"
              disabled={isPending || !input.trim()}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={copy.send}
            >
              <Send className="h-4 w-4" strokeWidth={2} />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
