import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { groq } from "next-sanity";
import TrackedWhatsAppLink from "@/components/meta/TrackedWhatsAppLink";
import JsonLd from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import type { AppLocale } from "@/i18n/routing";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { getDefaultOgImage, sanityOgImage } from "@/lib/ogImage";
import {
  ADVENTURES_WHATSAPP_PHONE,
  getUniversalWhatsAppUrl,
} from "@/lib/utils/whatsapp";

export const revalidate = 86400;

const TRANSFERS_WHATSAPP_URL = getUniversalWhatsAppUrl(
  ADVENTURES_WHATSAPP_PHONE,
  "Hola, deseo información sobre una excursión o traslado",
);

type TransfersPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: TransfersPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Seo" });

  const page = await client
    .fetch<{ heroImage?: unknown } | null>(
      groq`*[_type == "transferPage"][0]{ heroImage }`,
    )
    .catch(() => null);

  return buildPageMetadata({
    locale,
    pathname: "/transfers",
    title: t("transfers.title"),
    description: t("transfers.description"),
    image: sanityOgImage(page?.heroImage) ?? (await getDefaultOgImage()),
    imageAlt: t("transfers.title"),
  });
}

type TransferPageData = {
  heroImage?: unknown;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
};

// No cross-locale fallback: without Sanity copy for the active locale we use
// the translated message instead of showing an English headline on /es or
// /fr-ca, which is what was happening before.
const TRANSFER_PAGE_QUERY = groq`*[_type == "transferPage"][0]{
  heroImage,
  "heroTitle": select($locale == "fr-ca" => heroTitle.frCA, heroTitle[$locale]),
  "heroSubtitle": select($locale == "fr-ca" => heroSubtitle.frCA, heroSubtitle[$locale])
}`;

export default async function TransfersPage({ params }: TransfersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Transfers");
  const tSeo = await getTranslations({ locale, namespace: "Seo" });

  const transferPage = await client
    .fetch<TransferPageData | null>(TRANSFER_PAGE_QUERY, { locale })
    .catch(() => null);

  const heroTitle = transferPage?.heroTitle?.trim() || t("heroTitle");
  const heroSubtitle = transferPage?.heroSubtitle?.trim() || t("heroSubtitle");
  const heroImageUrl = (() => {
    try {
      return transferPage?.heroImage
        ? urlFor(transferPage.heroImage).width(1920).height(800).fit("crop").url()
        : null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <JsonLd
        data={buildBreadcrumbJsonLd(locale, [
          { name: tSeo("breadcrumbHome"), path: "/" },
          { name: tSeo("transfers.title") },
        ])}
      />
      <section className="relative overflow-hidden bg-[#0a192f] px-6 py-20 md:px-10 md:py-28 lg:px-12">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt={heroTitle}
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
            {heroTitle}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-200 md:text-lg">
            {heroSubtitle}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-lg leading-relaxed text-slate-700 md:text-xl">
              {t("section1Text")}
            </p>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-lg">
            <Image
              src="/images/buses.jpg"
              alt={t("busesImageAlt")}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-16 md:px-10 md:py-24 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-[#0a192f] md:text-4xl">
            {t("section2Title")}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-slate-700 md:text-lg">
            {t("section2Text")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg lg:order-1">
            <Image
              src="/images/suv-chevy.jpg"
              alt={t("suvChevyImageAlt")}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="lg:order-2">
            <p className="text-lg leading-relaxed text-slate-700 md:text-xl">
              {t("section3Text")}
            </p>
            <div className="mt-6 flex flex-col gap-3 text-sm text-slate-600 md:text-base">
              <a
                href="mailto:reservations@adventuresfinder.com"
                className="font-medium text-[#0a192f] transition hover:text-blue-700"
              >
                reservations@adventuresfinder.com
              </a>
              <TrackedWhatsAppLink
                href={TRANSFERS_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                source="transfers_page_whatsapp"
                className="font-medium text-[#0a192f] transition hover:text-blue-700"
              >
                +1 849 570 0202
              </TrackedWhatsAppLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-6 py-16 md:px-10 md:py-20 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-lg leading-relaxed text-slate-700 md:text-xl">
            {t("outroText")}
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-8 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {t("ctaButton")}
          </Link>
        </div>
      </section>
    </div>
  );
}
