import { defineArrayMember, defineField, defineType } from "sanity";

type TourSlugSourceDoc = { title?: { en?: string; es?: string; frCA?: string } };
type TourDoc = { isCombo?: boolean };

const hideWhenCombo = (ctx: { document?: unknown }) =>
  (ctx.document as TourDoc | undefined)?.isCombo === true;

export const tourType = defineType({
  name: "tour",
  title: "Tour",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localizedString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: (doc) => {
          const d = doc as TourSlugSourceDoc;
          const raw = d.title?.en || d.title?.es || "";
          return raw
            .toLowerCase()
            .replace(/https?:\/\//g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        },
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .replace(/https?:\/\//g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, ""),
      },
      validation: (rule) =>
        rule.required().custom((value) => {
          const current = (value as { current?: string } | undefined)?.current;
          if (!current) return true;
          if (/[/.]/.test(current) && current.includes(".")) {
            return "Use a short slug without domains or dots (e.g. saona-island-monkeyland-combo)";
          }
          if (current.includes("/")) {
            return "Slug cannot contain slashes";
          }
          return true;
        }),
    }),
    defineField({
      name: "isCombo",
      title: "¿Es un Combo?",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "mainTour",
      title: "Main Tour",
      type: "reference",
      to: [{ type: "tour" }],
      hidden: ({ document }) => !document?.isCombo,
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as TourDoc;
          if (doc?.isCombo && !value) return "Main tour is required for combos";
          return true;
        }),
    }),
    defineField({
      name: "comboDays",
      title: "Combo Days",
      type: "array",
      hidden: ({ document }) => !document?.isCombo,
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "dayLabel",
              title: "Day Label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "tour",
              title: "Tour",
              type: "reference",
              to: [{ type: "tour" }],
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              dayLabel: "dayLabel",
              titleEn: "tour.title.en",
              titleEs: "tour.title.es",
            },
            prepare({ dayLabel, titleEn, titleEs }) {
              return {
                title: dayLabel,
                subtitle: titleEn || titleEs,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "comboItems",
      title: "Combo Days (legacy)",
      type: "array",
      readOnly: true,
      deprecated: { reason: "Use Combo Days. Remove this field after migrating." },
      hidden: ({ document }) => {
        const d = document as {
          isCombo?: boolean;
          comboItems?: unknown[];
          comboDays?: unknown[];
        };
        if (!d?.isCombo || !d?.comboItems?.length) return true;
        return Boolean(d?.comboDays?.length);
      },
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "dayLabel",
              title: "Day Label",
              type: "string",
            }),
            defineField({
              name: "tour",
              title: "Tour",
              type: "reference",
              to: [{ type: "tour" }],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "comboComments",
      title: "Combo Comments",
      type: "localizedText",
      hidden: ({ document }) => !document?.isCombo,
    }),
    defineField({
      name: "pricing",
      title: "Pricing",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "price",
              title: "Price",
              type: "number",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: "label",
              subtitle: "price",
            },
          },
        },
      ],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "priceTag",
      title: "Etiqueta de Precio",
      description: "Opcional. Clarifica el precio listado (ej: 4 pax, per boat).",
      type: "string",
    }),
    defineField({
      name: "peekProId",
      title: "PeekPro ID",
      type: "string",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "localizedText",
      hidden: hideWhenCombo,
    }),
    defineField({
      name: "isFeatured",
      title: "Featured on Home",
      type: "boolean",
      initialValue: false,
      hidden: hideWhenCombo,
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      hidden: hideWhenCombo,
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as TourDoc;
          if (doc?.isCombo) return true;
          if (!value) return "Category is required";
          return true;
        }),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      hidden: hideWhenCombo,
    }),
    defineField({
      name: "destination",
      title: "Destination",
      type: "reference",
      to: [{ type: "destination" }],
      hidden: hideWhenCombo,
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "USD",
      hidden: hideWhenCombo,
    }),
    defineField({
      name: "listingImage",
      title: "Listing Image",
      type: "image",
      options: { hotspot: true },
      hidden: hideWhenCombo,
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as TourDoc;
          if (doc?.isCombo) return true;
          if (!value) return "Listing image is required";
          return true;
        }),
    }),
    defineField({
      name: "highlightBadge",
      title: "Highlight Badge",
      type: "string",
      hidden: hideWhenCombo,
    }),
    defineField({
      name: "duration",
      title: "Duration",
      type: "localizedString",
      hidden: hideWhenCombo,
    }),
    defineField({
      name: "availability",
      title: "Availability",
      type: "localizedString",
      hidden: hideWhenCombo,
    }),
    defineField({
      name: "ages",
      title: "Ages",
      type: "localizedString",
      hidden: hideWhenCombo,
    }),
    defineField({
      name: "starts",
      title: "Starts",
      type: "localizedString",
      hidden: hideWhenCombo,
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      hidden: hideWhenCombo,
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as TourDoc;
          if (doc?.isCombo) return true;
          if (!value || value.length < 1) return "At least one gallery image is required";
          return true;
        }),
    }),
    defineField({
      name: "infoTour",
      title: "Info Tour",
      type: "localizedText",
      hidden: hideWhenCombo,
    }),
    defineField({
      name: "whatHappens",
      title: "What Happens",
      type: "localizedText",
      hidden: hideWhenCombo,
    }),
    defineField({
      name: "includes",
      title: "Includes",
      type: "localizedText",
      hidden: hideWhenCombo,
    }),
    defineField({
      name: "whatToBring",
      title: "What to Bring",
      type: "localizedText",
      hidden: hideWhenCombo,
    }),
    defineField({
      name: "excludes",
      title: "Excludes",
      type: "localizedText",
      hidden: hideWhenCombo,
    }),
    defineField({
      name: "goodToKnow",
      title: "Good to Know",
      type: "localizedText",
      hidden: hideWhenCombo,
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "localizedText",
      hidden: hideWhenCombo,
    }),
    defineField({
      name: "reviews",
      title: "Customer Reviews",
      type: "array",
      hidden: hideWhenCombo,
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "author",
              title: "Author",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "rating",
              title: "Rating",
              type: "number",
              validation: (rule) => rule.required().min(1).max(5),
            }),
            defineField({
              name: "date",
              title: "Date",
              type: "string",
            }),
            defineField({
              name: "text",
              title: "Review",
              type: "text",
              rows: 4,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: "author",
              subtitle: "rating",
            },
            prepare({ title, subtitle }) {
              return {
                title: title || "Review",
                subtitle: subtitle ? `${subtitle}/5` : undefined,
              };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      titleEn: "title.en",
      titleEs: "title.es",
      titleFr: "title.frCA",
      slug: "slug.current",
      currency: "currency",
      isCombo: "isCombo",
    },
    prepare({ titleEn, titleEs, titleFr, slug, currency, isCombo }) {
      const title = titleEn || titleEs || titleFr || "Untitled tour";
      const subtitleParts = [
        isCombo ? "Combo" : null,
        slug ? `/${slug}` : null,
        currency || null,
      ].filter(Boolean);
      return {
        title,
        subtitle: subtitleParts.join(" • "),
      };
    },
  },
});
