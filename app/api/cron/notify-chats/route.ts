import { NextResponse, type NextRequest } from "next/server";
import { getSanityWriteClient } from "@/lib/soro/sanityWriteClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Who gets the transcript once a conversation is over. */
const RECIPIENTS = ["reservations@adventuresfinder.com", "info@afdmctravel.com"];

/**
 * Silence after which a conversation is treated as finished.
 *
 * Long enough that someone who opens a tour page mid-chat and comes back is
 * still the same conversation; short enough that reservations reads it while
 * the visitor may still be deciding.
 */
const IDLE_MINUTES = 20;

/** Guards against a slow run being overtaken by the next one. */
const MAX_PER_RUN = 25;

type ChatSession = {
  _id: string;
  sessionId?: string;
  locale?: string;
  transcript?: string;
  startedAt?: string;
  lastMessageAt?: string;
  currentPath?: string;
  pageTourTitle?: string;
  messageCount?: number;
  recommendedTours?: string[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** First thing the visitor asked, which is what makes a useful subject line. */
function firstQuestion(transcript: string): string {
  const line = transcript
    .split("\n")
    .find((entry) => entry.startsWith("Cliente:"));
  const text = (line ?? transcript).replace(/^Cliente:\s*/, "").trim();
  return text.length > 70 ? `${text.slice(0, 70)}…` : text || "Sin pregunta";
}

function buildHtml(session: ChatSession): string {
  const when = session.lastMessageAt
    ? new Date(session.lastMessageAt).toLocaleString("es-ES", {
        dateStyle: "long",
        timeStyle: "short",
      })
    : "";

  const meta = [
    ["Idioma", (session.locale ?? "").toUpperCase()],
    ["Página", session.currentPath ?? "—"],
    ["Tour de esa página", session.pageTourTitle ?? "—"],
    ["Mensajes", String(session.messageCount ?? 0)],
    ["Última actividad", when],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 14px 4px 0;color:#64748b;">${label}</td><td style="padding:4px 0;color:#0f172a;">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  const recommended = session.recommendedTours?.length
    ? `<p style="margin:18px 0 0;color:#64748b;font-size:13px;">Tours que recomendó el asistente: ${session.recommendedTours
        .map((slug) => escapeHtml(slug))
        .join(", ")}</p>`
    : "";

  return `<div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:640px;color:#0f172a;">
  <h2 style="margin:0 0 4px;font-size:18px;">Conversación del chat</h2>
  <p style="margin:0 0 18px;color:#64748b;font-size:14px;">Un visitante preguntó y el asistente respondió. Conviene revisar si la respuesta fue correcta.</p>
  <table style="border-collapse:collapse;font-size:13px;margin-bottom:18px;">${meta}</table>
  <pre style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;font-family:inherit;font-size:14px;line-height:1.6;margin:0;">${escapeHtml(session.transcript ?? "")}</pre>
  ${recommended}
</div>`;
}

/**
 * Emails finished conversations to the team, once each.
 *
 * There is no "conversation ended" event to hook into: the site is serverless
 * and the visitor simply stops typing. So the end is inferred from silence, and
 * this runs often enough to notice. `notifiedAt` is what keeps it to one email
 * per conversation no matter how many times the job runs.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    return NextResponse.json(
      { ok: false, error: "RESEND_API_KEY o RESEND_FROM sin configurar" },
      { status: 500 },
    );
  }

  // Sin token no hay nada que leer ni que marcar. Se responde con el motivo en
  // vez de dejar que el cliente de Sanity lance: un cron que revienta sin
  // explicacion es un cron que nadie arregla.
  if (!process.env.SANITY_WRITE_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "SANITY_WRITE_TOKEN sin configurar" },
      { status: 500 },
    );
  }

  const cutoff = new Date(Date.now() - IDLE_MINUTES * 60_000).toISOString();
  const client = getSanityWriteClient();

  const pending = await client.fetch<ChatSession[]>(
    `*[_type == "chatSession" && !defined(notifiedAt) && defined(transcript) && lastMessageAt < $cutoff]
      | order(lastMessageAt asc) [0...$limit]`,
    { cutoff, limit: MAX_PER_RUN },
  );

  let sent = 0;
  const failed: string[] = [];

  for (const session of pending) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: RECIPIENTS,
          subject: `Chat IA — ${firstQuestion(session.transcript ?? "")}`,
          html: buildHtml(session),
        }),
      });

      if (!response.ok) throw new Error(`Resend respondió ${response.status}`);

      // Only after a confirmed send: marking first would lose the conversation
      // for good if the email never went out.
      await client.patch(session._id).set({ notifiedAt: new Date().toISOString() }).commit();
      sent += 1;
    } catch (error) {
      console.error(`[notify-chats] ${session._id}:`, error);
      failed.push(session._id);
    }
  }

  return NextResponse.json({
    ok: true,
    pendientes: pending.length,
    enviados: sent,
    fallidos: failed.length,
  });
}
