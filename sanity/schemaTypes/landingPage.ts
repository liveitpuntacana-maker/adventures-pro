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
  ],
});