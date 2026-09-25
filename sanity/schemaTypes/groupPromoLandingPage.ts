import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Normal, fully localized, indexable promo pages for a specific group event
 * (e.g. "Tournee Burrows") offering a discount code on tours already live
 * on the site. Same header/footer/language switcher as any other page —
 * the only thing that sets it apart is that it is never linked from the
 * site's own navigation. Unlike partnerTransferLandingPage, these ARE meant
 * to be found on Google, so they carry real SEO metadata.
 *
 * Featured tours are references, not copied text: price, image and title
 * always come live from the tour itself, so this page never goes stale.
 */
export const groupPromoLandingPageType = defineType({
  name: "groupPromoLandingPage",
  title: "Group Promo Landing Page",
  type: "document",
  fields: [
    defineField({
      name: "eventName",
      title: "Event Name",
      description: 'e.g. "Tournee Burrows 2026". Used in Studio only.',
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL Slug",
      description: "Page will live at /<locale>/<slug>, e.g. /en/tournee-burrows.",
      type: "slug",
      options: { source: "eventName" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        defineField({ name: "metaTitle", title: "Meta Title", type: "localizedString" }),
        defineField({ name: "metaDescription", title: "Meta Description", type: "localizedText" }),
      ],
    }),
    defineField({
      name: "promoCode",
      title: "Promo Code",
      description: 'e.g. "BURROWS10". Not localized.',
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "eyebrow", title: "Hero Badge", type: "localizedString" }),
    defineField({ name: "subEyebrow", title: "Hero Sub-badge", type: "localizedString" }),
    defineField({ name: "heroText", title: "Hero Text", type: "localizedText" }),

    defineField({
      name: "featuredTours",
      title: "Featured Tours",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "tour" }],
        }),
      ],
    }),

    defineField({ name: "golfSectionTitle", title: "Golf Section Title", type: "localizedString" }),
    defineField({ name: "golfSectionText", title: "Golf Section Text", type: "localizedText" }),
    defineField({
      name: "golfTours",
      title: "Golf Tours",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "tour" }],
        }),
      ],
    }),

    defineField({ name: "howToClaimTitle", title: '"How to Claim" Title', type: "localizedString" }),
    defineField({
      name: "howToClaimSteps",
      title: '"How to Claim" Steps',
      type: "array",
      of: [defineArrayMember({ type: "localizedText" })],
    }),

    defineField({ name: "whyBookTitle", title: '"Why Book" Title', type: "localizedString" }),
    defineField({ name: "whyBookIntro", title: '"Why Book" Intro', type: "localizedText" }),
    defineField({
      name: "whyBookPoints",
      title: '"Why Book" Points',
      type: "array",
      of: [defineArrayMember({ type: "localizedText" })],
    }),

    defineField({
      name: "faqs",
      title: "FAQ",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "faqItem",
          fields: [
            defineField({ name: "question", title: "Question", type: "localizedString", validation: (r) => r.required() }),
            defineField({ name: "answer", title: "Answer", type: "localizedText", validation: (r) => r.required() }),
          ],
          preview: { select: { title: "question.en" } },
        }),
      ],
    }),

    defineField({ name: "ctaTitle", title: "Closing CTA Title", type: "localizedString" }),
    defineField({ name: "ctaText", title: "Closing CTA Text", type: "localizedText" }),
    defineField({ name: "ctaButtonLabel", title: "Closing CTA Button Label", type: "localizedString" }),
  ],
  preview: {
    select: { title: "eventName", subtitle: "slug.current" },
  },
});
