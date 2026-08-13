import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import CategoryPageHero from "@/components/CategoryPageHero";
import CategorySearch, { type CategoryTour } from "@/components/CategorySearch";
import { client } from "@/sanity/lib/client";
import { routing, type AppLocale } from "@/i18n/routing";
import { tourRatingProjection } from "@/lib/tourRating";

export const revalidate = 0;
export const dynamicParams = true;

type DestinationPageProps = {
  params: Promise<{ locale: AppLocale; slug: string }>;
};

type DestinationData = {
  _id: string;
  title?: string;
  slug?: string;
  mainImage?: unknown;
};

const destinationBySlugQuery = groq`*[_type == "destination" && slug.current == $slug][0] {
  _id,
  "title": coalesce(select($locale == "fr-ca" => title.frCA, title[$locale]), title.en, title.es, title.frCA),
  "slug": slug.current,
  mainImage
}`;

const destinationToursQuery = groq`*[_type == "tour" && destination->slug.current == $slug] {
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
  const destinations = await client.fetch<Array<{ slug: string }>>(
    groq`*[_type == "destination" && defined(slug.current)]{ "slug": slug.current }`,
  );

  return routing.locales.flatMap((locale) =>
    (destinations ?? []).map((destination) => ({
      locale,
      slug: destination.slug,
    })),
  );
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const { locale, slug } = await params;

  const [destination, tours] = await Promise.all([
    client.fetch<DestinationData | null>(destinationBySlugQuery, { locale, slug }),
    client.fetch<CategoryTour[]>(destinationToursQuery, { locale, slug }).catch(() => []),
  ]);

  if (!destination) {
    notFound();
  }

  const title = destination.title?.trim() || slug;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <CategoryPageHero title={title} mainImage={destination.mainImage} />
      <CategorySearch tours={tours} categorySlug={slug} messagesNamespace="DestinationPage" />
    </div>
  );
}
