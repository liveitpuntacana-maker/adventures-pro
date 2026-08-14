import { groq } from "next-sanity";
import { hasLocale } from "next-intl";
import type { Metadata } from "next";
import TourDetailPage from "@/components/tour/TourDetail";
import { client } from "@/sanity/lib/client";
import { routing, type AppLocale } from "@/i18n/routing";
import { slugFromParams, slugToStaticParams } from "@/lib/tourSlug";
import { buildTourMetadata } from "@/lib/tourSeo";

export const revalidate = 3600;
export const dynamicParams = true;

type LocalizedTourDetailPageProps = {
  params: Promise<{ locale: AppLocale; slug: string[] }>;
};

export async function generateStaticParams() {
  const tours = await client.fetch<Array<{ slug: string }>>(
    groq`*[_type == "tour" && defined(slug.current)]{
      "slug": slug.current
    }`,
  );

  // Only the default locale is prerendered at build time. The other locales
  // are generated on first request and then cached by ISR, which keeps the
  // build from firing three requests per tour against the Sanity API.
  return (tours ?? []).map((tour) => ({
    locale: routing.defaultLocale,
    slug: slugToStaticParams(tour.slug),
  }));
}

export async function generateMetadata({
  params,
}: LocalizedTourDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolvedSlug = slugFromParams(slug);

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  return buildTourMetadata({
    locale,
    slug: resolvedSlug,
  });
}

export default async function LocalizedTourDetailPage({
  params,
}: LocalizedTourDetailPageProps) {
  const { slug, locale } = await params;
  const resolvedSlug = slugFromParams(slug);
  return (
    <TourDetailPage params={Promise.resolve({ slug: resolvedSlug, locale })} />
  );
}
