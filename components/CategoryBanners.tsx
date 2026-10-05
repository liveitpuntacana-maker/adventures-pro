"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categoryExcursionPath } from "@/lib/categoryPath";
import { resolveLocalizedTitle, type LocalizedString } from "@/lib/localizedTitle";
import { urlFor } from "@/sanity/lib/image";
import { type AppLocale } from "@/i18n/routing";

export type CategoryBanner = {
  slug?: string;
  title?: LocalizedString | string;
  mainImage?: unknown;
};

type CategoryBannersProps = {
  categories: CategoryBanner[];
  locale: AppLocale;
};

export default function CategoryBanners({ categories, locale }: CategoryBannersProps) {
  const t = useTranslations("CategoryBanners");

  if (!categories.length) {
    return null;
  }

  return (
    <div key={locale}>
      <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-blue-950 md:mb-12 md:text-4xl">
        {t("sectionTitle")}
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {categories.map((category) => {
          const slug = category.slug ?? "";
          const title = resolveLocalizedTitle(category.title, locale) || "Category";
          const href = slug ? categoryExcursionPath(slug) : "/excursions";
          const imageUrl = (() => {
            try {
              return category.mainImage
                ? urlFor(category.mainImage).width(1200).height(800).fit("crop").url()
                : null;
            } catch {
              return null;
            }
          })();

          return (
            <article
              key={slug || title}
              // Two per row on a phone; an odd last card takes the full row instead of
              // leaving a hole.
              className="group relative min-h-[170px] overflow-hidden rounded-xl shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl max-md:[&:last-child:nth-child(odd)]:col-span-2 md:min-h-[320px]"
            >
              {/* The link wraps the whole banner so tapping the photo works.
                  A stretched pseudo-element cannot be used here: the button's
                  backdrop-blur makes it a containing block, which traps the
                  pseudo inside the button's own box. */}
              <Link href={href} className="absolute inset-0 z-10 block">
                <span className="sr-only">{title}</span>
              </Link>
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
              )}
              <div className="absolute inset-0 bg-black/40 transition duration-300 group-hover:bg-black/50" />
              <div className="pointer-events-none relative flex h-full min-h-[170px] flex-col items-center justify-center gap-3 p-3 text-center md:min-h-[320px] md:gap-5 md:p-8">
                <h3 className="text-balance text-lg font-bold leading-tight tracking-tight text-white md:text-3xl">{title}</h3>
                <span className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs md:min-h-12 md:px-6 md:py-2.5 md:text-sm font-semibold text-white backdrop-blur-sm transition group-hover:border-white group-hover:bg-white group-hover:text-slate-900">
                  {t("exploreTours")}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
