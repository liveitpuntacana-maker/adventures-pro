"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

const LIVE_IT_URL = "https://liveitpuntacana.com/";

/** How long the banner stays on screen before stepping out of the way. */
const IDLE_HIDE_MS = 4000;

export default function LiveItBannerSticky() {
  const [hidden, setHidden] = useState(false);
  const idleTimer = useRef<number | null>(null);
  const isDesktop = useRef(false);

  const clearIdleTimer = useCallback(() => {
    if (idleTimer.current !== null) {
      window.clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
  }, []);

  /**
   * On desktop the banner sits over the middle of the page, so leaving it up
   * while the visitor reads blocks the content. It retires on its own and
   * comes back the next time they scroll up. On mobile it sits at the bottom
   * edge and blocks nothing, so it stays put.
   */
  const scheduleIdleHide = useCallback(() => {
    clearIdleTimer();
    if (!isDesktop.current) return;
    idleTimer.current = window.setTimeout(() => setHidden(true), IDLE_HIDE_MS);
  }, [clearIdleTimer]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    isDesktop.current = desktopQuery.matches;

    const handleBreakpointChange = (event: MediaQueryListEvent) => {
      isDesktop.current = event.matches;
      if (!event.matches) {
        clearIdleTimer();
        setHidden(false);
      } else {
        scheduleIdleHide();
      }
    };

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;
      lastScrollY = currentScrollY;

      if (scrollingDown && currentScrollY > 80) {
        clearIdleTimer();
        setHidden(true);
        return;
      }

      setHidden(false);
      scheduleIdleHide();
    };

    scheduleIdleHide();
    window.addEventListener("scroll", handleScroll, { passive: true });
    desktopQuery.addEventListener("change", handleBreakpointChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      desktopQuery.removeEventListener("change", handleBreakpointChange);
      clearIdleTimer();
    };
  }, [clearIdleTimer, scheduleIdleHide]);

  return (
    <div
      // Hovering means they are about to click: hold it open until they leave.
      onMouseEnter={clearIdleTimer}
      onMouseLeave={scheduleIdleHide}
      className={`fixed bottom-4 left-1/2 z-50 w-[95%] max-w-5xl -translate-x-1/2 shadow-2xl transition-all duration-300 ease-in-out md:max-w-2xl ${
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
          src="/images/live-it-banner-2026.jpg"
          alt="Live It App - Golf, Tours, Transfers - Download on Google Play and App Store"
          width={1600}
          height={600}
          className="h-auto w-full rounded-2xl object-cover"
        />
      </a>
    </div>
  );
}
