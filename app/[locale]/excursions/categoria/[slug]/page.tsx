import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import CategoryPageHero from "@/components/CategoryPageHero";
import CategorySearch, { type CategoryTour } from "@/components/CategorySearch";
import { client } from "@/sanity/lib/client";
import { routing, type AppLocale } from "@/i18n/routing";
import { tourRatingProjection } from "@/lib/tourRating";

export const revalidate = 0;
export const dynamicParams = true;

type CategoryPageProps = {
  params: Promise<{ locale: AppLocale; slug: string }>;
};

type CategoryData = {
  _id: string;
  title?: string;
  slug?: string;
  mainImage?: unknown;
  bannerImage?: unknown;
};

const categoryBySlugQuery = groq`*[_type == "category" && slug.current == $slug][0] {
  _id,
  "title": coalesce(select($locale == "fr-ca" => title.frCA, title[$locale]), title.en, title.es, title.frCA),
  "slug": slug.current,
  mainImage,
  bannerImage
}`;

const categoryToursQuery = groq`*[_type == "tour" && (
  $slug in categories[]->slug.current ||
  category->slug.current == $slug
)] {
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

export async function generateStaticParams() {
  const categories = await client.fetch<Array<{ slug: string }>>(
    groq`*[_type == "category" && defined(slug.current)]{ "slug": slug.current }`,
  );

  return routing.locales.flatMap((locale) =>
    (categories ?? []).map((category) => ({
      locale,
      slug: category.slug,
    })),
  );
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, slug } = await params;

  const [category, tours] = await Promise.all([
    client.fetch<CategoryData | null>(categoryBySlugQuery, { locale, slug }),
    client.fetch<CategoryTour[]>(categoryToursQuery, { locale, slug }).catch(() => []),
  ]);

  if (!category) {
    notFound();
  }

  const title = category.title?.trim() || slug;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <CategoryPageHero
        title={title}
        bannerImage={category.bannerImage}
        mainImage={category.mainImage}
      />
      <CategorySearch tours={tours} categorySlug={slug} />
    </div>
  );
}
