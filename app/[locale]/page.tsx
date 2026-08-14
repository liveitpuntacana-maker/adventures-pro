import HeroSearch from "@/components/HeroSearch";
import HomeHeroText from "@/components/HomeHeroText";
import HomeHeroSlider from "@/components/HomeHeroSlider";
import PromoBanner from "@/components/PromoBanner";
import FeaturedAdventures, { type FeaturedTour } from "@/components/FeaturedAdventures";
import InteractiveMap from "@/components/InteractiveMap";
import { mapDestinationsQuery, type MapDestination } from "@/lib/sanityDestinations";
import ReviewsSection from "@/components/ReviewsSection";
import OurBrands from "@/components/OurBrands";
import BoutiqueBanner from "@/components/BoutiqueBanner";
import AllianceLogos from "@/components/AllianceLogos";
import LiveItBanner from "@/components/LiveItBanner";
import LiveItBannerSticky from "@/components/LiveItBannerSticky";
import BlogSection from "@/components/BlogSection";
import CategoryBanners, { type CategoryBanner } from "@/components/CategoryBanners";
import LeadForm from "@/components/LeadForm";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { tourRatingProjection } from "@/lib/tourRating";
import {
  buildItemListJsonLd,
  buildPageMetadata,
  toItemListEntries,
} from "@/lib/seo";
import { getDefaultOgImage } from "@/lib/ogImage";
import { tourExcursionPath } from "@/lib/tourSlug";
import { REVALIDATE, SANITY_TAGS, sanityCache } from "@/lib/sanityCache";
import type { AppLocale } from "@/i18n/routing";

export const revalidate = 3600;

type HomePageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Seo" });

  return buildPageMetadata({
    locale,
    pathname: "/",
    title: t("home.title"),
    description: t("home.description"),
    image: await getDefaultOgImage(),
    imageAlt: t("home.title"),
  });
}

type LandingPageData = {
  sliderImages?: Array<{ url?: string; alt?: string | null }>;
};

const featuredToursQuery = groq`*[_type == "tour" && isFeatured == true] {
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

const categoriesQuery = groq`*[_type == "category"] {
  "slug": slug.current,
  mainImage,
  title
}`;

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Seo" });

  const landingPage = await client
    .fetch<LandingPageData | null>(
      groq`*[_type == "landingPage"][0]{
        "sliderImages": sliderImages[]{
          "url": asset->url,
          "alt": coalesce(alt, asset->altText, asset->title)
        }
      }`,
      { locale },
      sanityCache([SANITY_TAGS.landingPage], REVALIDATE.catalog),
    )
    .catch(() => null);

  const [featuredTours, categories, mapDestinations] = await Promise.all([
    client
      .fetch<FeaturedTour[]>(
        featuredToursQuery,
        { locale },
        sanityCache([SANITY_TAGS.tour]),
      )
      .catch(() => []),
    client
      .fetch<CategoryBanner[]>(categoriesQuery, {}, sanityCache([SANITY_TAGS.category]))
      .catch(() => []),
    client
      .fetch<MapDestination[]>(
        mapDestinationsQuery,
        { locale },
        sanityCache([SANITY_TAGS.destination]),
      )
      .catch(() => []),
  ]);

  const featuredItemList = buildItemListJsonLd(
    locale,
    t("home.title"),
    toItemListEntries(featuredTours, tourExcursionPath),
  );

  // Alt text comes from Sanity when the editor set one; otherwise it describes
  // what the slide actually shows instead of "Hero slide 1".
  const heroSlides =
    landingPage?.sliderImages
      ?.filter((image) => image?.url?.trim())
      .map((image, index) => ({
        src: image.url!.trim(),
        alt:
          image.alt?.trim() ||
          (index === 0
            ? `${t("home.title")} — Adventures Finder`
            : `${t("home.title")} — ${index + 1}`),
      })) ?? [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <JsonLd data={featuredItemList} />
      <main>
        <section className="relative w-full">
          <div className="relative min-h-[600px] w-full md:min-h-[70vh]">
            <HomeHeroSlider slides={heroSlides} />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-8 px-4 text-white md:gap-10 md:px-10 lg:px-12">
              <div className="w-full max-w-4xl text-center">
                <HomeHeroText />
                <div className="mx-auto mt-8 w-full max-w-4xl md:mt-10">
                  <HeroSearch />
                </div>
              </div>
            </div>
          </div>
        </section>

        <PromoBanner />

        <section className="mx-auto max-w-7xl px-6 pb-20 pt-14 md:px-10 md:pb-24 md:pt-16 lg:px-12">
          <CategoryBanners categories={categories} locale={locale} />
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24 pt-16 md:px-10 md:pb-32 md:pt-20 lg:px-12">
          <FeaturedAdventures tours={featuredTours} />
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24 pt-8 md:px-10 md:pb-32 md:pt-12 lg:px-12">
          <InteractiveMap destinations={mapDestinations} />
        </section>

        <section className="mx-auto w-full max-w-4xl px-6 py-12 md:px-10 lg:px-12">
          <LeadForm />
        </section>

        <ReviewsSection />

        <OurBrands locale={locale} />

        <LiveItBanner />
        <LiveItBannerSticky />

        <BlogSection locale={locale} />

        <BoutiqueBanner />

        <AllianceLogos />
      </main>
    </div>
  );
}
