import { groq } from "next-sanity";
import { hasLocale } from "next-intl";
import type { Metadata } from "next";
import TourDetailPage from "@/app/tours/[slug]/page";
import { client } from "@/sanity/lib/client";
import { routing, type AppLocale } from "@/i18n/routing";
import { slugFromParams, slugToStaticParams } from "@/lib/tourSlug";
import { buildTourMetadata } from "@/lib/tourSeo";

export const revalidate = 0;
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

  return routing.locales.flatMap((locale) =>
    tours?.map((tour) => ({
      locale,
      slug: slugToStaticParams(tour.slug),
    })) || [],
  );
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
