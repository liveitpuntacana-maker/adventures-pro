import { GoogleGenAI } from "@google/genai";
import { NextResponse, after } from "next/server";
import { routing, type AppLocale } from "@/i18n/routing";
import { geminiModelFallbackChain, resolveGeminiModel } from "@/lib/tour-chat/geminiConfig";
import { buildSiteChatSystemPrompt } from "@/lib/tour-chat/systemPrompt";
import type {
  SiteChatRequestBody,
  TourChatMessage,
  TourChatResponse,
} from "@/lib/tour-chat/types";
import { getChatKnowledge } from "@/lib/sanity/queries/chatKnowledge";
import { logChatSession } from "@/lib/tour-chat/chatLog";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_MESSAGES = 20;
const MAX_CONTENT_CHARS = 2000;
const MAX_PATH_CHARS = 300;
const GEMINI_TIMEOUT_MS = 12_000;
const MAX_OUTPUT_TOKENS = 2048;

function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && routing.locales.includes(value as AppLocale);
}

function sanitizeMessages(raw: unknown): TourChatMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) {
    return null;
  }

  const messages: TourChatMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > MAX_CONTENT_CHARS) return null;
    messages.push({ role, content: trimmed });
  }

  if (messages[messages.length - 1]?.role !== "user") return null;
  return messages;
}

function sanitizeOptionalString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function toGeminiContents(messages: TourChatMessage[]) {
  return messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
}

function errorResponse(
  error: "invalid_payload" | "unavailable" | "timeout" | "model_failed",
  status: number,
) {
  const body: TourChatResponse = { ok: false, error, fallback: "whatsapp" };
  return NextResponse.json(body, { status });
}

async function generateWithTimeout(
  ai: GoogleGenAI,
  model: string,
  systemInstruction: string,
  messages: TourChatMessage[],
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  const run = async (withThinkingOff: boolean) => {
    const response = await ai.models.generateContent({
      model,
      contents: toGeminiContents(messages),
      config: {
        systemInstruction,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        abortSignal: controller.signal,
        ...(withThinkingOff ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
      },
    });

    const text = (response.text ?? "").trim();
    if (!text) {
      throw new Error("empty_model_response");
    }

    const finishReason = String(
      response.candidates?.[0]?.finishReason ?? "",
    ).toUpperCase();
    if (finishReason === "MAX_TOKENS" || finishReason === "LENGTH") {
      throw new Error("truncated_max_tokens");
    }

    // Incomplete markdown links = truncated mid-tour list.
    const openBrackets = (text.match(/\[/g) ?? []).length;
    const closeBrackets = (text.match(/\]/g) ?? []).length;
    if (
      openBrackets !== closeBrackets ||
      /\*\*\[[^\]]*$/.test(text) ||
      /\[[^\]]*$/.test(text) ||
      /\]\([^)]*$/.test(text)
    ) {
      throw new Error("truncated_markdown");
    }

    return text;
  };

  try {
    try {
      return await run(true);
    } catch (error) {
      if (controller.signal.aborted) throw error;
      const message = error instanceof Error ? error.message : String(error);
      if (/thinking/i.test(message) || /invalid.?argument/i.test(message)) {
        return await run(false);
      }
      throw error;
    }
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  try {
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      return errorResponse("unavailable", 503);
    }

    const body = (await request.json()) as SiteChatRequestBody;
    const locale = isAppLocale(body.locale) ? body.locale : null;
    const messages = sanitizeMessages(body.messages);
    const currentPath = sanitizeOptionalString(body.currentPath, MAX_PATH_CHARS);
    const pageTourSlug = sanitizeOptionalString(body.pageTourSlug, 160);
    const pageTourTitle = sanitizeOptionalString(body.pageTourTitle, 200);
    const sessionId = sanitizeOptionalString(body.sessionId, 64);

    if (!locale || !messages) {
      return errorResponse("invalid_payload", 400);
    }

    const knowledge = await getChatKnowledge(locale);
    const systemInstruction = buildSiteChatSystemPrompt(locale, knowledge, {
      currentPath,
      pageTourSlug,
      pageTourTitle,
    });

    const ai = new GoogleGenAI({ apiKey });
    const models = geminiModelFallbackChain(resolveGeminiModel());

    let lastError: unknown = null;
    for (const model of models) {
      try {
        const reply = await generateWithTimeout(ai, model, systemInstruction, messages);

        // after() runs once the reply is on its way, so storing the transcript
        // never adds latency for the visitor.
        if (sessionId) {
          const log = () =>
            logChatSession({
              sessionId,
              locale,
              messages,
              reply,
              currentPath,
              pageTourTitle,
            });

          // debug awaits the write so the outcome can be inspected; normal
          // traffic defers it so logging never adds latency.
          if (body.debug === true) {
            const logResult = await log();
            return NextResponse.json({ ok: true, reply, model, logResult });
          }

          after(log);
        }

        const success: TourChatResponse = { ok: true, reply, model };
        return NextResponse.json(success);
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("abort") || message.toLowerCase().includes("timeout")) {
          return errorResponse("timeout", 504);
        }
        continue;
      }
    }

    console.error("[site-chat] all models failed", lastError);
    return errorResponse("model_failed", 502);
  } catch (error) {
    console.error("[site-chat] unexpected error", error);
    return errorResponse("model_failed", 500);
  }
}
