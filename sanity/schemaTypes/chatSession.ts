import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * A conversation held with the site assistant.
 *
 * Stored so the team can see what visitors actually ask for — including tours
 * we do not offer yet — and whether the assistant is doing its job. Written by
 * /api/site-chat; never edited by hand.
 */
export const chatSessionType = defineType({
  name: "chatSession",
  title: "Conversación del chat",
  type: "document",
  readOnly: true,
  fields: [
    defineField({
      name: "sessionId",
      title: "ID de sesión",
      type: "string",
    }),
    defineField({
      name: "locale",
      title: "Idioma",
      type: "string",
    }),
    defineField({
      name: "startedAt",
      title: "Inicio",
      type: "datetime",
    }),
    defineField({
      name: "lastMessageAt",
      title: "Último mensaje",
      type: "datetime",
    }),
    defineField({
      name: "currentPath",
      title: "Página donde se abrió",
      type: "string",
    }),
    defineField({
      name: "pageTourTitle",
      title: "Tour de esa página",
      type: "string",
    }),
    defineField({
      name: "messageCount",
      title: "Nº de mensajes",
      type: "number",
    }),
    defineField({
      name: "recommendedTours",
      title: "Tours recomendados por el asistente",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description:
        "Slugs extraídos de los enlaces que el asistente incluyó en sus respuestas.",
    }),
    defineField({
      name: "messages",
      title: "Conversación",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "chatTurn",
          fields: [
            defineField({ name: "role", title: "Quién", type: "string" }),
            defineField({ name: "content", title: "Mensaje", type: "text", rows: 4 }),
          ],
          preview: {
            select: { role: "role", content: "content" },
            prepare({ role, content }) {
              return {
                title: role === "user" ? "👤 Visitante" : "🤖 Asistente",
                subtitle: content,
              };
            },
          },
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: "Más recientes primero",
      name: "recent",
      by: [{ field: "lastMessageAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      messages: "messages",
      locale: "locale",
      lastMessageAt: "lastMessageAt",
      count: "messageCount",
    },
    prepare({ messages, locale, lastMessageAt, count }) {
      const firstQuestion =
        (messages as Array<{ role?: string; content?: string }> | undefined)?.find(
          (turn) => turn.role === "user",
        )?.content ?? "Sin mensajes";
      const date = lastMessageAt
        ? new Date(lastMessageAt).toLocaleString("es-ES", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
      return {
        title: firstQuestion,
        subtitle: `${date} · ${String(locale ?? "").toUpperCase()} · ${count ?? 0} mensajes`,
      };
    },
  },
});
