import type { MetaStandardEvent } from "@/lib/meta/constants";

type TourItem = {
  item_id?: string;
  item_name?: string;
};

function getTourItem(customData?: Record<string, unknown>): TourItem | undefined {
  const contentIds = customData?.content_ids;
  const itemId = Array.isArray(contentIds) ? String(contentIds[0] ?? "") : undefined;
  const itemName =
    typeof customData?.content_name === "string" ? customData.content_name : undefined;

  if (!itemId && !itemName) return undefined;

  return {
    ...(itemId ? { item_id: itemId } : {}),
    ...(itemName ? { item_name: itemName } : {}),
  };
}

function getValueParams(customData?: Record<string, unknown>) {
  const value = customData?.value;
  const currency = typeof customData?.currency === "string" ? customData.currency : "USD";

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return {};
  }

  return { value, currency };
}

export function trackGa4CompanionEvent(
  metaEventName: MetaStandardEvent,
  customData?: Record<string, unknown>,
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  switch (metaEventName) {
    case "ViewContent": {
      const item = getTourItem(customData);
      window.gtag("event", "view_item", {
        ...getValueParams(customData),
        ...(item?.item_id ? { item_id: item.item_id } : {}),
        ...(item?.item_name ? { item_name: item.item_name } : {}),
        ...(item ? { items: [item] } : {}),
      });
      break;
    }
    case "Contact":
      window.gtag("event", "generate_lead", {
        method:
          typeof customData?.content_name === "string"
            ? customData.content_name
            : "contact",
      });
      break;
    case "AddToCart": {
      const item = getTourItem(customData);
      window.gtag("event", "add_to_cart", {
        ...getValueParams(customData),
        ...(item ? { items: [item] } : {}),
      });
      break;
    }
    default:
      break;
  }
}
