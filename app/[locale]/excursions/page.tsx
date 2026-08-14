import { Suspense } from "react";
import { groq } from "next-sanity";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ExcursionesCatalog, {
  type ExcursionTour,
} from "@/components/ExcursionesCatalog";
import JsonLd from "@/components/JsonLd";
import { client } from "@/sanity/lib/client";
import { type AppLocale } from "@/i18n/routing";
import {
  buildBreadcrumbJsonLd,
  buildItemListJsonLd,
  buildPageMetadata,
  toItemListEntries,
} from "@/lib/seo";
import { getDefaultOgImage } from "@/lib/ogImage";
import { tourExcursionPath } from "@/lib/tourSlug";
import { SANITY_TAGS, sanityCache } from "@/lib/sanityCache";

export const revalidate = 3600;

const excursionsQuery = groq`*[_type == "tour" && (
  !defined($category) ||
  $category in categories[]->slug.current ||
  category->slug.current == $category ||
  (isCombo == true && mainTour->category->slug.current == $category)
)] {
  _id,
  "title": coalesce(select($locale == "fr-ca" => title.frCA, title[$locale]), title.en, title),
  "slug": slug.current,
  "mainImage": coalesce(listingImage, mainTour->listingImage),
  pricing[]{price},
  "price": coalesce(pricing[0].price, mainTour->pricing[0].price, 0),
  "priceTag": coalesce(priceTag, mainTour->priceTag),
  "duration": coalesce(select($locale == "fr-ca" => duration.frCA, duration[$locale]), duration.en, duration.es, duration.frCA),
  peekProId,
  "category": {
    "slug": category->slug.current,
    "title": coalesce(
      select($locale == "fr-ca" => category->title.frCA, category->title[$locale]),
      category->title.en,
      category->title.es,
      category->title.frCA
    )
  },
  "categorySlugs": array::compact([category->slug.current, ...categories[]->slug.current]),
  "currency": coalesce(currency, "USD")
} | order(price asc)`;

const categoriesQuery = groq`*[_type == "category"] | order(coalesce(title.en, title.es, title.frCA) asc){
  "slug": slug.current,
  "title": coalesce(
    select($locale == "fr-ca" => title.frCA, title[$locale]),
    title.en,
    title.es,
    title.frCA
  )
}`;

type PageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Seo" });

  return buildPageMetadata({
    locale,
    pathname: "/excursions",
    title: t("excursions.title"),
    description: t("excursions.description"),
    image: await getDefaultOgImage(),
    imageAlt: t("excursions.title"),
  });
}

export default async function ExcursionesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Seo" });

  const [tours, categories] = await Promise.all([
    client.fetch<ExcursionTour[]>(
      excursionsQuery,
      { locale, category: null },
      sanityCache([SANITY_TAGS.tour, SANITY_TAGS.category]),
    ),
    client.fetch<Array<{ slug: string; title: string }>>(
      categoriesQuery,
      { locale },
      sanityCache([SANITY_TAGS.category]),
    ),
  ]);

  const jsonLd = [
    buildBreadcrumbJsonLd(locale, [
      { name: t("breadcrumbHome"), path: "/" },
      { name: t("excursions.title") },
    ]),
    buildItemListJsonLd(
      locale,
      t("excursions.title"),
      toItemListEntries(tours, tourExcursionPath),
    ),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      {/* The catalog reads ?category= via useSearchParams, so it needs a
          Suspense boundary for the page to stay prerenderable. */}
      <Suspense fallback={null}>
        <ExcursionesCatalog
          tours={tours}
          categories={[{ slug: "all", title: "All" }, ...categories]}
        />
      </Suspense>
    </>
  );
}
