import { groq } from "next-sanity";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

export const revalidate = 60;

const partnerLandingQuery = groq`*[_type == "partnerTransferLandingPage" && slug.current == "justcollege"][0]{
  partnerName,
  logo,
  pageTitle,
  heroTitle,
  introText,
  options[]{ title, price, description, image, peekUrl, buttonLabel },
  noticeTitle,
  noticeItems,
  closingText,
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
  partnerName?: string;
  logo?: unknown;
  pageTitle?: string;
  heroTitle?: string;
  introText?: string;
  options?: TransferOption[];
  noticeTitle?: string;
  noticeItems?: string[];
  closingText?: string;
  supportPhone?: string;
  supportEmail?: string;
};

export async function generateMetadata(): Promise<Metadata> {
  const data = await client
    .fetch<PartnerLandingData | null>(partnerLandingQuery)
    .catch(() => null);

  return {
    title: data?.pageTitle ?? "Adventures Finder",
    robots: { index: false, follow: false },
  };
}

export default async function JusCollegePage() {
  const data = await client
    .fetch<PartnerLandingData | null>(partnerLandingQuery)
    .catch(() => null);

  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-14">
      <header className="flex flex-wrap items-center justify-center gap-6 border-b border-slate-100 pb-8">
        {data.logo ? (
          <Image
            src={urlFor(data.logo).width(220).url()}
            alt={data.partnerName ?? "Partner logo"}
            width={220}
            height={80}
            className="h-auto w-40 object-contain md:w-52"
          />
        ) : null}
        <Image
          src="/images/logo-v3.png"
          alt="Adventures Finder"
          width={220}
          height={73}
          className="h-14 w-auto object-contain md:h-16"
        />
      </header>

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
              <li
                key={index}
                className="text-sm leading-relaxed text-slate-600"
              >
                {item}
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

      <footer className="mt-12 border-t border-slate-100 pt-8 text-center text-sm text-slate-500">
        {data.supportPhone || data.supportEmail ? (
          <p>
            {data.supportPhone}
            {data.supportPhone && data.supportEmail ? " · " : ""}
            {data.supportEmail}
          </p>
        ) : null}
        <p className="mt-2">
          Copyright &copy; {new Date().getFullYear()} Adventures Finder
        </p>
      </footer>
    </div>
  );
}
