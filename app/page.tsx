import { NextIntlClientProvider } from "next-intl";
import HeroSearch from "@/components/HeroSearch";
import HomeHeroSlider from "@/components/HomeHeroSlider";
import HomeHeroText from "@/components/HomeHeroText";
import PromoBanner from "@/components/PromoBanner";
import CategoryShowcase from "@/components/CategoryShowcase";
import FeaturedAdventures from "@/components/FeaturedAdventures";
import ReviewsSection from "@/components/ReviewsSection";
import BoutiqueBanner from "@/components/BoutiqueBanner";
import AllianceLogos from "@/components/AllianceLogos";
import LiveItBanner from "@/components/LiveItBanner";
import LiveItBannerSticky from "@/components/LiveItBannerSticky";
import BlogSection from "@/components/BlogSection";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { routing } from "@/i18n/routing";
import enMessages from "../messages/en.json";
import { tourRatingProjection } from "@/lib/tourRating";

const featuredToursQuery = groq`*[_type == "tour" && isFeatured == true] {
  _id,
  "title": coalesce(title.en, title.es, title.frCA),
  "slug": slug.current,
  listingImage,
  highlightBadge,
  peekProId,
  "priceTag": coalesce(priceTag, mainTour->priceTag),
  "currency": coalesce(currency, "USD"),
  "duration": coalesce(duration.en, duration.es, duration.frCA),
  pricing[]{price},
  "price": coalesce(pricing[0].price, mainTour->pricing[0].price, 0),
  ${tourRatingProjection}
} | order(price asc)`;

export default async function Home() {
  const featuredTours = await client.fetch(featuredToursQuery).catch(() => []);

  return (
    <NextIntlClientProvider locale={routing.defaultLocale} messages={enMessages}>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <main>
          <section className="relative w-full">
            <div className="relative min-h-[600px] w-full md:min-h-[70vh]">
              <HomeHeroSlider />
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
            <CategoryShowcase />
          </section>

          <section className="mx-auto max-w-7xl px-6 pb-24 pt-16 md:px-10 md:pb-32 md:pt-20 lg:px-12">
            <FeaturedAdventures tours={featuredTours} />
          </section>

          <ReviewsSection />

          <BlogSection locale={routing.defaultLocale} />

          <BoutiqueBanner />

          <AllianceLogos />

          <LiveItBanner />
          <LiveItBannerSticky />
        </main>
      </div>
    </NextIntlClientProvider>
  );
}
