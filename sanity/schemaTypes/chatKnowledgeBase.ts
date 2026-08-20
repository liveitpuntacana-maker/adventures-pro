import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * What the site assistant knows beyond the catalogue.
 *
 * Tours reach the assistant straight from their own documents, but the FAQs and
 * the policies used to live in the code. That meant the answers a visitor got
 * could drift from the ones published on /faqs and /cancellation-policy, and
 * only a developer could correct them.
 *
 * A single document: there is one set of official answers, and a list of
 * documents would invite a second.
 */
export const chatKnowledgeBaseType = defineType({
  name: "chatKnowledgeBase",
  title: "Conocimiento del chat",
  type: "document",
  fields: [
    defineField({
      name: "faqs",
      title: "Preguntas frecuentes",
      description:
        "Lo que el asistente responde sobre reservas, pagos, transporte, comidas, edades, clima e idiomas. Debe decir lo mismo que la página de FAQs.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "chatFaq",
          fields: [
            defineField({
              name: "question",
              title: "Pregunta",
              type: "localizedString",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "answer",
              title: "Respuesta",
              type: "localizedText",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { es: "question.es", en: "question.en", answer: "answer.es" },
            prepare({ es, en, answer }) {
              return { title: es || en || "Sin pregunta", subtitle: answer };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "cancellationPolicy",
      title: "Política de cancelación",
      description:
        "Plazos y reembolsos, tal como aparecen en /cancellation-policy. En texto corrido; el asistente lo cita.",
      type: "localizedText",
    }),
    defineField({
      name: "pickupPolicy",
      title: "Política de recogida",
      description:
        "Tiempo de espera del conductor, qué cuenta como no-show y qué datos debe dar el cliente.",
      type: "localizedText",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Conocimiento del chat", subtitle: "FAQs y políticas oficiales" };
    },
  },
});
