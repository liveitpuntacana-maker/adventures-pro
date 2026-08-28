import {
  Baby,
  Calendar,
  Camera,
  Check,
  Clock,
  ShieldCheck,
  Star,
  Ticket,
  Timer,
  Users,
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import BookNowLink from "@/components/meta/BookNowLink";
import TourViewContent from "@/components/meta/TourViewContent";
import { formatTourPrice, peekBookingUrl } from "@/lib/tourPrice";
import {
  formatTourRating,
  tourReviewsDetailProjection,
  type TourReview,
} from "@/lib/tourRating";
import { categoryExcursionPath } from "@/lib/categoryPath";
import { slugLookupVariants, tourExcursionPath } from "@/lib/tourSlug";
import {
  buildBreadcrumbJsonLd,
  buildTourProductJsonLd,
  localizedUrl,
} from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import RelatedTours from "@/components/tour/RelatedTours";
import { SANITY_TAGS, sanityCache } from "@/lib/sanityCache";
import { routing, type AppLocale } from "@/i18n/routing";

type TourPageProps = {
  params: Promise<{ slug: string; locale?: AppLocale }>;
};

type GalleryImage = { _key: string; asset: unknown };

type ComboDayTour = {
  title: string;
  duration?: string | null;
  infoTour?: string | null;
  whatHappens?: string | null;
  goodToKnow?: string | null;
  whatsIncluded?: string | null;
  whatToBring?: string | null;
};

type ComboDay = {
  _key: string;
  dayLabel: string;
  tour?: ComboDayTour | null;
};

type TourData = {
  title: string;
  slug: string;
  category?: string | null;
  currency?: string;
  pricing?: Array<{ _key: string; label: string; price?: number | string | null }> | null;
  duration?: string;
  availability?: string;
  ages?: string;
  starts?: string;
  peekProId: string;
  priceTag?: string | null;
  mainImage?: { asset: unknown } | null;
  gallery?: GalleryImage[] | null;
  isCombo?: boolean;
  comboComments?: string | null;
  comboDays?: ComboDay[] | null;
  infoTour?: string | null;
  whatHappens?: string | null;
  includes?: string | null;
  excludes?: string | null;
  goodToKnow?: string | null;
  faq?: string | null;
  rating?: number | null;
  reviewsCount?: number | null;
  reviews?: TourReview[] | null;
};

const TOUR_QUERY = `*[_type == "tour" && slug.current in $slugCandidates][0]{
  "title": coalesce(select($locale == "fr-ca" => title.frCA, title[$locale]), title.en, title.es, title.frCA),
  "slug": slug.current,
  "category": coalesce(
    select(
      isCombo == true => mainTour->category->slug.current,
      category->slug.current
    ),
    coalesce(comboDays, comboItems)[0].tour->category->slug.current,
    "multidays-tours"
  ),
  "currency": coalesce(currency, mainTour->currency, "USD"),
  "pricing": select(
    count(pricing) > 0 => pricing[]{_key, label, price},
    mainTour->pricing[]{_key, label, price}
  ),
  isCombo,
  peekProId,
  "priceTag": coalesce(priceTag, mainTour->priceTag),
  "mainImage": coalesce(listingImage, mainTour->listingImage),
  "gallery": (
    coalesce(gallery, []) +
    coalesce(mainTour->gallery, []) +
    coalesce(coalesce(comboDays, comboItems)[].tour->gallery, [])
  )[]{_key, asset},
  "comboComments": coalesce(select($locale == "fr-ca" => comboComments.frCA, comboComments[$locale]), comboComments.en, comboComments.es, comboComments.frCA),
  "duration": select(
    isCombo == true => coalesce(
      select($locale == "fr-ca" => mainTour->duration.frCA, mainTour->duration[$locale]),
      mainTour->duration.en,
      mainTour->duration.es,
      mainTour->duration.frCA
    ),
    coalesce(select($locale == "fr-ca" => duration.frCA, duration[$locale]), duration.en, duration.es, duration.frCA)
  ),
  "availability": select(
    isCombo == true => coalesce(
      select($locale == "fr-ca" => mainTour->availability.frCA, mainTour->availability[$locale]),
      mainTour->availability.en,
      mainTour->availability.es,
      mainTour->availability.frCA
    ),
    coalesce(select($locale == "fr-ca" => availability.frCA, availability[$locale]), availability.en, availability.es, availability.frCA)
  ),
  "ages": select(
    isCombo == true => coalesce(
      select($locale == "fr-ca" => mainTour->ages.frCA, mainTour->ages[$locale]),
      mainTour->ages.en,
      mainTour->ages.es,
      mainTour->ages.frCA
    ),
    coalesce(select($locale == "fr-ca" => ages.frCA, ages[$locale]), ages.en, ages.es, ages.frCA)
  ),
  "starts": select(
    isCombo == true => coalesce(
      select($locale == "fr-ca" => mainTour->starts.frCA, mainTour->starts[$locale]),
      mainTour->starts.en,
      mainTour->starts.es,
      mainTour->starts.frCA
    ),
    coalesce(select($locale == "fr-ca" => starts.frCA, starts[$locale]), starts.en, starts.es, starts.frCA)
  ),
  "comboDays": coalesce(comboDays, comboItems)[]{
    _key,
    dayLabel,
    tour->{
      "title": coalesce(select($locale == "fr-ca" => title.frCA, title[$locale]), title.en, title.es, title.frCA),
      "duration": coalesce(select($locale == "fr-ca" => duration.frCA, duration[$locale]), duration.en, duration.es, duration.frCA),
      "infoTour": coalesce(select($locale == "fr-ca" => infoTour.frCA, infoTour[$locale]), infoTour.en, infoTour.es, infoTour.frCA),
      "whatHappens": coalesce(select($locale == "fr-ca" => whatHappens.frCA, whatHappens[$locale]), whatHappens.en, whatHappens.es, whatHappens.frCA),
      "goodToKnow": coalesce(select($locale == "fr-ca" => goodToKnow.frCA, goodToKnow[$locale]), goodToKnow.en, goodToKnow.es, goodToKnow.frCA),
      "whatsIncluded": coalesce(select($locale == "fr-ca" => includes.frCA, includes[$locale]), includes.en, includes.es, includes.frCA),
      "whatToBring": coalesce(select($locale == "fr-ca" => whatToBring.frCA, whatToBring[$locale]), whatToBring.en, whatToBring.es, whatToBring.frCA)
    }
  },
  "infoTour": coalesce(select($locale == "fr-ca" => infoTour.frCA, infoTour[$locale]), infoTour.en, infoTour.es, infoTour.frCA),
  "whatHappens": coalesce(select($locale == "fr-ca" => whatHappens.frCA, whatHappens[$locale]), whatHappens.en, whatHappens.es, whatHappens.frCA),
  "includes": coalesce(select($locale == "fr-ca" => includes.frCA, includes[$locale]), includes.en, includes.es, includes.frCA),
  "excludes": coalesce(select($locale == "fr-ca" => excludes.frCA, excludes[$locale]), excludes.en, excludes.es, excludes.frCA),
  "goodToKnow": coalesce(select($locale == "fr-ca" => goodToKnow.frCA, goodToKnow[$locale]), goodToKnow.en, goodToKnow.es, goodToKnow.frCA),
  "faq": coalesce(select($locale == "fr-ca" => faq.frCA, faq[$locale]), faq.en, faq.es, faq.frCA),
  ${tourReviewsDetailProjection}
}`;

const formatCategoryTitle = (value: string) =>
  (value?.split("-") || [])
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const displayPricingLabel = (label: string) =>
  label.replace(/\bCHILDS\b/gi, "CHILDREN");

const parsePriceValue = (value?: number | string | null) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return Number.NaN;
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

/**
 * The "from" price: what one paying adult actually pays.
 *
 * Two rules matter, and both come from real rows in the CMS.
 *
 * Free rows are skipped. Several tours advertise infants and young children at
 * 0 on purpose, and that is worth showing on the page — but it is not what the
 * tour costs. Hard Rock Golf lists "Child (Under 12) (Must be accompanied by a
 * full paying adult)" at 0, and a substring search for "adult" matched that
 * label, so a 195 green fee was being advertised as 0.
 *
 * The label must *begin* with "adult". Montaña Redonda prices "4 Pax" at 580
 * and "Extra Adults" at 75; the extra-person surcharge is not the lead price
 * either. Anything else falls back to the first row that costs money, which is
 * how the catalogue cards read it too.
 */
const pickAdultLeadPricing = (
  rows?: TourData["pricing"] | null,
): NonNullable<TourData["pricing"]>[number] | null => {
  if (!rows?.length) return null;

  const paid = rows.filter((r) => {
    const value = parsePriceValue(r.price);
    return Number.isFinite(value) && value > 0;
  });
  if (paid.length === 0) return null;

  const label = (s?: string | null) => (s ?? "").trim().toUpperCase();

  const exact = paid.find((r) => label(r.label) === "ADULTS" || label(r.label) === "ADULT");
  if (exact) return exact;

  const leading = paid.find((r) => /^ADULTS?\b/.test(label(r.label)));
  if (leading) return leading;

  return paid[0];
};

const splitLines = (value?: string | null) =>
  (value ?? "")
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const dedupeGallery = (images: GalleryImage[]) => {
  const seen = new Set<string>();
  return images.filter((image) => {
    if (!image?._key || seen.has(image._key) || !image.asset) return false;
    seen.add(image._key);
    return true;
  });
};

const buildGallery = (
  images: GalleryImage[],
  mainImage?: { asset: unknown } | null,
): GalleryImage[] => {
  const merged = dedupeGallery(images);
  if (merged.length > 0) return merged;
  if (mainImage?.asset) {
    return [{ _key: "main-image", asset: mainImage.asset }];
  }
  return [];
};

function RatingStars({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));
  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`${iconClass} ${
            index < rounded
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

export default async function TourDetailPage({ params }: TourPageProps) {
  const { slug, locale } = await params;
  const activeLocale = locale ?? routing.defaultLocale;
  const slugCandidates = slugLookupVariants(slug);
  const tour = await client.fetch<TourData | null>(
    TOUR_QUERY,
    { slugCandidates, locale: activeLocale },
    sanityCache([SANITY_TAGS.tour]),
  );

  if (!tour?.slug) {
    notFound();
  }

  const currency = tour.currency || "USD";
  const isCombo = tour.isCombo === true;
  const comboCommentsLines = splitLines(tour.comboComments);
  const comboDays = tour.comboDays ?? [];
  const infoTourLines = splitLines(tour.infoTour);
  const programLines = splitLines(tour.whatHappens);
  const goodToKnowLines = splitLines(tour.goodToKnow);
  const includesLines = splitLines(tour.includes);
  const excludesLines = splitLines(tour.excludes);
  const faqText = (tour.faq ?? "").trim();
  const fullGallery = buildGallery(tour.gallery ?? [], tour.mainImage);
  const gallery = fullGallery.slice(0, 3);
  const galleryLightbox = fullGallery.slice(0, 5);
  const pricing = tour.pricing ?? [];
  const adultLeadPricing = pickAdultLeadPricing(pricing);
  const adultLeadPriceValue = (() => {
    const preferred = parsePriceValue(adultLeadPricing?.price);
    if (Number.isFinite(preferred) && preferred > 0) return preferred;
    // Same rule as the picker: a free children's row is not a "from" price.
    for (const row of pricing) {
      const value = parsePriceValue(row.price);
      if (Number.isFinite(value) && value > 0) return value;
    }
    return Number.NaN;
  })();
  const leadFromFormatted = Number.isFinite(adultLeadPriceValue)
    ? formatTourPrice(currency, adultLeadPriceValue)
    : pricing.length > 0
      ? "Consultar precio"
      : null;
  const peekUrl = peekBookingUrl(tour.peekProId);
  const categorySlug = tour.category || "multidays-tours";
  const categoryTitle = formatCategoryTitle(categorySlug);
  const reviews = tour.reviews ?? [];
  const reviewsCount = tour.reviewsCount ?? reviews.length;
  const showHeroRating = reviewsCount > 0;
  const showReviewsSection = reviews.length > 0;
  const pageUrl = localizedUrl(activeLocale, tourExcursionPath(tour.slug));
  const seoDescription = infoTourLines.join(" ");
  const seoImage = (() => {
    try {
      return tour.mainImage?.asset
        ? urlFor(tour.mainImage).width(1200).height(630).fit("crop").url()
        : null;
    } catch {
      return null;
    }
  })();
  const tourJsonLd = buildTourProductJsonLd({
    name: tour.title,
    description: seoDescription || null,
    image: seoImage,
    url: pageUrl,
    price: Number.isFinite(adultLeadPriceValue) ? adultLeadPriceValue : null,
    priceCurrency: currency,
    // Only the reviews actually rendered on this page are marked up, and
    // buildTourProductJsonLd drops the rating entirely below its threshold.
    rating: tour.rating,
    reviewsCount,
    reviews: showReviewsSection ? reviews : null,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(activeLocale, [
    { name: "Home", path: "/" },
    { name: categoryTitle, path: categoryExcursionPath(categorySlug) },
    { name: tour.title },
  ]);

  return (
    <div className="bg-slate-50 text-slate-900">
      <JsonLd data={[tourJsonLd, breadcrumbJsonLd]} />
      <TourViewContent
        slug={tour.slug}
        title={tour.title}
        value={Number.isFinite(adultLeadPriceValue) ? adultLeadPriceValue : undefined}
        currency={currency}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 pb-28 md:px-10 md:py-12 md:pb-12 lg:px-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: categoryTitle, href: categoryExcursionPath(categorySlug) },
            { label: tour.title },
          ]}
        />
        <div className="mb-8 px-1 py-2 md:mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            {categoryTitle}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-5xl">
            {tour.title}
          </h1>
          {showHeroRating ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-700">
              <RatingStars rating={tour.rating ?? 0} />
              <span className="font-semibold text-slate-900">
                {formatTourRating(tour.rating ?? 0)}
              </span>
              <span className="text-slate-500">
                ({reviewsCount} {reviewsCount === 1 ? "review" : "reviews"})
              </span>
            </div>
          ) : null}
          {(tour.duration || tour.availability || tour.ages || tour.starts) ? (
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              {tour.duration ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                  <Clock className="h-4 w-4" />
                  {tour.duration}
                </span>
              ) : null}
              {tour.availability ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                  <Calendar className="h-4 w-4" />
                  {tour.availability}
                </span>
              ) : null}
              {tour.ages ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                  <Baby className="h-4 w-4" />
                  {tour.ages}
                </span>
              ) : null}
              {tour.starts ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                  <Timer className="h-4 w-4" />
                  {tour.starts}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <section className="relative mb-8 left-1/2 right-1/2 w-screen -translate-x-1/2 md:mb-10">
          <input id="gallery-toggle" type="checkbox" className="peer sr-only" />
          <div className="md:hidden">
            <div className="flex snap-x snap-mandatory overflow-x-auto">
              {(gallery ?? []).map((image, index) => (
                <div
                  key={image._key}
                  className="relative h-[260px] w-full flex-shrink-0 snap-center"
                >
                  <Image
                    src={urlFor(image).width(1200).height(900).fit("crop").url()}
                    alt={`${tour.title} — ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              {(gallery ?? []).map((image) => (
                <span
                  key={`dot-${image._key}`}
                  className="h-1.5 w-1.5 rounded-full bg-slate-300"
                />
              ))}
            </div>
          </div>
          <div className="hidden h-[350px] w-full md:block">
            <div className="grid h-full w-full gap-4 px-6 md:grid-cols-3 md:px-10 lg:px-12">
              {(gallery ?? []).map((image, index) => (
                <div key={image._key} className="relative h-full w-full">
                  <Image
                    src={urlFor(image).width(1600).height(1000).fit("crop").url()}
                    alt={`${tour.title} — ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>
          <label
            htmlFor="gallery-toggle"
            className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-md md:right-14"
          >
            <Camera className="h-4 w-4" />
            View gallery
          </label>
          <div className="pointer-events-none fixed inset-0 z-[70] bg-black/70 opacity-0 transition peer-checked:pointer-events-auto peer-checked:opacity-100">
            <div className="mx-auto mt-8 h-[calc(100vh-4rem)] w-[min(1200px,92vw)] overflow-y-auto rounded-2xl bg-white p-4 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Gallery</h3>
                <label
                  htmlFor="gallery-toggle"
                  className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700"
                >
                  Close
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {(galleryLightbox ?? []).map((image, index) => (
                  <div key={image._key} className="relative h-64 w-full md:h-80">
                    <Image
                      src={urlFor(image).width(2000).height(1400).fit("crop").url()}
                      alt={`${tour.title} — ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
          <div className="space-y-6 md:space-y-12">
            {isCombo ? (
              <>
                {comboCommentsLines.length > 0 ? (
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                      Combo notes
                    </h2>
                    <div className="mt-4 space-y-3">
                      {comboCommentsLines.map((line) => (
                        <p
                          key={line}
                          className="text-[15px] leading-relaxed text-slate-700"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </section>
                ) : null}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Itinerario del Combo
                </h2>
                <div className="mt-8 space-y-10">
                  {comboDays.map((day) => {
                    const ref = day.tour;
                    const itemInfoLines = splitLines(ref?.infoTour);
                    const itemProgramLines = splitLines(ref?.whatHappens);
                    const itemGoodToKnowLines = splitLines(ref?.goodToKnow);
                    const itemIncludedLines = splitLines(ref?.whatsIncluded);
                    const itemBringLines = splitLines(ref?.whatToBring);
                    return (
                      <article
                        key={day._key}
                        className="border-t border-slate-100 pt-10 first:border-t-0 first:pt-0"
                      >
                        <h3 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                          {ref?.title
                            ? `${day.dayLabel} — ${ref.title}`
                            : day.dayLabel}
                        </h3>
                        {ref?.duration ? (
                          <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="h-4 w-4" />
                            {ref.duration}
                          </p>
                        ) : null}
                        {itemInfoLines.length > 0 ? (
                          <div className="mt-6 space-y-3">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                              Overview
                            </p>
                            {itemInfoLines.map((line) => (
                              <p
                                key={line}
                                className="text-[15px] leading-relaxed text-slate-700"
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        ) : null}
                        {itemProgramLines.length > 0 ? (
                          <div className="mt-8 space-y-4">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                              What happens
                            </p>
                            {itemProgramLines.map((step, index) => (
                              <div key={`${index}-${step}`} className="flex gap-4">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                                  {index + 1}
                                </div>
                                <p className="pt-0.5 text-[15px] leading-7 text-slate-700">
                                  {step}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        {itemGoodToKnowLines.length > 0 ? (
                          <div className="mt-8 space-y-3 rounded-xl bg-amber-50/60 px-4 py-4">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                              Good to know
                            </p>
                            {itemGoodToKnowLines.map((line) => (
                              <p
                                key={line}
                                className="text-[15px] leading-relaxed text-slate-700"
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        ) : null}
                        {itemIncludedLines.length > 0 ? (
                          <div className="mt-8 space-y-3">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                              What&apos;s included
                            </p>
                            <ul className="space-y-2">
                              {itemIncludedLines.map((line) => (
                                <li key={line} className="flex items-start gap-3">
                                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                  <span className="text-[15px] text-slate-700">{line}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {itemBringLines.length > 0 ? (
                          <div className="mt-8 space-y-3">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                              What to bring
                            </p>
                            <ul className="space-y-2">
                              {itemBringLines.map((line) => (
                                <li key={line} className="flex items-start gap-3">
                                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                                  <span className="text-[15px] text-slate-700">{line}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </section>
              </>
            ) : (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Tour overview
                  </h2>
                  <div className="mt-4 space-y-3">
                    {(infoTourLines ?? []).map((line) => (
                      <p
                        key={line}
                        className="mb-6 text-[15px] leading-relaxed text-slate-700 last:mb-0"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    What happens on this tour
                  </h2>
                  <div className="mt-6 space-y-5">
                    {(programLines ?? []).map((step, index) => (
                      <div key={`${index}-${step}`} className="flex gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                          {index + 1}
                        </div>
                        <p className="pt-1 text-[15px] leading-7 text-slate-700">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {!isCombo ? (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Excludes
                  </h2>
                  <ul className="mt-6 space-y-3">
                    {(excludesLines ?? []).map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                        <span className="text-[15px] text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    What&apos;s included
                  </h2>
                  <ul className="mt-6 space-y-3">
                    {(includesLines ?? []).map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-5 w-5 text-emerald-500" />
                        <span className="text-[15px] text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm md:p-8">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Good to know
                  </h2>
                  <div className="mt-5 space-y-3 text-[15px] leading-7 text-slate-700">
                    {(goodToKnowLines ?? []).map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    FAQs
                  </h2>
                  <div className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-4">
                    <p className="whitespace-pre-line text-[15px] leading-7 text-slate-700">
                      {faqText}
                    </p>
                  </div>
                </section>
              </>
            ) : null}

            {showReviewsSection ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Opiniones de clientes
                </h2>
                {showHeroRating ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-700">
                    <RatingStars rating={tour.rating ?? 0} />
                    <span className="font-semibold text-slate-900">
                      {formatTourRating(tour.rating ?? 0)}
                    </span>
                    <span className="text-slate-500">
                      · {reviewsCount} {reviewsCount === 1 ? "reseña" : "reseñas"}
                    </span>
                  </div>
                ) : null}
                <div className="mt-8 space-y-6">
                  {reviews.map((review) => (
                    <article
                      key={review._key}
                      className="border-t border-slate-100 pt-6 first:border-t-0 first:pt-0"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900">
                          {review.author?.trim() || "Guest"}
                        </p>
                        {review.date ? (
                          <p className="text-xs text-slate-500">{review.date}</p>
                        ) : null}
                      </div>
                      <div className="mt-2">
                        <RatingStars rating={review.rating ?? 5} size="sm" />
                      </div>
                      {review.text ? (
                        <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
                          {review.text}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-[0_24px_60px_-16px_rgba(15,23,42,0.14)] md:p-10">
              <div className="flex items-start justify-between gap-5 pb-6">
                <h3 className="text-xl font-semibold leading-snug tracking-tight text-blue-950">
                  Book this experience
                </h3>
                <Ticket
                  className="mt-0.5 h-6 w-6 shrink-0 text-blue-800"
                  strokeWidth={1.75}
                />
              </div>
              {tour.priceTag?.trim() ? (
                <p className="mb-4 text-sm font-medium text-slate-500">
                  From{" "}
                  {leadFromFormatted ? (
                    <span className="font-semibold text-blue-950">{leadFromFormatted}</span>
                  ) : (
                    <span className="font-semibold text-blue-950">-</span>
                  )}{" "}
                  <span className="text-slate-500">({tour.priceTag.trim()})</span>
                </p>
              ) : null}
              <div className="mt-2 space-y-0 rounded-2xl border border-slate-200/80 bg-slate-50/70 px-6 py-2">
                {(pricing ?? []).map((item) => {
                  const priceValue = parsePriceValue(item.price);
                  const hasPrice = Number.isFinite(priceValue);
                  return (
                  <div
                    key={item._key}
                    className="flex items-start justify-between gap-6 border-b border-slate-200/80 py-5 last:border-b-0"
                  >
                    <p className="max-w-[58%] text-[13px] font-semibold uppercase leading-relaxed tracking-[0.14em] text-blue-950/85">
                      {displayPricingLabel(item.label)}
                    </p>
                    <p className="text-right text-lg font-semibold leading-relaxed tracking-tight text-blue-950">
                      {hasPrice
                        ? formatTourPrice(currency, priceValue, { freeAsWord: true })
                        : "Consultar precio"}
                    </p>
                  </div>
                  );
                })}
              </div>

              <div className="mt-10 space-y-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 px-6 py-7">
                <div className="flex items-start gap-4 text-[15px] leading-relaxed text-blue-950">
                  <ShieldCheck
                    className="mt-0.5 h-5 w-5 shrink-0 text-blue-800"
                    strokeWidth={1.75}
                  />
                  <span>Free cancellation up to 24 hours</span>
                </div>
                <div className="flex items-start gap-4 text-[15px] leading-relaxed text-blue-950">
                  <Users
                    className="mt-0.5 h-5 w-5 shrink-0 text-blue-800"
                    strokeWidth={1.75}
                  />
                  <span>Instant confirmation</span>
                </div>
              </div>

              <BookNowLink
                href={peekUrl}
                target="_blank"
                rel="noopener noreferrer"
                contentId={tour.slug}
                contentName={tour.title}
                value={Number.isFinite(adultLeadPriceValue) ? adultLeadPriceValue : undefined}
                currency={currency}
                className="mt-10 flex h-14 w-full items-center justify-center rounded-2xl bg-orange-500 text-base font-semibold text-white shadow-md shadow-orange-500/30 transition hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/35"
              >
                Book Now
              </BookNowLink>
            </div>
          </aside>
        </div>
        <RelatedTours
          locale={activeLocale}
          slug={tour.slug}
          category={categorySlug}
          price={
            Number.isFinite(adultLeadPriceValue) ? adultLeadPriceValue : undefined
          }
        />
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-50 block border-t border-slate-200/80 bg-white/95 shadow-[0_-12px_32px_rgba(15,23,42,0.1)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <p className="min-w-0 truncate text-base font-semibold leading-snug tracking-tight text-blue-950">
            {leadFromFormatted
              ? `From ${leadFromFormatted}`
              : "From -"}
            {tour.priceTag?.trim() ? (
              <span className="ml-1.5 text-sm font-medium text-slate-500">
                ({tour.priceTag.trim()})
              </span>
            ) : null}
          </p>
          <BookNowLink
            href={peekUrl}
            target="_blank"
            rel="noopener noreferrer"
            contentId={tour.slug}
            contentName={tour.title}
            value={Number.isFinite(adultLeadPriceValue) ? adultLeadPriceValue : undefined}
            currency={currency}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white shadow-md shadow-orange-500/30 transition hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/35"
          >
            Book Now
          </BookNowLink>
        </div>
      </div>
    </div>
  );
}
