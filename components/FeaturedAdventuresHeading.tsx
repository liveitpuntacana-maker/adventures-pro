"use client";

import { useTranslations } from "next-intl";

export default function FeaturedAdventuresHeading() {
  const t = useTranslations("Featured");

  return (
    <div className="mx-auto mb-8 max-w-3xl text-center md:mb-12">
      <h2 className="text-3xl font-semibold leading-tight tracking-tight text-blue-950 md:text-4xl md:leading-tight">
        {t("title")}
      </h2>
    </div>
  );
}
