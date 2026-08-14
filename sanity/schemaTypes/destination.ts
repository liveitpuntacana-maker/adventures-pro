import { defineField, defineType } from "sanity";

export const destinationType = defineType({
  name: "destination",
  title: "Destination",
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
          const d = doc as { title?: { en?: string; es?: string; frCA?: string } };
          return d.title?.en || d.title?.es || "";
        },
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "mainImage",
      title: "Main image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "seoIntro",
      title: "SEO intro text",
      type: "localizedText",
      description:
        "Texto introductorio de la pagina de destino (150-300 palabras). Si se deja vacio se usa el texto por defecto de lib/content/listingIntro.ts. Los primeros 160 caracteres se usan como meta descripcion.",
    }),
  ],
  preview: {
    select: {
      titleEn: "title.en",
      titleEs: "title.es",
      titleFr: "title.frCA",
      slug: "slug.current",
    },
    prepare({ titleEn, titleEs, titleFr, slug }) {
      const title = titleEn || titleEs || titleFr || "Untitled destination";
      return {
        title,
        subtitle: slug ? `/${slug}` : "No slug",
      };
    },
  },
});
