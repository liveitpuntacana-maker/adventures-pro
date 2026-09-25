import { groq } from "next-sanity";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { SANITY_TAGS, sanityCache } from "@/lib/sanityCache";
import { resolveTitle } from "@/lib/seo";
import type { AppLocale } from "@/i18n/routing";

export const revalidate = 3600;

type PartnerLandingPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

const localized = (field: string) =>
  `coalesce(select($locale == "fr-ca" => ${field}.frCA, ${field}[$locale]), ${field}.en, ${field}.es, ${field}.frCA)`;

const partnerLandingQuery = groq`*[_type == "partnerTransferLandingPage" && slug.current == "juscollege"][0]{
  logo,
  "pageTitle": ${localized("pageTitle")},
  "heroTitle": ${localized("heroTitle")},
  "introText": ${localized("introText")},
  options[]{
    "title": ${localized("title")},
    "price": ${localized("price")},
    "description": ${localized("description")},
    image,
    peekUrl,
    "buttonLabel": ${localized("buttonLabel")}
  },
  "noticeTitle": ${localized("noticeTitle")},
  "noticeItems": noticeItems[]{
    "text": coalesce(select($locale == "fr-ca" => @.frCA, @[$locale]), @.en, @.es, @.frCA)
  },
  "closingText": ${localized("closingText")},
  supportPhone,
  supportEmail
}`;

type TransferOption = {
  title?: string;
  price?: string;
  description?: string;
  image?: unknown;
  peekUrl?: string;
  buttonLabel?: string;
};

type PartnerLandingData = {
  logo?: unknown;
  pageTitle?: string;
  heroTitle?: string;
  introText?: string;
  options?: TransferOption[];
  noticeTitle?: string;
  noticeItems?: { text?: string }[];
  closingText?: string;
  supportPhone?: string;
  supportEmail?: string;
};

async function fetchPartnerLanding(locale: AppLocale) {
  return client
    .fetch<PartnerLandingData | null>(
      partnerLandingQuery,
      { locale },
      sanityCache([SANITY_TAGS.partnerTransferLandingPage]),
    )
    .catch(() => null);
}

export async function generateMetadata({
  params,
}: PartnerLandingPageProps): Promise<Metadata> {
  const { locale } = await params;
  const data = await fetchPartnerLanding(locale);

  return {
    title: resolveTitle(data?.pageTitle ?? "Adventures Finder"),
    robots: { index: false, follow: false },
  };
}

export default async function JusCollegePage({
  params,
}: PartnerLandingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = await fetchPartnerLanding(locale);

  if (!data) {
    notFound();
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-14">
      {data.logo ? (
        <div className="flex justify-center border-b border-slate-100 pb-8">
          <Image
            src={urlFor(data.logo).width(220).url()}
            alt="JusCollege"
            width={220}
            height={80}
            className="h-auto w-40 object-contain md:w-52"
          />
        </div>
      ) : null}

      <section className="mt-10 text-center">
        <h1 className="text-3xl font-bold text-[#0a192f] md:text-4xl">
          {data.heroTitle}
        </h1>
        {data.introText ? (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
            {data.introText}
          </p>
        ) : null}
      </section>

      {data.options?.length ? (
        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          {data.options.map((option, index) => (
            <article
              key={`${option.title}-${index}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
            >
              {option.image ? (
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={urlFor(option.image).width(800).url()}
                    alt={option.title ?? ""}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-xl font-semibold text-[#0a192f]">
                  {option.title}
                </h2>
                <p className="mt-1 text-lg font-bold text-orange-600">
                  {option.price}
                </p>
                {option.description ? (
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                    {option.description}
                  </p>
                ) : null}
                {option.peekUrl ? (
                  <a
                    href={option.peekUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex h-12 items-center justify-center rounded-xl bg-orange-500 px-6 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:bg-orange-600"
                  >
                    {option.buttonLabel || "Book Now"}
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {data.noticeTitle || data.noticeItems?.length ? (
        <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8">
          {data.noticeTitle ? (
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#0a192f]">
              {data.noticeTitle}
            </h3>
          ) : null}
          <ul className="mt-4 space-y-3">
            {data.noticeItems?.map((item, index) => (
              <li key={index} className="text-sm leading-relaxed text-slate-600">
                {item.text}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {data.closingText ? (
        <p className="mt-10 text-center text-base font-medium text-slate-700">
          {data.closingText}
        </p>
      ) : null}

      {data.supportPhone || data.supportEmail ? (
        <p className="mt-10 text-center text-sm text-slate-500">
          {data.supportPhone}
          {data.supportPhone && data.supportEmail ? " · " : ""}
          {data.supportEmail}
        </p>
      ) : null}
      </div>
    </div>
  );
}
