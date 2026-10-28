"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useLocale } from "next-intl";
import { trackMetaEvent } from "@/lib/meta/trackEvent";
import { getWhatsAppBookingUrl } from "@/lib/utils/whatsapp";

type BookNowLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "onClick"
> & {
  href: string;
  contentId: string;
  contentName: string;
  value?: number;
  currency?: string;
  children: ReactNode;
};

export default function BookNowLink({
  href,
  contentId,
  contentName,
  value,
  currency = "USD",
  children,
  ...anchorProps
}: BookNowLinkProps) {
  const locale = useLocale();
  // Tours that Peek cannot schedule are booked over WhatsApp, on every page that shows this button.
  const bookingHref = getWhatsAppBookingUrl(contentId, locale) ?? href;

  const handleClick = () => {
    trackMetaEvent("AddToCart", {
      content_ids: [contentId],
      content_name: contentName,
      content_type: "product",
      ...(Number.isFinite(value) ? { value, currency } : {}),
    });
  };

  return (
    <a href={bookingHref} onClick={handleClick} {...anchorProps}>
      {children}
    </a>
  );
}
