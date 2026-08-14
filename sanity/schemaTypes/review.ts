import { defineField, defineType } from "sanity";

export const reviewType = defineType({
  name: "review",
  title: "Review",
  type: "document",
  fields: [
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
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
      description: "Formato DD/MM/AAAA, tal y como aparece en Google.",
      placeholder: "27/08/2025",
      validation: (rule) =>
        rule
          .required()
          .regex(/^\d{2}\/\d{2}\/\d{4}$/, {
            name: "DD/MM/AAAA",
            invert: false,
          })
          .error("Usa el formato DD/MM/AAAA, con el año de 4 cifras (ej. 27/08/2025)"),
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "text",
      rows: 5,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "googleReviewUrl",
      title: "Google Review URL",
      type: "url",
      validation: (rule) => rule.required().uri({ allowRelative: false }),
    }),
  ],
});
