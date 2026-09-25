import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Normal, fully localized pages for a partner's transfer booking (e.g.
 * JusCollege) — same header, footer and language switcher as any other page.
 * The only difference from a regular page is that it is marked noindex and
 * is never linked from the site's own navigation, since it only reaches
 * guests through a direct emailed link.
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
      description: "Page will live at /<locale>/<slug>, e.g. /en/juscollege.",
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
      type: "localizedString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroTitle",
      title: "Hero Title",
      type: "localizedString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "introText",
      title: "Intro Paragraph",
      type: "localizedText",
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
            defineField({ name: "title", title: "Title", type: "localizedString", validation: (r) => r.required() }),
            defineField({ name: "price", title: "Price Line", type: "localizedString", validation: (r) => r.required() }),
            defineField({ name: "description", title: "Description", type: "localizedText" }),
            defineField({ name: "image", title: "Photo", type: "image", options: { hotspot: true } }),
            defineField({ name: "peekUrl", title: "Peek Booking URL", type: "url", validation: (r) => r.required() }),
            defineField({ name: "buttonLabel", title: "Button Label", type: "localizedString" }),
          ],
          preview: { select: { title: "title.en", subtitle: "price.en", media: "image" } },
        }),
      ],
    }),
    defineField({
      name: "noticeTitle",
      title: "Notice Block Title",
      type: "localizedString",
    }),
    defineField({
      name: "noticeItems",
      title: "Notice Items",
      description: "Each entry is one paragraph/bullet in the notice block.",
      type: "array",
      of: [defineArrayMember({ type: "localizedText" })],
    }),
    defineField({
      name: "closingText",
      title: "Closing Line",
      type: "localizedString",
    }),
    defineField({
      name: "supportPhone",
      title: "Support Phone",
      description: "Not localized — the same contact info for every language.",
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
