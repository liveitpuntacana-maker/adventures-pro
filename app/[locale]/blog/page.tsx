import Image from "next/image";
import type { Metadata } from "next";
import { groq } from "next-sanity";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import type { AppLocale } from "@/i18n/routing";
import {
  blogPathFromSlug,
  buildBreadcrumbJsonLd,
  buildItemListJsonLd,
  buildPageMetadata,
  toItemListEntries,
} from "@/lib/seo";
import { getDefaultOgImage } from "@/lib/ogImage";
import { REVALIDATE, SANITY_TAGS, sanityCache } from "@/lib/sanityCache";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Seo" });

  return buildPageMetadata({
    locale,
    pathname: "/blog",
    title: t("blog.title"),
    description: t("blog.description"),
    image: await getDefaultOgImage(),
    imageAlt: t("blog.title"),
  });
}

type PostRow = {
  _id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  mainImage?: { asset: unknown };
  publishedAt?: string;
};

const ALL_POSTS_QUERY = groq`*[_type == "post"] | order(coalesce(publishedAt, _createdAt) desc) {
  _id,
  "title": coalesce(select($locale == "fr-ca" => title.frCA, title[$locale]), title.en, title),
  "slug": slug.current,
  mainImage,
  "excerpt": coalesce(select($locale == "fr-ca" => excerpt.frCA, excerpt[$locale]), excerpt.en, excerpt),
  "publishedAt": coalesce(publishedAt, _createdAt)
}`;

type BlogIndexPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

function formatPostDate(dateValue: string | undefined, locale: AppLocale): string | null {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  const localeTag = locale === "es" ? "es" : locale === "fr-ca" ? "fr-CA" : "en-US";
  return date.toLocaleDateString(localeTag, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogIndexPage({ params }: BlogIndexPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const tSeo = await getTranslations({ locale, namespace: "Seo" });
  const posts = await client
    .fetch<PostRow[]>(
      ALL_POSTS_QUERY,
      { locale },
      sanityCache([SANITY_TAGS.post], REVALIDATE.blog),
    )
    .catch(() => []);

  const jsonLd = [
    buildBreadcrumbJsonLd(locale, [
      { name: tSeo("breadcrumbHome"), path: "/" },
      { name: tSeo("breadcrumbBlog") },
    ]),
    buildItemListJsonLd(
      locale,
      tSeo("blog.title"),
      toItemListEntries(posts, blogPathFromSlug),
    ),
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <JsonLd data={jsonLd} />
      <main className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20 lg:px-12">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[#0a192f] md:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            {t("subtitle")}
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="mt-16 text-center text-lg text-slate-600">{t("empty")}</p>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
            {posts.map((post) => {
              const slug = post.slug ?? "";
              const href = slug ? `/blog/${slug}` : "/blog";
              const title = post.title?.trim() || "Untitled";
              const excerpt = post.excerpt?.trim();
              const dateLabel = formatPostDate(post.publishedAt, locale);
              const imageUrl = (() => {
                try {
                  return post.mainImage?.asset
                    ? urlFor(post.mainImage).width(800).height(450).fit("crop").url()
                    : null;
                } catch {
                  return null;
                }
              })();

              return (
                <Link
                  key={post._id}
                  href={href}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(15,23,42,0.12)]"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5 md:p-6">
                    {dateLabel ? (
                      <time className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {dateLabel}
                      </time>
                    ) : null}
                    <h2 className="text-lg font-semibold leading-snug tracking-tight text-[#0a192f] group-hover:underline md:text-xl">
                      {title}
                    </h2>
                    {excerpt ? (
                      <p className="line-clamp-3 text-sm leading-relaxed text-slate-600 md:text-[15px]">
                        {excerpt}
                      </p>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
