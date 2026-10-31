"use client";

import { useTranslations } from "next-intl";

/** SEO hero copy from i18n only (locale from route via next-intl). */
export default function HomeHeroText() {
  const t = useTranslations("Home");

  return (
    <h1 className="text-balance text-[1.75rem] font-semibold leading-[1.15] tracking-tight [text-shadow:0_2px_16px_rgba(0,0,0,0.5)] sm:text-4xl md:text-5xl lg:text-6xl">
      {t("defaultTitle")}
    </h1>
  );
}
