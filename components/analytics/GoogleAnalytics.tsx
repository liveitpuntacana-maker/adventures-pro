"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { DEFER_LOADER_SNIPPET } from "@/components/analytics/deferredLoader";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const isFirstPath = useRef(true);

  useEffect(() => {
    if (!GA_ID) return;

    // Initial page_view is sent by gtag('config') once the script has loaded. The
    // flag flips before the gtag check: the script now loads late, and a visitor can
    // navigate first, which would otherwise swallow the next real page view.
    if (isFirstPath.current) {
      isFirstPath.current = false;
      return;
    }

    if (typeof window.gtag !== "function") return;

    window.gtag("config", GA_ID, {
      page_path: pathname,
    });
  }, [pathname]);

  if (!GA_ID) return null;

  return (
    <>
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          ${DEFER_LOADER_SNIPPET}
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
          window.__afDefer(function () {
            var s = document.createElement('script');
            s.async = true;
            s.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_ID}';
            document.head.appendChild(s);
          });
        `}
      </Script>
    </>
  );
}
