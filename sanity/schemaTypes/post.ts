import { defineField, defineType } from "sanity";

export const postType = defineType({
  name: "post",
  title: "Post",
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
        source: (doc) => (doc as { title?: { en?: string; es?: string; frCA?: string } }).title?.en || "",
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
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "localizedText",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "localizedText",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "localizedString",
      description:
        "Titulo que se muestra en Google, si debe diferir del titular del articulo. Maximo 60 caracteres: por encima de ahi Google lo corta. Vacio = se usa el titulo del articulo.",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "localizedText",
      description:
        "Descripcion que se muestra en Google. Maximo 160 caracteres. Vacio = se usa el extracto.",
    }),
    defineField({
      name: "sourceGuid",
      title: "Source GUID (RSS)",
      type: "string",
      description: "Identificador estable del artículo externo (ej. GUID del feed RSS de Soro). Usado para evitar duplicados en la sincronización automática.",
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      titleEn: "title.en",
      titleEs: "title.es",
      titleFr: "title.frCA",
      slug: "slug.current",
      media: "mainImage",
    },
    prepare({ titleEn, titleEs, titleFr, slug, media }) {
      const title = titleEn || titleEs || titleFr || "Untitled";
      return {
        title,
        subtitle: slug ? `/${slug}` : "No slug",
        media,
      };
    },
  },
});
