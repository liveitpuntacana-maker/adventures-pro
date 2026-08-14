import { defineField, defineType } from "sanity";

export const landingPageType = defineType({
  name: "landingPage",
  title: "Landing Page (Slider)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título Principal",
      type: "localizedString",
    }),
    defineField({
      name: "subtitle",
      title: "Subtítulo",
      type: "localizedString",
    }),
    defineField({
      name: "sliderImages",
      title: "Imágenes del Slider",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
        },
      ],
    }),
    defineField({
      name: "googleReviewsCount",
      title: "Nº de reseñas en Google",
      type: "number",
      description:
        "Se muestra como «Basado en más de N reseñas en Google» en la home. Actualizalo cuando crezca el número real en tu ficha de Google.",
      initialValue: 40,
      validation: (rule) => rule.min(1).integer(),
    }),
  ],
});