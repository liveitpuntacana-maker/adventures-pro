import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import MetaPixel from "@/components/meta/MetaPixel";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import SiteWideAIChatLazy from "@/components/chat/SiteWideAIChatLazy";
import { routing, type AppLocale } from "@/i18n/routing";
import {
  buildTravelAgencyJsonLd,
  buildWebSiteJsonLd,
  htmlLangForLocale,
  SITE_URL,
} from "@/lib/seo";
import { client } from "@/sanity/lib/client";
import { navCategoriesQuery, type NavCategory } from "@/lib/sanityCategories";
import { navDestinationsQuery, type NavDestination } from "@/lib/sanityDestinations";
import { SANITY_TAGS, sanityCache } from "@/lib/sanityCache";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Site-wide defaults only. Canonical and hreflang live on each page, built from
 * that page's own params — reading them from a request header here would force
 * every route to render dynamically.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: "Seo" });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("defaultTitle"),
      template: "%s | Adventures Finder",
    },
    description: t("home.description"),
    icons: {
      icon: [{ url: "/images/icon.png", type: "image/png", sizes: "512x512" }],
      shortcut: "/images/icon.png",
      apple: [{ url: "/images/icon.png", type: "image/png", sizes: "512x512" }],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const [categories, destinations] = await Promise.all([
    client
      .fetch<NavCategory[]>(
        navCategoriesQuery,
        { locale },
        sanityCache([SANITY_TAGS.category]),
      )
      .catch(() => []),
    client
      .fetch<NavDestination[]>(
        navDestinationsQuery,
        { locale },
        // A tour is what makes a destination worth linking, so the menu must
        // also refresh when a tour's own destination changes.
        sanityCache([SANITY_TAGS.destination, SANITY_TAGS.tour]),
      )
      .catch(() => []),
  ]);

  return (
    <html
      lang={htmlLangForLocale(locale)}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics />
        <MetaPixel />
        <JsonLd
          data={[
            buildTravelAgencyJsonLd(),
            buildWebSiteJsonLd(locale as AppLocale),
          ]}
        />
        <NextIntlClientProvider messages={messages}>
          <Navbar categories={categories} destinations={destinations} />
          {children}
          <Footer />
          <SiteWideAIChatLazy locale={locale as AppLocale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
