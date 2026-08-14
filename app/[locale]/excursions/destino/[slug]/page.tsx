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
import { destinationExcursionPath } from "@/lib/destinationPath";
import { tourExcursionPath } from "@/lib/tourSlug";
import { getDestinationIntro } from "@/lib/content/listingIntro";
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

type DestinationPageProps = {
  params: Promise<{ locale: AppLocale; slug: string }>;
};

type DestinationData = {
  _id: string;
  title?: string;
  slug?: string;
  mainImage?: unknown;
  seoIntro?: string | null;
  tourCount?: number;
};

const destinationBySlugQuery = groq`*[_type == "destination" && slug.current == $slug][0] {
  _id,
  "title": coalesce(select($locale == "fr-ca" => title.frCA, title[$locale]), title.en, title.es, title.frCA),
  "slug": slug.current,
  mainImage,
  "seoIntro": select($locale == "fr-ca" => seoIntro.frCA, seoIntro[$locale]),
  "tourCount": count(*[_type == "tour" && destination->slug.current == $slug])
}`;

const destinationToursQuery = groq`*[_type == "tour" && destination->slug.current == $slug] {
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
  const destinations = await client.fetch<Array<{ slug: string }>>(
    groq`*[_type == "destination" && defined(slug.current)]{ "slug": slug.current }`,
  );

  // Default locale only at build time; other locales come from ISR on demand.
  return (destinations ?? []).map((destination) => ({
    locale: routing.defaultLocale,
    slug: destination.slug,
  }));
}

async function fetchDestination(locale: AppLocale, slug: string) {
  return client
    .fetch<DestinationData | null>(
      destinationBySlugQuery,
      { locale, slug },
      sanityCache([SANITY_TAGS.destination]),
    )
    .catch(() => null);
}

export async function generateMetadata({
  params,
}: DestinationPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "Seo" });
  const destination = await fetchDestination(locale, slug);

  if (!destination) return {};

  const name = destination.title?.trim() || slug;
  const intro = getDestinationIntro(slug, locale, name);
  const description = destination.seoIntro?.trim() || intro.intro;

  return buildPageMetadata({
    locale,
    pathname: destinationExcursionPath(slug),
    title: t("destination.title", { name }),
    description: description.slice(0, 160),
    image:
      sanityOgImage(destination.mainImage) ?? (await getDefaultOgImage()),
    imageAlt: t("destination.title", { name }),
    // See the note in the category page: empty listings stay out of the index.
    noIndex: !shouldIndexListing(destination.tourCount),
  });
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Seo" });

  const [destination, tours] = await Promise.all([
    fetchDestination(locale, slug),
    client
      .fetch<CategoryTour[]>(
        destinationToursQuery,
        { locale, slug },
        sanityCache([SANITY_TAGS.tour, SANITY_TAGS.destination]),
      )
      .catch(() => []),
  ]);

  if (!destination) {
    notFound();
  }

  const title = destination.title?.trim() || slug;
  const intro = getDestinationIntro(slug, locale, title);
  const content = destination.seoIntro?.trim()
    ? { ...intro, intro: destination.seoIntro.trim() }
    : intro;

  const jsonLd = [
    buildBreadcrumbJsonLd(locale, [
      { name: t("breadcrumbHome"), path: "/" },
      { name: t("breadcrumbExcursions"), path: "/excursions" },
      { name: title },
    ]),
    buildItemListJsonLd(
      locale,
      t("destination.title", { name: title }),
      toItemListEntries(tours, tourExcursionPath),
    ),
    ...(content.faqs.length > 0 ? [buildFaqJsonLd(content.faqs)] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <JsonLd data={jsonLd} />
      <CategoryPageHero title={title} mainImage={destination.mainImage} />
      <CategorySearch
        tours={tours}
        categorySlug={slug}
        messagesNamespace="DestinationPage"
      />
      <ListingSeoContent content={content} faqTitle={t("faqSectionTitle")} />
    </div>
  );
}
