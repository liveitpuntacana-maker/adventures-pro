import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * One-off transfer booking pages sent by email to a specific partner's
 * guests (e.g. JusCollege) — never linked from the site nor indexed.
 * English only: the audience for each one is a single group, not the site's
 * three locales.
 */
export const partnerTransferLandingPageType = defineType({
  name: "partnerTransferLandingPage",
  title: "Partner Transfer Landing Page",
  type: "document",
  fields: [
    defineField({
      name: "partnerName",
      title: "Partner Name",
      description: 'e.g. "JusCollege". Used in Studio only.',
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL Slug",
      description: 'Page will live at adventuresfinder.com/<slug>, no locale prefix.',
      type: "slug",
      options: { source: "partnerName" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Partner Logo",
      type: "image",
    }),
    defineField({
      name: "pageTitle",
      title: "Browser Tab Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroTitle",
      title: "Hero Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "introText",
      title: "Intro Paragraph",
      type: "text",
    }),
    defineField({
      name: "options",
      title: "Transfer Options",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "transferOption",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "price", title: "Price Line", type: "string", validation: (r) => r.required() }),
            defineField({ name: "description", title: "Description", type: "text" }),
            defineField({ name: "image", title: "Photo", type: "image", options: { hotspot: true } }),
            defineField({ name: "peekUrl", title: "Peek Booking URL", type: "url", validation: (r) => r.required() }),
            defineField({ name: "buttonLabel", title: "Button Label", type: "string", initialValue: "Book Now" }),
          ],
          preview: { select: { title: "title", subtitle: "price", media: "image" } },
        }),
      ],
    }),
    defineField({
      name: "noticeTitle",
      title: "Notice Block Title",
      type: "string",
    }),
    defineField({
      name: "noticeItems",
      title: "Notice Items",
      description: "Each entry is one paragraph/bullet in the notice block.",
      type: "array",
      of: [defineArrayMember({ type: "text" })],
    }),
    defineField({
      name: "closingText",
      title: "Closing Line",
      type: "string",
    }),
    defineField({
      name: "supportPhone",
      title: "Support Phone",
      type: "string",
    }),
    defineField({
      name: "supportEmail",
      title: "Support Email",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "partnerName", subtitle: "slug.current", media: "logo" },
  },
});
