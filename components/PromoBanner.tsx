"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const CODE = "BOOK2SAVE10";

export default function PromoBanner() {
  const t = useTranslations("PromoBanner");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="w-full bg-blue-950 py-6 md:py-10">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 md:gap-8 md:px-8">
        <h2 className="max-w-3xl text-balance text-center font-sans text-lg font-extrabold uppercase leading-snug tracking-wide text-white sm:text-xl md:text-2xl lg:text-3xl">
          {t("headline")}
        </h2>
        <div className="flex w-full max-w-lg flex-row items-center gap-2 sm:max-w-none sm:justify-center sm:gap-4">
          <div className="flex min-h-11 min-w-0 flex-1 items-center justify-center rounded-lg border-2 border-dashed border-orange-400/80 bg-white px-3 py-2 shadow-sm sm:max-w-md sm:px-8 sm:py-4">
            <span className="font-mono text-sm font-bold tracking-[0.12em] text-slate-900 sm:tracking-[0.2em] sm:text-lg md:text-xl">
              {CODE}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="min-h-11 shrink-0 rounded-lg border border-white/25 bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600 sm:py-3.5 sm:text-base"
          >
            {copied ? t("copied") : t("copyCode")}
          </button>
        </div>
      </div>
    </div>
  );
}
