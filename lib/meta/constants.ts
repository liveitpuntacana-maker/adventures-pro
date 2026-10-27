export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "985167590608761";

export const META_GRAPH_API_VERSION = "v21.0";

export type MetaStandardEvent =
  | "PageView"
  | "ViewContent"
  | "Contact"
  // "Book Now" click. The checkout itself happens on Peek, whose pixel sends
  // InitiateCheckout and the purchase; using the same name here counted one
  // visitor twice in the same pixel.
  | "AddToCart";
