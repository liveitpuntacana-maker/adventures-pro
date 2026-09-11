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
  /** {name} is replaced with what the visitor just typed. */
  leadAskName: string;
  leadAskEmail: string;
  leadEmailRetry: string;
  leadEmailGiveUp: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  /** {name} is replaced with the text the visitor typed as their name. */
  leadConfirmName: string;
  leadConfirmYes: string;
  leadConfirmRetype: string;
  leadAskNameAgain: string;
  /** Closes the name/email intro without repeating the self-introduction already given. */
  leadReadyToHelp: string;
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
        leadAskName:
          "¡Hola! Soy el Asistente de Reservas de Adventures Finder 👋 Antes de empezar, ¿cómo te llamas?",
        leadAskEmail: "¡Gracias, {name}! ¿Y tu correo, por si la conversación se corta?",
        leadEmailRetry: "Ese correo no parece válido — ¿lo escribes de nuevo?",
        leadEmailGiveUp: "Sin problema, sigamos sin correo. ¿En qué te ayudo?",
        namePlaceholder: "Tu nombre",
        emailPlaceholder: "Tu correo",
        leadConfirmName: "¿\"{name}\" es tu nombre, o prefieres escribirlo de nuevo?",
        leadConfirmYes: "Sí, es mi nombre",
        leadConfirmRetype: "Escribirlo de nuevo",
        leadAskNameAgain: "Claro, adelante.",
        leadReadyToHelp: "¡Genial, gracias! ¿Buscas un tour, un traslado o ayuda para reservar?",
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
        leadAskName:
          "Bonjour! Je suis l'Assistant de Réservation d'Adventures Finder 👋 Avant de commencer, quel est votre nom?",
        leadAskEmail: "Merci, {name}! Et votre courriel, au cas où la conversation serait interrompue?",
        leadEmailRetry: "Ce courriel ne semble pas valide — pouvez-vous le réécrire?",
        leadEmailGiveUp: "Pas de problème, continuons sans courriel. Comment puis-je vous aider?",
        namePlaceholder: "Votre nom",
        emailPlaceholder: "Votre courriel",
        leadConfirmName: "« {name} » est-il votre nom, ou préférez-vous le réécrire?",
        leadConfirmYes: "Oui, c'est mon nom",
        leadConfirmRetype: "Le réécrire",
        leadAskNameAgain: "Bien sûr, allez-y.",
        leadReadyToHelp: "Parfait, merci! Excursion, transfert ou réservation — comment puis-je vous aider?",
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
        leadAskName:
          "Hi! I'm the Adventures Finder Booking Assistant 👋 Before we start, what's your name?",
        leadAskEmail: "Thanks, {name}! And your email, in case we get disconnected?",
        leadEmailRetry: "That email doesn't look right — mind typing it again?",
        leadEmailGiveUp: "No problem, let's continue without it. How can I help?",
        namePlaceholder: "Your name",
        leadConfirmName: "Is \"{name}\" your name, or would you rather type it again?",
        leadConfirmYes: "Yes, that's my name",
        leadConfirmRetype: "Type it again",
        leadAskNameAgain: "Sure, go ahead.",
        leadReadyToHelp: "Great, thanks! Looking for a tour, a transfer, or help booking?",
        emailPlaceholder: "Your email",
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

const LEAD_STORAGE_KEY = "af-chat-lead";

type StoredLead = { name: string; email: string; askedAt: number };

/**
 * Remembers that this visitor already gave their name and email this tab
 * session. Without this, closing and reopening the widget on the same visit
 * would ask again, which reads as the site not listening.
 */
function readStoredLead(): StoredLead | null {
  try {
    const raw = window.sessionStorage.getItem(LEAD_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredLead) : null;
  } catch {
    return null;
  }
}

function writeStoredLead(lead: StoredLead): void {
  try {
    window.sessionStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(lead));
  } catch {
    /* Private browsing or storage disabled: the prompt just reappears next open. */
  }
}

/** Loose on purpose: this gates a lead field, not a signup form. */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Catches the case a real visitor hit: typing their actual question ("quiero
 * saber los precios de saona") into the name field instead of a name. There is
 * no strict format for a name to check against, so this only flags what a
 * name essentially never is — a question, or a full sentence — rather than
 * policing short or unusual names, which would misfire constantly.
 */
function looksLikeAQuestionNotAName(value: string): boolean {
  if (value.includes("?") || value.includes("¿")) return true;
  if (value.length > 45) return true;
  // A real name is rarely more than four words (two given names, two
  // surnames); "quiero saber los precios de saona" is six.
  if (value.trim().split(/\s+/).length > 4) return true;
  return false;
}

/** After this many bad emails, being right stops mattering more than not losing the visitor. */
const MAX_EMAIL_ATTEMPTS = 2;

async function fetchSiteChat(
  payload: {
    messages: TourChatMessage[];
    locale: AppLocale;
    currentPath: string;
    pageTourSlug?: string | null;
    sessionId: string;
    visitorName?: string;
    visitorEmail?: string;
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

  // The name/email ask happens as two turns inside the conversation itself,
  // not a separate form — the client wants it to read as a cordial question,
  // not paperwork. "done" is the only step that unlocks the real assistant.
  const [leadStep, setLeadStep] = useState<
    "askName" | "confirmName" | "askEmail" | "done" | null
  >(null);
  const [leadTurns, setLeadTurns] = useState<{ role: "assistant" | "user"; content: string }[]>([]);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [emailAttempts, setEmailAttempts] = useState(0);
  // Held while leadStep is "confirmName": what they typed, awaiting a yes/retype answer.
  const [pendingName, setPendingName] = useState("");

  const waHref = whatsAppUrl(locale, pageTourSlug);
  const activeInputPlaceholder =
    leadStep === "askName"
      ? copy.namePlaceholder
      : leadStep === "askEmail"
        ? copy.emailPlaceholder
        : copy.placeholder;

  useEffect(() => {
    if (open || teaserDismissed) return;
    const timer = window.setTimeout(() => setShowTeaser(true), TEASER_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [open, teaserDismissed]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, leadTurns, messages, showWhatsAppFallback, isPending]);

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

    // Ask once per tab session. A returning visitor who already answered goes
    // straight into the real conversation, no re-greeting.
    if (leadStep === null) {
      const stored = readStoredLead();
      if (stored) {
        setLeadName(stored.name);
        setLeadEmail(stored.email);
        setLeadStep("done");
        setLeadTurns([{ role: "assistant", content: copy.welcome }]);
      } else {
        setLeadStep("askName");
        setLeadTurns([{ role: "assistant", content: copy.leadAskName }]);
      }
    }
  }

  /** Routes what's in the input box to the name/email intro or to the real assistant. */
  function handlePrimarySubmit() {
    if (leadStep === "askName" || leadStep === "askEmail") {
      handleLeadStepSubmit();
      return;
    }
    handleSend();
  }

  function advanceToEmailStep(name: string) {
    setLeadName(name);
    setLeadTurns((prev) => [
      ...prev,
      { role: "assistant", content: copy.leadAskEmail.replace("{name}", name) },
    ]);
    setLeadStep("askEmail");
  }

  function handleLeadStepSubmit() {
    const text = input.trim();
    if (!text) return;
    setInput("");

    if (leadStep === "askName") {
      setLeadTurns((prev) => [...prev, { role: "user", content: text }]);

      // Flagged once, not looped: an unusual real name should never take more
      // than one extra tap to get past. This is the exact failure a real
      // visitor hit — typing their question ("quiero saber los precios de
      // saona") into the name field.
      if (looksLikeAQuestionNotAName(text)) {
        setPendingName(text);
        setLeadTurns((prev) => [
          ...prev,
          { role: "assistant", content: copy.leadConfirmName.replace("{name}", text) },
        ]);
        setLeadStep("confirmName");
        return;
      }

      advanceToEmailStep(text);
      return;
    }

    // leadStep === "askEmail"
    if (!looksLikeEmail(text)) {
      const attempts = emailAttempts + 1;
      setEmailAttempts(attempts);

      // Required in principle, but trapping someone who genuinely won't give
      // an email forever just loses the sale. After a few honest tries, let
      // them through with the name alone rather than lock the chat.
      if (attempts >= MAX_EMAIL_ATTEMPTS) {
        // leadEmailGiveUp already ends on "how can I help", so nothing more
        // needs saying — an extra line here would ask the same question twice.
        setLeadTurns((prev) => [
          ...prev,
          { role: "user", content: text },
          { role: "assistant", content: copy.leadEmailGiveUp },
        ]);
        writeStoredLead({ name: leadName, email: "", askedAt: Date.now() });
        trackGAEvent("submit_chat_lead", { locale, has_name: leadName.length > 0, gave_up_on_email: true });
        setLeadStep("done");
        return;
      }

      setLeadTurns((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: copy.leadEmailRetry },
      ]);
      return;
    }

    setLeadEmail(text);
    setLeadTurns((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: copy.leadReadyToHelp },
    ]);
    writeStoredLead({ name: leadName, email: text, askedAt: Date.now() });
    trackGAEvent("submit_chat_lead", { locale, has_name: leadName.length > 0, gave_up_on_email: false });
    setLeadStep("done");
  }

  function confirmPendingName() {
    setLeadTurns((prev) => [...prev, { role: "user", content: copy.leadConfirmYes }]);
    advanceToEmailStep(pendingName);
  }

  function retypeName() {
    setLeadTurns((prev) => [
      ...prev,
      { role: "user", content: copy.leadConfirmRetype },
      { role: "assistant", content: copy.leadAskNameAgain },
    ]);
    setPendingName("");
    setLeadStep("askName");
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
    if (!text || isPending || leadStep !== "done") return;

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
            visitorName: leadName || undefined,
            visitorEmail: leadEmail || undefined,
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
            {leadTurns.map((turn, index) => (
              <div
                key={`lead-${index}-${turn.content.slice(0, 24)}`}
                className={
                  turn.role === "user"
                    ? "ml-6 rounded-2xl rounded-tr-md bg-orange-500 px-3 py-2 text-sm leading-relaxed text-white"
                    : "mr-6 rounded-2xl rounded-tl-md bg-white px-3 py-2 text-sm leading-relaxed text-slate-700 shadow-sm"
                }
              >
                {turn.content}
              </div>
            ))}

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

          {leadStep === "confirmName" ? (
            <div className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
              <button
                type="button"
                onClick={confirmPendingName}
                className="flex-1 rounded-xl bg-orange-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                {copy.leadConfirmYes}
              </button>
              <button
                type="button"
                onClick={retypeName}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                {copy.leadConfirmRetype}
              </button>
            </div>
          ) : (
            <form
              className="flex items-end gap-2 border-t border-slate-200 bg-white p-3"
              onSubmit={(event) => {
                event.preventDefault();
                handlePrimarySubmit();
              }}
            >
              <label className="sr-only" htmlFor="site-ai-chat-input">
                {activeInputPlaceholder}
              </label>
              <textarea
                id="site-ai-chat-input"
                rows={2}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={activeInputPlaceholder}
                autoComplete={leadStep === "askName" ? "name" : leadStep === "askEmail" ? "email" : "off"}
                className="max-h-24 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-orange-500/25 placeholder:text-slate-400 focus:ring-2"
                disabled={isPending}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handlePrimarySubmit();
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
          )}
        </section>
      )}
    </div>
  );
}
