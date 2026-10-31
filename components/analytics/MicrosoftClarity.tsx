"use client";

import Script from "next/script";
import { DEFER_LOADER_SNIPPET } from "@/components/analytics/deferredLoader";

// A project id only names the project in the page source; it is not a secret.
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "wc4ix6ri6d";

/**
 * Microsoft Clarity: session recordings and heatmaps.
 *
 * Production only, so local development never records into the live project.
 * Loaded through the same deferred loader as Analytics and the Meta Pixel (first
 * scroll, tap or key press, or after four seconds). The chat and the forms carry
 * `data-clarity-mask="True"`, so what visitors type there is never recorded.
 */
export default function MicrosoftClarity() {
  if (process.env.NODE_ENV !== "production" || !CLARITY_ID) return null;

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        ${DEFER_LOADER_SNIPPET}
        window.__afDefer(function () {
          (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
            t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
            y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
          })(window, document, "clarity", "script", "${CLARITY_ID}");
        });
      `}
    </Script>
  );
}
