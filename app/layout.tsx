import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import MetaPixel from "@/components/meta/MetaPixel";
import { htmlLangForLocale, SITE_URL } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Adventures Finder",
  description: "Directory for tours and adventures",
  icons: {
    icon: [{ url: "/images/icon.png", type: "image/png", sizes: "512x512" }],
    shortcut: "/images/icon.png",
    apple: [{ url: "/images/icon.png", type: "image/png", sizes: "512x512" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const localeHeader = headersList.get("x-locale") ?? "en";
  const lang = htmlLangForLocale(localeHeader);

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics />
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
