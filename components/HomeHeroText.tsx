"use client";

import { useTranslations } from "next-intl";

/** SEO hero copy from i18n only (locale from route via next-intl). */
export default function HomeHeroText() {
  const t = useTranslations("Home");

  return (
    <h1 className="text-balance text-2xl font-semibold leading-tight tracking-tight drop-shadow-sm sm:text-4xl md:text-5xl">
      {t("defaultTitle")}
    </h1>
  );
}
