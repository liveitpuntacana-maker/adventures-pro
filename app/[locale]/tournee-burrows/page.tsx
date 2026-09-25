import { groq } from "next-sanity";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import TourCard from "@/components/TourCard";
import ScrollToAnchorButton from "@/components/ScrollToAnchorButton";
import { client } from "@/sanity/lib/client";
import { SANITY_TAGS, sanityCache } from "@/lib/sanityCache";
import { peekBookingUrl } from "@/lib/tourPrice";
import { buildPageMetadata, resolveTitle } from "@/lib/seo";
import { getDefaultOgImage } from "@/lib/ogImage";
import type { AppLocale } from "@/i18n/routing";

export const revalidate = 3600;

type PromoLandingPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

const localized = (field: string) =>
  `coalesce(select($locale == "fr-ca" => ${field}.frCA, ${field}[$locale]), ${field}.en, ${field}.es, ${field}.frCA)`;

const tourRefProjection = groq`{
  "title": ${localized("title")},
  "slug": slug.current,
  "duration": ${localized("duration")},
  listingImage,
  highlightBadge,
  peekProId,
  pricing[]{price},
  "currency": coalesce(currency, "USD")
}`;

const promoLandingQuery = groq`*[_type == "groupPromoLandingPage" && slug.current == "tournee-burrows"][0]{
  "metaTitle": ${localized("seo.metaTitle")},
  "metaDescription": ${localized("seo.metaDescription")},
  promoCode,
  "eyebrow": ${localized("eyebrow")},
  "subEyebrow": ${localized("subEyebrow")},
  "heroText": ${localized("heroText")},
  featuredTours[]->${tourRefProjection},
  "golfSectionTitle": ${localized("golfSectionTitle")},
  "golfSectionText": ${localized("golfSectionText")},
  golfTours[]->${tourRefProjection},
  "howToClaimTitle": ${localized("howToClaimTitle")},
  "howToClaimSteps": howToClaimSteps[]{
    "text": coalesce(select($locale == "fr-ca" => @.frCA, @[$locale]), @.en, @.es, @.frCA)
  },
  "whyBookTitle": ${localized("whyBookTitle")},
  "whyBookIntro": ${localized("whyBookIntro")},
  "whyBookPoints": whyBookPoints[]{
    "text": coalesce(select($locale == "fr-ca" => @.frCA, @[$locale]), @.en, @.es, @.frCA)
  },
  faqs[]{
    "question": ${localized("question")},
    "answer": ${localized("answer")}
  },
  "ctaTitle": ${localized("ctaTitle")},
  "ctaText": ${localized("ctaText")},
  "ctaButtonLabel": ${localized("ctaButtonLabel")}
}`;

type PromoTour = {
  title?: string;
  slug?: string;
  duration?: string;
  listingImage?: { asset: unknown };
  highlightBadge?: string;
  peekProId?: string;
  pricing?: Array<{ price?: number | string | null }>;
  currency?: string;
};

type PromoLandingData = {
  metaTitle?: string;
  metaDescription?: string;
  promoCode?: string;
  eyebrow?: string;
  subEyebrow?: string;
  heroText?: string;
  featuredTours?: PromoTour[];
  golfSectionTitle?: string;
  golfSectionText?: string;
  golfTours?: PromoTour[];
  howToClaimTitle?: string;
  howToClaimSteps?: { text?: string }[];
  whyBookTitle?: string;
  whyBookIntro?: string;
  whyBookPoints?: { text?: string }[];
  faqs?: { question?: string; answer?: string }[];
  ctaTitle?: string;
  ctaText?: string;
  ctaButtonLabel?: string;
};

async function fetchPromoLanding(locale: AppLocale) {
  return client
    .fetch<PromoLandingData | null>(
      promoLandingQuery,
      { locale },
      sanityCache([SANITY_TAGS.groupPromoLandingPage]),
    )
    .catch(() => null);
}

export async function generateMetadata({
  params,
}: PromoLandingPageProps): Promise<Metadata> {
  const { locale } = await params;
  const data = await fetchPromoLanding(locale);

  if (!data) {
    return { title: resolveTitle("Adventures Finder") };
  }

  return buildPageMetadata({
    locale,
    pathname: "/tournee-burrows",
    title: data.metaTitle || "Tournee Burrows | Adventures Finder",
    description:
      data.metaDescription ||
      "Exclusive Punta Cana tour and golf deals for Tournee Burrows.",
    image: await getDefaultOgImage(),
    imageAlt: data.metaTitle,
  });
}

// Matches the navy from the Tournée Burrows logo instead of the site's usual
// orange, without touching TourCard's default look everywhere else it's used.
const BURROWS_BOOK_NOW_CLASSNAME =
  "inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-[#1d3461] px-4 text-sm font-semibold text-white transition hover:bg-[#16294b]";

function toTourCardProps(tour: PromoTour) {
  return {
    title: tour.title ?? "",
    slug: tour.slug ?? "",
    duration: tour.duration,
    listingImage: tour.listingImage,
    highlightBadge: tour.highlightBadge,
    pricing: tour.pricing,
    currency: tour.currency,
    peekUrl: tour.peekProId ? peekBookingUrl(tour.peekProId) : "#",
  };
}

export default async function TourneeBurrowsPage({
  params,
}: PromoLandingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = await fetchPromoLanding(locale);

  if (!data) {
    notFound();
  }

  return (
    <div className="bg-white">
      <section className="w-full">
        <div className="mx-auto w-full max-w-6xl md:overflow-hidden md:rounded-b-3xl">
          <Image
            src="/images/banner-burrows-english.webp"
            alt="Tournée Burrows Punta Cana 2026"
            width={1680}
            height={640}
            priority
            className="h-auto w-full"
            sizes="100vw"
          />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <section className="text-center">
          {data.eyebrow ? (
            <p className="inline-flex rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm shadow-red-600/30">
              {data.eyebrow}
            </p>
          ) : null}
          {data.subEyebrow ? (
            <h1 className="mt-4 text-2xl font-bold text-[#0a192f] md:text-3xl">
              {data.subEyebrow}
            </h1>
          ) : null}
          {data.heroText ? (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              {data.heroText}
            </p>
          ) : null}
        </section>

        {data.featuredTours?.length ? (
          <section id="featured-tours" className="mt-12 scroll-mt-24">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {data.featuredTours.map((tour, index) => (
                <TourCard
                  key={`${tour.slug}-${index}`}
                  tour={toTourCardProps(tour)}
                  bookNowClassName={BURROWS_BOOK_NOW_CLASSNAME}
                />
              ))}
            </div>
          </section>
        ) : null}

        {data.golfTours?.length ? (
          <section className="mt-16">
            {data.golfSectionTitle ? (
              <h2 className="text-center text-xl font-bold text-[#0a192f] md:text-2xl">
                {data.golfSectionTitle}
              </h2>
            ) : null}
            {data.golfSectionText ? (
              <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-slate-600">
                {data.golfSectionText}
              </p>
            ) : null}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.golfTours.map((tour, index) => (
                <TourCard
                  key={`${tour.slug}-${index}`}
                  tour={toTourCardProps(tour)}
                  bookNowClassName={BURROWS_BOOK_NOW_CLASSNAME}
                />
              ))}
            </div>
          </section>
        ) : null}

        {data.howToClaimTitle || data.howToClaimSteps?.length ? (
          <section className="mt-16 rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-10">
            {data.howToClaimTitle ? (
              <h2 className="text-center text-xl font-bold text-[#0a192f] md:text-2xl">
                {data.howToClaimTitle}
              </h2>
            ) : null}
            <ol className="mx-auto mt-6 max-w-2xl space-y-4">
              {data.howToClaimSteps?.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span>{step.text}</span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {data.whyBookTitle || data.whyBookPoints?.length ? (
          <section className="mt-16 text-center">
            {data.whyBookTitle ? (
              <h2 className="text-xl font-bold text-[#0a192f] md:text-2xl">
                {data.whyBookTitle}
              </h2>
            ) : null}
            {data.whyBookIntro ? (
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                {data.whyBookIntro}
              </p>
            ) : null}
            <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
              {data.whyBookPoints?.map((point, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 p-4 text-left text-sm font-medium text-slate-700"
                >
                  {point.text}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {data.faqs?.length ? (
          <section className="mx-auto mt-16 max-w-3xl">
            <h2 className="text-center text-xl font-bold text-[#0a192f] md:text-2xl">
              FAQ
            </h2>
            <div className="mt-6 space-y-4">
              {data.faqs.map((faq, index) => (
                <div key={index} className="rounded-xl border border-slate-200 p-5">
                  <p className="font-semibold text-[#0a192f]">{faq.question}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {data.ctaTitle || data.ctaText ? (
          <section className="mt-16 rounded-2xl bg-[#0a192f] px-6 py-12 text-center text-white md:px-12">
            <Image
              src="/images/logo-tournee-burrows-300x300-1.png"
              alt="Tournée Burrows Punta Cana 2026"
              width={120}
              height={120}
              className="mx-auto h-24 w-24 object-contain md:h-28 md:w-28"
            />
            {data.ctaTitle ? (
              <h2 className="mt-4 text-xl font-bold md:text-2xl">{data.ctaTitle}</h2>
            ) : null}
            {data.ctaText ? (
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-200">
                {data.ctaText}
              </p>
            ) : null}
            <ScrollToAnchorButton
              targetId="featured-tours"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-red-600 px-8 text-sm font-semibold text-white shadow-md shadow-red-600/30 transition hover:bg-red-700"
            >
              {data.ctaButtonLabel || "View Featured Options"}
            </ScrollToAnchorButton>
          </section>
        ) : null}
      </div>
    </div>
  );
}
