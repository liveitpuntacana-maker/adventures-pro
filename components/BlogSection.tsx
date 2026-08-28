import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { REVALIDATE, SANITY_TAGS, sanityCache } from "@/lib/sanityCache";
import { urlFor } from "@/sanity/lib/image";
import BlogSectionIntro from "@/components/BlogSectionIntro";
import BlogSectionEmpty from "@/components/BlogSectionEmpty";
import BlogSectionViewAll from "@/components/BlogSectionViewAll";
import type { AppLocale } from "@/i18n/routing";

type BlogPostPreview = {
  _id: string;
  title?: string;
  slug?: string;
  mainImage?: { asset: unknown };
  excerpt?: string;
};

const BLOG_PREVIEW_QUERY = groq`*[_type == "post"] | order(publishedAt desc) [0...3] {
  _id,
  "title": coalesce(select($locale == "fr-ca" => title.frCA, title[$locale]), title.en, title),
  "slug": slug.current,
  mainImage,
  "excerpt": coalesce(select($locale == "fr-ca" => excerpt.frCA, excerpt[$locale]), excerpt.en, excerpt)
}`;

type BlogSectionProps = {
  locale: AppLocale;
};

export default async function BlogSection({ locale }: BlogSectionProps) {
  const posts = await client
    .fetch<BlogPostPreview[]>(
      BLOG_PREVIEW_QUERY,
      { locale },
      sanityCache([SANITY_TAGS.post], REVALIDATE.blog),
    )
    .catch(() => []);

  return (
    <section className="w-full bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-12">
        <BlogSectionIntro />

        {posts.length === 0 ? (
          <BlogSectionEmpty />
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
            {posts.map((post) => {
              const slug = post.slug ?? "";
              const href = slug ? `/blog/${slug}` : "/blog";
              const title = post.title ?? "Untitled";
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
                  className="group flex flex-col overflow-hidden border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(15,23,42,0.12)]"
                >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5 md:p-6">
                  <h3 className="text-lg font-semibold leading-snug tracking-tight text-blue-950 group-hover:underline md:text-xl">
                    {title}
                  </h3>
                  {post.excerpt ? (
                    <p className="line-clamp-3 text-sm leading-relaxed text-slate-600 md:text-[15px]">
                      {post.excerpt}
                    </p>
                  ) : null}
                </div>
                </Link>
              );
            })}
          </div>
        )}

        <BlogSectionViewAll />
      </div>
    </section>
  );
}
