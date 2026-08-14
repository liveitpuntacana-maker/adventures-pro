import { groq } from "next-sanity";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import CategoryPageHero from "@/components/CategoryPageHero";
import CategorySearch, { type CategoryTour } from "@/components/CategorySearch";
import ListingSeoContent from "@/components/ListingSeoContent";
import JsonLd from "@/components/JsonLd";
import { client } from "@/sanity/lib/client";
import { routing, type AppLocale } from "@/i18n/routing";
import { tourRatingProjection } from "@/lib/tourRating";
import { categoryExcursionPath } from "@/lib/categoryPath";
import { tourExcursionPath } from "@/lib/tourSlug";
import { getCategoryIntro } from "@/lib/content/listingIntro";
import { sanityOgImage, getDefaultOgImage } from "@/lib/ogImage";
import { SANITY_TAGS, sanityCache } from "@/lib/sanityCache";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildItemListJsonLd,
  buildPageMetadata,
  shouldIndexListing,
  toItemListEntries,
} from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = true;

type CategoryPageProps = {
  params: Promise<{ locale: AppLocale; slug: string }>;
};

type CategoryData = {
  _id: string;
  title?: string;
  slug?: string;
  mainImage?: unknown;
  bannerImage?: unknown;
  seoIntro?: string | null;
  tourCount?: number;
};

const categoryBySlugQuery = groq`*[_type == "category" && slug.current == $slug][0] {
  _id,
  "title": coalesce(select($locale == "fr-ca" => title.frCA, title[$locale]), title.en, title.es, title.frCA),
  "slug": slug.current,
  mainImage,
  bannerImage,
  "seoIntro": select($locale == "fr-ca" => seoIntro.frCA, seoIntro[$locale]),
  "tourCount": count(*[_type == "tour" && (
    $slug in categories[]->slug.current ||
    category->slug.current == $slug
  )])
}`;

const categoryToursQuery = groq`*[_type == "tour" && (
  $slug in categories[]->slug.current ||
  category->slug.current == $slug
)] {
  _id,
  "title": coalesce(select($locale == "fr-ca" => title.frCA, title[$locale]), title.en, title),
  "slug": slug.current,
  "listingImage": coalesce(listingImage, mainTour->listingImage),
  highlightBadge,
  peekProId,
  "priceTag": coalesce(priceTag, mainTour->priceTag),
  "currency": coalesce(currency, mainTour->currency, "USD"),
  "duration": coalesce(
    select(isCombo == true => coalesce(
      select($locale == "fr-ca" => mainTour->duration.frCA, mainTour->duration[$locale]),
      mainTour->duration.en,
      mainTour->duration.es,
      mainTour->duration.frCA
    ), null),
    coalesce(select($locale == "fr-ca" => duration.frCA, duration[$locale]), duration.en, duration.es, duration.frCA)
  ),
  pricing[]{price},
  "price": coalesce(pricing[0].price, mainTour->pricing[0].price, 0),
  ${tourRatingProjection}
} | order(price asc)`;

export async function generateStaticParams() {
  const categories = await client.fetch<Array<{ slug: string }>>(
    groq`*[_type == "category" && defined(slug.current)]{ "slug": slug.current }`,
  );

  // Default locale only at build time; other locales come from ISR on demand.
  return (categories ?? []).map((category) => ({
    locale: routing.defaultLocale,
    slug: category.slug,
  }));
}

async function fetchCategory(locale: AppLocale, slug: string) {
  return client
    .fetch<CategoryData | null>(
      categoryBySlugQuery,
      { locale, slug },
      sanityCache([SANITY_TAGS.category]),
    )
    .catch(() => null);
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "Seo" });
  const category = await fetchCategory(locale, slug);

  if (!category) return {};

  const name = category.title?.trim() || slug;
  const intro = getCategoryIntro(slug, locale, name);
  const description = category.seoIntro?.trim() || intro.intro;

  return buildPageMetadata({
    locale,
    pathname: categoryExcursionPath(slug),
    title: t("category.title", { name }),
    description: description.slice(0, 160),
    image:
      sanityOgImage(category.bannerImage) ??
      sanityOgImage(category.mainImage) ??
      (await getDefaultOgImage()),
    imageAlt: t("category.title", { name }),
    // A category with almost nothing to list is not worth indexing; it comes
    // back on its own once enough tours point at it.
    noIndex: !shouldIndexListing(category.tourCount),
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Seo" });

  const [category, tours] = await Promise.all([
    fetchCategory(locale, slug),
    client
      .fetch<CategoryTour[]>(
        categoryToursQuery,
        { locale, slug },
        sanityCache([SANITY_TAGS.tour, SANITY_TAGS.category]),
      )
      .catch(() => []),
  ]);

  if (!category) {
    notFound();
  }

  const title = category.title?.trim() || slug;
  const intro = getCategoryIntro(slug, locale, title);
  // An editor-written intro in Sanity always wins over the built-in default.
  const content = category.seoIntro?.trim()
    ? { ...intro, intro: category.seoIntro.trim() }
    : intro;

  const jsonLd = [
    buildBreadcrumbJsonLd(locale, [
      { name: t("breadcrumbHome"), path: "/" },
      { name: t("breadcrumbExcursions"), path: "/excursions" },
      { name: title },
    ]),
    buildItemListJsonLd(
      locale,
      t("category.title", { name: title }),
      toItemListEntries(tours, tourExcursionPath),
    ),
    ...(content.faqs.length > 0 ? [buildFaqJsonLd(content.faqs)] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <JsonLd data={jsonLd} />
      <CategoryPageHero
        title={title}
        bannerImage={category.bannerImage}
        mainImage={category.mainImage}
      />
      <CategorySearch tours={tours} categorySlug={slug} />
      <ListingSeoContent content={content} faqTitle={t("faqSectionTitle")} />
    </div>
  );
}
