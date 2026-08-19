import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { groq } from "next-sanity";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { routing, type AppLocale } from "@/i18n/routing";
import {
  blogPathFromSlug,
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  truncateMetaDescription,
} from "@/lib/seo";
import BlogRelatedTours from "@/components/blog/BlogRelatedTours";
import { postSeoOverride } from "@/lib/content/postSeo";
import { linkifyBody, type BodyLink } from "@/lib/content/linkifyBody";
import { conceptPhrases, postLinks } from "@/lib/content/postTourLinks";
import { tourExcursionPath } from "@/lib/tourSlug";
import { getDefaultOgImage, sanityOgImage } from "@/lib/ogImage";
import { REVALIDATE, SANITY_TAGS, sanityCache } from "@/lib/sanityCache";

export const revalidate = 86400;
export const dynamicParams = true;

type BlogPostPageProps = {
  params: Promise<{ locale: AppLocale; slug: string }>;
};

type PostDoc = {
  title?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  excerpt?: string | null;
  mainImage?: { asset: unknown };
  publishedAt?: string;
  updatedAt?: string;
  body?: string | null;
  hasEn?: boolean;
  hasEs?: boolean;
  hasFr?: boolean;
};

const POST_QUERY = groq`*[_type == "post" && slug.current == $slug][0]{
  "title": coalesce(select($locale == "fr-ca" => title.frCA, title[$locale]), title.en, title.es, title.frCA),
  "seoTitle": select($locale == "fr-ca" => seoTitle.frCA, seoTitle[$locale]),
  "seoDescription": select($locale == "fr-ca" => seoDescription.frCA, seoDescription[$locale]),
  "excerpt": coalesce(select($locale == "fr-ca" => excerpt.frCA, excerpt[$locale]), excerpt.en, excerpt.es, excerpt.frCA),
  "body": coalesce(select($locale == "fr-ca" => body.frCA, body[$locale]), body.en, body.es, body.frCA),
  mainImage,
  publishedAt,
  "updatedAt": _updatedAt,
  "hasEn": defined(title.en),
  "hasEs": defined(title.es),
  "hasFr": defined(title.frCA)
}`;

export async function generateStaticParams() {
  const posts = await client.fetch<Array<{ slug: string }>>(
    groq`*[_type == "post" && defined(slug.current)]{ "slug": slug.current }`,
  );

  // Default locale only at build time; other locales come from ISR on demand.
  return (posts ?? []).map((post) => ({
    locale: routing.defaultLocale,
    slug: post.slug,
  }));
}

async function fetchPost(locale: AppLocale, slug: string) {
  return client
    .fetch<PostDoc | null>(
      POST_QUERY,
      { slug, locale },
      sanityCache([SANITY_TAGS.post], REVALIDATE.blog),
    )
    .catch(() => null);
}

/**
 * Locales this post is genuinely translated into.
 *
 * Posts arrive from the Soro feed in one language; claiming a translation that
 * doesn't exist would make Google treat the three locale URLs as duplicates.
 */
function translatedLocales(post: PostDoc): AppLocale[] {
  const locales: AppLocale[] = [];
  if (post.hasEn) locales.push("en");
  if (post.hasEs) locales.push("es");
  if (post.hasFr) locales.push("fr-ca");
  return locales.length > 0 ? locales : ["en"];
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await fetchPost(locale, slug);

  if (!post?.title?.trim()) return {};

  const t = await getTranslations({ locale, namespace: "Seo" });
  const title = post.title.trim();
  const available = translatedLocales(post);

  // The SERP title answers the query; the H1 below stays as the editor wrote
  // it. Sanity beats the seeded override, which beats the article headline.
  const override = postSeoOverride(slug, locale);
  const seoTitle = post.seoTitle?.trim() || override?.title || title;

  const description = truncateMetaDescription(
    post.seoDescription?.trim() ||
      override?.description ||
      post.excerpt?.trim() ||
      post.body?.trim().replace(/\s+/g, " ") ||
      t("blog.description"),
  );

  return buildPageMetadata({
    locale,
    pathname: blogPathFromSlug(slug),
    title: seoTitle,
    description,
    image: sanityOgImage(post.mainImage) ?? (await getDefaultOgImage()),
    imageAlt: title,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    availableLocales: available,
    // Untranslated locale variants stay crawlable for readers but out of the
    // index, so the three URLs never compete as duplicates.
    noIndex: !available.includes(locale),
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const tSeo = await getTranslations({ locale, namespace: "Seo" });

  const post = await fetchPost(locale, slug);

  if (!post || !post.title?.trim()) {
    notFound();
  }

  const imageUrl = post.mainImage
    ? (() => {
        try {
          return urlFor(post.mainImage).width(1600).height(900).fit("crop").url();
        } catch {
          return null;
        }
      })()
    : null;

  const dateLabel = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(
        locale === "es" ? "es" : locale === "fr-ca" ? "fr-CA" : "en-US",
        { year: "numeric", month: "long", day: "numeric" },
      )
    : null;

  const title = post.title.trim();
  const excerpt = post.excerpt?.trim();
  const bodyParagraphs = (post.body ?? "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Curated catalogue links for this article: the ones carrying a concept are
  // woven into the prose, all of them feed the grid at the foot of the page.
  const links = postLinks(slug);
  const bodyLinks: BodyLink[] = links.flatMap((link) => {
    if (!link.concept) return [];
    const phrases = conceptPhrases(link.concept, locale);
    if (phrases.length === 0) return [];
    const href = link.tour ? tourExcursionPath(link.tour) : link.listing;
    return href ? [{ phrases, href }] : [];
  });
  const paragraphs = linkifyBody(bodyParagraphs, bodyLinks);
  const relatedTourSlugs = links.flatMap((link) => (link.tour ? [link.tour] : []));

  const jsonLd = [
    buildBlogPostingJsonLd({
      locale,
      pathname: blogPathFromSlug(slug),
      title,
      description: excerpt || bodyParagraphs[0] || null,
      image: sanityOgImage(post.mainImage),
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      body: post.body,
    }),
    buildBreadcrumbJsonLd(locale, [
      { name: tSeo("breadcrumbHome"), path: "/" },
      { name: tSeo("breadcrumbBlog"), path: "/blog" },
      { name: title },
    ]),
  ];

  return (
    <article className="min-h-screen bg-white text-slate-900">
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-2xl px-6 py-12 md:px-8 md:py-16 lg:max-w-3xl">
        <Link
          href="/blog"
          className="text-sm font-medium text-slate-500 transition hover:text-blue-950"
        >
          ← Blog
        </Link>

        {imageUrl ? (
          <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        ) : null}

        <header className="mt-10">
          <h1 className="text-3xl font-semibold tracking-tight text-blue-950 md:text-4xl">{title}</h1>
          {post.publishedAt ? (
            <p className="mt-3 text-sm text-slate-500">
              <time dateTime={new Date(post.publishedAt).toISOString()}>
                {dateLabel}
              </time>
            </p>
          ) : null}
        </header>

        {excerpt ? (
          <p className="mt-6 text-lg leading-relaxed text-slate-700">{excerpt}</p>
        ) : null}

        {bodyParagraphs.length > 0 ? (
          <div className="mt-12 max-w-none space-y-5 border-t border-slate-100 pt-12 text-[15px] leading-relaxed text-slate-700 md:text-base">
            {paragraphs.map((segments, index) => (
              <p key={index} className="whitespace-pre-wrap">
                {segments.map((segment, segmentIndex) =>
                  segment.href ? (
                    <Link
                      key={segmentIndex}
                      href={segment.href}
                      className="font-medium text-blue-900 underline decoration-blue-900/30 underline-offset-2 transition hover:decoration-blue-900"
                    >
                      {segment.text}
                    </Link>
                  ) : (
                    segment.text
                  ),
                )}
              </p>
            ))}
          </div>
        ) : null}

        <BlogRelatedTours locale={locale} slugs={relatedTourSlugs} />

        <div className="mt-12 flex justify-center border-t border-slate-100 pt-12">
          <Link
            href="/excursions"
            className="inline-flex min-h-14 w-full max-w-xl items-center justify-center rounded-2xl bg-orange-500 px-8 py-4 text-center text-base font-semibold text-white shadow-md shadow-orange-500/30 transition hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/35 md:text-lg"
          >
            {t("excursionsCta")}
          </Link>
        </div>
      </div>
    </article>
  );
}
