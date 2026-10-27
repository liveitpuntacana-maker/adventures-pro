"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackMetaEvent } from "@/lib/meta/trackEvent";

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
  const handleClick = () => {
    trackMetaEvent("AddToCart", {
      content_ids: [contentId],
      content_name: contentName,
      content_type: "product",
      ...(Number.isFinite(value) ? { value, currency } : {}),
    });
  };

  return (
    <a href={href} onClick={handleClick} {...anchorProps}>
      {children}
    </a>
  );
}
