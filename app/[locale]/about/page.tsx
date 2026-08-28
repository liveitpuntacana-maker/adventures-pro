import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import TeamGrid from "@/components/TeamGrid";
import JsonLd from "@/components/JsonLd";
import { client } from "@/sanity/lib/client";
import { SANITY_TAGS, sanityCache } from "@/lib/sanityCache";
import { urlFor } from "@/sanity/lib/image";
import { groq } from "next-sanity";
import type { AppLocale } from "@/i18n/routing";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { getDefaultOgImage, sanityOgImage } from "@/lib/ogImage";

export const revalidate = 86400;

type AboutPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Seo" });

  const page = await client
    .fetch<{ heroImage?: unknown } | null>(
      groq`*[_type == "aboutPage"][0]{ heroImage }`,
      {},
      sanityCache([SANITY_TAGS.aboutPage]),
    )
    .catch(() => null);

  return buildPageMetadata({
    locale,
    pathname: "/about",
    title: t("about.title"),
    description: t("about.description"),
    image: sanityOgImage(page?.heroImage) ?? (await getDefaultOgImage()),
    imageAlt: t("about.title"),
  });
}

type AboutPageData = {
  heroImage?: unknown;
  whoWeAreTitle?: string | null;
  whoWeAreSubtitle?: string | null;
  whoWeAreBody?: string | null;
  sectionSubtitle?: string | null;
  teamTagline?: string | null;
};

const ABOUT_PAGE_QUERY = groq`*[_type == "aboutPage"][0]{
  heroImage,
  "whoWeAreTitle": coalesce(select($locale == "fr-ca" => whoWeAreTitle.frCA, whoWeAreTitle[$locale]), whoWeAreTitle.en, whoWeAreTitle),
  "whoWeAreSubtitle": coalesce(select($locale == "fr-ca" => whoWeAreSubtitle.frCA, whoWeAreSubtitle[$locale]), whoWeAreSubtitle.en, whoWeAreSubtitle),
  "whoWeAreBody": coalesce(select($locale == "fr-ca" => whoWeAreBody.frCA, whoWeAreBody[$locale]), whoWeAreBody.en, whoWeAreBody),
  "sectionSubtitle": coalesce(select($locale == "fr-ca" => sectionSubtitle.frCA, sectionSubtitle[$locale]), sectionSubtitle.en, sectionSubtitle),
  "teamTagline": coalesce(select($locale == "fr-ca" => teamTagline.frCA, teamTagline[$locale]), teamTagline.en, teamTagline)
}`;

const FALLBACK_TITLE = "Who We Are";
const FALLBACK_SUBTITLE = "Your trusted travel companion in Punta Cana...";
const FALLBACK_BODY = `With over two decades in the travel industry and more than 15 years rooted in Punta Cana, our team has built a reputation for trusted guidance, reliable operations, and truly local expertise.

We believe in crafting memories that matter, designing each experience with care so every guest gets the most value from their time and money while enjoying the very best this destination has to offer.

What sets us apart is our customer service: thoughtful details, personalized attention, and seamless coordination across every step of the journey, from first contact to your final day in paradise.`;

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tSeo = await getTranslations({ locale, namespace: "Seo" });

  const about = await client
    .fetch<AboutPageData | null>(
      ABOUT_PAGE_QUERY,
      { locale },
      sanityCache([SANITY_TAGS.aboutPage, SANITY_TAGS.teamMember]),
    )
    .catch(() => null);

  const title = about?.whoWeAreTitle?.trim() || FALLBACK_TITLE;
  const subtitle = about?.whoWeAreSubtitle?.trim() || FALLBACK_SUBTITLE;
  const bodyText = about?.whoWeAreBody?.trim() || FALLBACK_BODY;
  const bodyParagraphs = bodyText
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const heroImageUrl = (() => {
    try {
      return about?.heroImage
        ? urlFor(about.heroImage).width(1920).height(800).fit("crop").url()
        : null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <JsonLd
        data={buildBreadcrumbJsonLd(locale, [
          { name: tSeo("breadcrumbHome"), path: "/" },
          { name: tSeo("about.title") },
        ])}
      />
      <section className="relative overflow-hidden bg-[#0a192f] px-6 py-20 md:px-10 md:py-28 lg:px-12">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt={title}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        ) : null}
        <div
          className={
            heroImageUrl
              ? "absolute inset-0 bg-gradient-to-br from-[#0a192f]/85 via-[#0f2744]/75 to-[#0a192f]/85"
              : "absolute inset-0 bg-gradient-to-br from-[#0a192f] via-[#0f2744] to-[#0a192f]"
          }
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl md:leading-tight">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-200 md:text-xl">
            {subtitle}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24 lg:px-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {bodyParagraphs.map((paragraph, index) => (
            <article
              key={index}
              className="rounded-2xl border border-slate-200/80 bg-slate-50 p-6 shadow-sm transition-shadow hover:shadow-md md:p-8"
            >
              <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-700 md:text-lg">
                {paragraph}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 px-6 py-16 md:px-10 md:py-24 lg:px-12">
        <div className="mx-auto max-w-7xl pb-4">
          <TeamGrid
            locale={locale}
            teamTagline={about?.teamTagline}
            sectionSubtitle={about?.sectionSubtitle}
          />
        </div>
      </section>
    </div>
  );
}
