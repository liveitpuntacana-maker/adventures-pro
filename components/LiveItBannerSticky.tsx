"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const LIVE_IT_URL = "https://liveitpuntacana.com/";

/**
 * Phone only. On desktop the banner sat over the middle of the page and blocked
 * the content, so it is hidden from md up. On a phone it sits at the bottom edge
 * and steps out of the way while the visitor scrolls down.
 */
export default function LiveItBannerSticky() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;
      lastScrollY = currentScrollY;

      setHidden(scrollingDown && currentScrollY > 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-4 left-1/2 z-50 w-[95%] max-w-5xl -translate-x-1/2 shadow-2xl transition-all duration-300 ease-in-out md:hidden ${
        hidden
          ? "pointer-events-none translate-y-[150%] opacity-0"
          : "translate-y-0 opacity-100"
      }`}
    >
      <a
        href={LIVE_IT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-2xl transition-transform duration-300 hover:scale-[1.01] hover:shadow-xl"
      >
        <Image
          src="/images/live-it-banner-2026.webp"
          alt="Live It App - Golf, Tours, Transfers - Download on Google Play and App Store"
          width={1600}
          height={600}
          className="h-auto w-full rounded-2xl object-cover"
        />
      </a>
    </div>
  );
}
