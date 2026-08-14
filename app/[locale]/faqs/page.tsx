import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import type { AppLocale } from "@/i18n/routing";
import { faqAnswerText, getFaqs } from "@/lib/content/faqs";
import { getDefaultOgImage } from "@/lib/ogImage";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildPageMetadata,
} from "@/lib/seo";

export const revalidate = 86400;

type FaqsPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: FaqsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Seo" });

  return buildPageMetadata({
    locale,
    pathname: "/faqs",
    title: t("faqs.title"),
    description: t("faqs.description"),
    image: await getDefaultOgImage(),
    imageAlt: t("faqs.title"),
  });
}

export default async function FaqsPage({ params }: FaqsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Seo" });
  const faqs = getFaqs(locale);

  const jsonLd = [
    buildFaqJsonLd(
      faqs.map((faq) => ({
        question: faq.question,
        answer: faqAnswerText(faq),
      })),
    ),
    buildBreadcrumbJsonLd(locale, [
      { name: t("breadcrumbHome"), path: "/" },
      { name: t("faqs.title") },
    ]),
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <JsonLd data={jsonLd} />
      <main className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <article className="space-y-10">
          <header className="border-b border-slate-200 pb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#0a192f] md:text-4xl">
              {t("faqs.title")}
            </h1>
          </header>

          {faqs.map((faq) => (
            <section key={faq.question} className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800 md:text-2xl">
                {faq.question}
              </h2>
              {faq.answer.map((paragraph, index) => (
                <div key={index} className="space-y-4">
                  <p className="leading-relaxed text-slate-700">{paragraph}</p>
                  {index === 0 && faq.steps?.length ? (
                    <ul className="list-disc space-y-2 pl-6 leading-relaxed text-slate-700">
                      {faq.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </section>
          ))}
        </article>
      </main>
    </div>
  );
}
