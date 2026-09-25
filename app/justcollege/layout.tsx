import { Geist } from "next/font/google";
import type { Metadata } from "next";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Root layout for one-off partner transfer landing pages (e.g. JusCollege).
 *
 * These are emailed directly to a partner's guests, never linked from the
 * site and never indexed, so they stay out of the localized site shell (no
 * nav, no footer, no chat widget) and always render in light mode regardless
 * of the visitor's system theme.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PartnerLandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} antialiased`}>
      {/*
        Inline styles, not Tailwind classes: globals.css declares `body { }`
        outside any @layer, so it's unlayered CSS and beats any utility class
        in the cascade regardless of specificity. Without this, a visitor's
        dark-mode OS setting flips the page to the site's dark palette and the
        navy text on this page becomes unreadable against it.
      */}
      <body
        className="min-h-screen"
        style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
      >
        {children}
      </body>
    </html>
  );
}
