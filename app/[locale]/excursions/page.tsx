import { groq } from "next-sanity";
import ExcursionesCatalog, {
  type ExcursionTour,
} from "@/components/ExcursionesCatalog";
import { client } from "@/sanity/lib/client";
import { type AppLocale } from "@/i18n/routing";

const excursionsQuery = groq`*[_type == "tour" && (
  !defined($category) ||
  $category in categories[]->slug.current ||
  category->slug.current == $category ||
  (isCombo == true && mainTour->category->slug.current == $category)
)] {
  _id,
  "title": coalesce(select($locale == "fr-ca" => title.frCA, title[$locale]), title.en, title),
  "slug": slug.current,
  "mainImage": coalesce(listingImage, mainTour->listingImage),
  pricing[]{price},
  "price": coalesce(pricing[0].price, mainTour->pricing[0].price, 0),
  "priceTag": coalesce(priceTag, mainTour->priceTag),
  "duration": coalesce(select($locale == "fr-ca" => duration.frCA, duration[$locale]), duration.en, duration.es, duration.frCA),
  peekProId,
  "category": {
    "slug": category->slug.current,
    "title": coalesce(
      select($locale == "fr-ca" => category->title.frCA, category->title[$locale]),
      category->title.en,
      category->title.es,
      category->title.frCA
    )
  },
  "categorySlugs": array::compact([category->slug.current, ...categories[]->slug.current]),
  "currency": coalesce(currency, "USD")
} | order(price asc)`;

const categoriesQuery = groq`*[_type == "category"] | order(coalesce(title.en, title.es, title.frCA) asc){
  "slug": slug.current,
  "title": coalesce(
    select($locale == "fr-ca" => title.frCA, title[$locale]),
    title.en,
    title.es,
    title.frCA
  )
}`;

type PageProps = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ category?: string }>;
};

export default async function ExcursionesPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const { category } = await searchParams;
  const activeCategory = category || "all";
  const [tours, categories] = await Promise.all([
    client.fetch<ExcursionTour[]>(excursionsQuery, {
      locale,
      category: category || null,
    }),
    client.fetch<Array<{ slug: string; title: string }>>(categoriesQuery, { locale }),
  ]);

  return (
    <ExcursionesCatalog
      tours={tours}
      categories={[{ slug: "all", title: "All" }, ...categories]}
      initialCategory={activeCategory}
    />
  );
}
