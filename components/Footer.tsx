"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TrackedWhatsAppLink from "@/components/meta/TrackedWhatsAppLink";
import WeatherWidget from "@/components/WeatherWidget";
import {
  ADVENTURES_WHATSAPP_PHONE,
  getUniversalWhatsAppUrl,
} from "@/lib/utils/whatsapp";

const FOOTER_WHATSAPP_URL = getUniversalWhatsAppUrl(
  ADVENTURES_WHATSAPP_PHONE,
  "Hola, deseo información sobre una excursión o traslado",
);

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="w-full border-t border-white/10 bg-zinc-950 text-gray-400">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 text-center md:grid-cols-2 md:gap-12 md:px-10 md:text-left lg:grid-cols-4 lg:gap-14 lg:px-12">
        <div className="space-y-4">
          <Image
            src="/images/logo-v3.png"
            alt="Adventures Finder"
            width={247}
            height={83}
            className="mx-auto h-[73px] w-auto brightness-0 invert md:mx-0"
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
            {t("helpfulLinks")}
          </h3>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link href="/terms-and-conditions" className="transition hover:text-white">
              {t("terms")}
            </Link>
            <Link href="/cancellation-policy" className="transition hover:text-white">
              {t("cancellation")}
            </Link>
            <Link href="/faqs" className="transition hover:text-white">
              {t("faq")}
            </Link>
          </div>
          <div className="mt-4 flex justify-center md:hidden">
            <WeatherWidget compact />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
            {t("contactUs")}
          </h3>
          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            <p>Plaza Cueva Taina, Local #B2, Av. Estados Unidos - Bavaro, Dominican Republic</p>
            <a href="tel:+18495700202" className="block transition hover:text-white">
              +1 849 570 0202
            </a>
            <a
              href="mailto:reservations@adventuresfinder.com"
              className="block transition hover:text-white"
            >
              reservations@adventuresfinder.com
            </a>
            <TrackedWhatsAppLink
              href={FOOTER_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              source="footer_whatsapp"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 md:justify-start"
              aria-label="WhatsApp"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 32 32"
                className="h-5 w-5 fill-current"
              >
                <path d="M19.11 17.39c-.27-.14-1.6-.79-1.85-.88-.25-.09-.44-.14-.63.14-.18.27-.72.88-.88 1.06-.16.18-.32.2-.59.07-.27-.14-1.16-.43-2.2-1.38-.81-.72-1.35-1.61-1.51-1.88-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.46.09-.18.05-.34-.02-.48-.07-.14-.63-1.52-.87-2.08-.23-.55-.46-.47-.63-.47h-.54c-.18 0-.48.07-.73.34s-.96.93-.96 2.27.98 2.65 1.11 2.84c.14.18 1.92 2.93 4.66 4.11.65.28 1.16.45 1.56.57.66.21 1.26.18 1.73.11.53-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.06-.11-.25-.18-.52-.32Z" />
                <path d="M16 3C8.83 3 3 8.74 3 15.81c0 2.48.72 4.89 2.09 6.96L3 29l6.38-2.02a13.1 13.1 0 0 0 6.62 1.8h.01C23.17 28.78 29 23.04 29 15.97 29 8.9 23.17 3 16 3Zm0 23.56h-.01a10.85 10.85 0 0 1-5.53-1.51l-.4-.24-3.79 1.2 1.24-3.68-.26-.42a10.67 10.67 0 0 1-1.64-5.63C5.61 10.48 10.26 6 16 6c5.74 0 10.39 4.48 10.39 10 0 5.51-4.65 10-10.39 10Z" />
              </svg>
              <span>{t("whatsapp")}</span>
            </TrackedWhatsAppLink>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
            {t("followUs")}
          </h3>
          <div className="mt-4 flex items-center justify-center gap-4 md:justify-start">
            <a
              href="https://www.facebook.com/adventurefinder1/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center border border-white/20 text-gray-300 transition hover:text-white"
              aria-label="Facebook"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 text-white transition-opacity hover:opacity-80"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M22 12.07C22 6.5 17.52 2 12 2S2 6.5 2 12.07C2 17.1 5.66 21.27 10.44 22v-7.05H7.9v-2.88h2.54V9.86c0-2.52 1.49-3.92 3.78-3.92 1.1 0 2.25.2 2.25.2v2.47h-1.27c-1.25 0-1.64.78-1.64 1.58v1.88h2.8l-.45 2.88h-2.35V22A10.03 10.03 0 0 0 22 12.07Z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/adventuresfinder1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center border border-white/20 text-gray-300 transition hover:text-white"
              aria-label="Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 text-white transition-opacity hover:opacity-80"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.95 1.35a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@adventuresfinder"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center border border-white/20 text-gray-300 transition hover:text-white"
              aria-label="YouTube"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 text-white transition-opacity hover:opacity-80"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4">
        <p className="text-center text-sm text-gray-400">
          {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
