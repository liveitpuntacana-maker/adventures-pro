import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { RETIRED_POST_SLUGS } from "@/lib/content/retiredPosts";
import { SANITY_TAGS, sanityCache } from "@/lib/sanityCache";
import {
  SITE_CONTACT,
  SITE_NAME,
  SITE_URL,
  blogPathFromSlug,
  categoryPathFromSlug,
  destinationPathFromSlug,
  localizedUrl,
  tourPathFromSlug,
} from "@/lib/seo";

/**
 * /llms.txt — a plain-text map of the site for AI assistants (ChatGPT, Perplexity,
 * Claude and the like), in the format proposed at llmstxt.org.
 *
 * It is built from Sanity, not written by hand, so a new tour or article shows up
 * here by itself and a deleted one disappears. Everything stated comes from the
 * catalogue or from the contact data the footer already prints.
 */
export const revalidate = 3600;

type TourRow = {
  title?: string;
  slug: string;
  category?: string;
  destination?: string;
  currency?: string;
  price?: number | null;
  duration?: string;
};
type ListingRow = { title?: string; slug: string; tourCount: number };
type PostRow = { title?: string; slug: string };

const toursQuery = groq`*[_type == "tour" && defined(slug.current)] | order(title.en asc) {
  "title": title.en,
  "slug": slug.current,
  "category": coalesce(category->title.en, mainTour->category->title.en),
  "destination": coalesce(destination->title.en, mainTour->destination->title.en),
  "currency": coalesce(currency, mainTour->currency, "USD"),
  "price": coalesce(pricing[price > 0][0].price, mainTour->pricing[price > 0][0].price),
  "duration": coalesce(duration.en, mainTour->duration.en)
}`;

const categoriesQuery = groq`*[_type == "category" && defined(slug.current)] | order(title.en asc) {
  "title": title.en,
  "slug": slug.current,
  "tourCount": count(*[_type == "tour" && (
    ^.slug.current in categories[]->slug.current ||
    category->slug.current == ^.slug.current
  )])
}`;

const destinationsQuery = groq`*[_type == "destination" && defined(slug.current)] | order(title.en asc) {
  "title": title.en,
  "slug": slug.current,
  "tourCount": count(*[_type == "tour" && destination->slug.current == ^.slug.current])
}`;

const postsQuery = groq`*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
  "title": title.en,
  "slug": slug.current
}`;

const en = (path: string) => localizedUrl("en", path);

/** CMS text arrives with stray spaces ("4 Hours   ", a trailing space in a title). */
const clean = (value?: string | null) => (value ?? "").replace(/\s+/g, " ").trim();

export async function GET() {
  const [tours, categories, destinations, posts] = await Promise.all([
    client.fetch<TourRow[]>(toursQuery, {}, sanityCache([SANITY_TAGS.tour, SANITY_TAGS.category, SANITY_TAGS.destination])).catch(() => []),
    client.fetch<ListingRow[]>(categoriesQuery, {}, sanityCache([SANITY_TAGS.category, SANITY_TAGS.tour])).catch(() => []),
    client.fetch<ListingRow[]>(destinationsQuery, {}, sanityCache([SANITY_TAGS.destination, SANITY_TAGS.tour])).catch(() => []),
    client.fetch<PostRow[]>(postsQuery, {}, sanityCache([SANITY_TAGS.post])).catch(() => []),
  ]);

  const lines: string[] = [];
  const add = (...rows: string[]) => lines.push(...rows);

  add(
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_NAME} is a destination management company (DMC) in Punta Cana, Dominican Republic. It runs tours and excursions and offers private airport transfers with its own local team, bookable online with hotel pickup. The website is available in English, Spanish and French.`,
    "",
    `- Website: ${SITE_URL}`,
    `- Reservations: ${SITE_CONTACT.email} / ${SITE_CONTACT.telephone}`,
    `- Address: ${SITE_CONTACT.streetAddress}, Punta Cana, Dominican Republic`,
    `- Languages: English (${localizedUrl("en", "/")}), Spanish (${localizedUrl("es", "/")}), French (${localizedUrl("fr-ca", "/")})`,
    "",
    "## Main pages",
    "",
    `- [All excursions](${en("/excursions")}): the full catalogue of tours, with filters by type and price`,
    `- [Airport transfers](${en("/transfers")}): private transfers to and from the airport`,
    `- [Frequently asked questions](${en("/faqs")}): booking, payment, pickup and cancellation`,
    `- [About us](${en("/about")}): who runs the tours`,
    `- [Contact](${en("/contact")})`,
    `- [Blog](${en("/blog")}): travel guides written against the tours we run`,
  );

  const liveDestinations = destinations.filter((d) => d.tourCount > 0);
  if (liveDestinations.length) {
    add("", "## Destinations", "");
    for (const d of liveDestinations) {
      add(`- [${clean(d.title) || d.slug}](${en(destinationPathFromSlug(d.slug))}): ${d.tourCount} ${d.tourCount === 1 ? "tour" : "tours"}`);
    }
  }

  const liveCategories = categories.filter((c) => c.tourCount > 0);
  if (liveCategories.length) {
    add("", "## Tour types", "");
    for (const c of liveCategories) {
      add(`- [${clean(c.title) || c.slug}](${en(categoryPathFromSlug(c.slug))}): ${c.tourCount} ${c.tourCount === 1 ? "tour" : "tours"}`);
    }
  }

  if (tours.length) {
    add("", `## Tours (${tours.length})`, "");
    for (const t of tours) {
      const facts = [
        clean(t.category),
        clean(t.destination),
        clean(t.duration) ? `duration ${clean(t.duration)}` : null,
        t.price ? `from ${t.currency === "USD" || !t.currency ? "US$" : `${t.currency} `}${t.price}` : null,
      ].filter(Boolean);
      add(`- [${clean(t.title) || t.slug}](${en(tourPathFromSlug(t.slug))})${facts.length ? `: ${facts.join(" · ")}` : ""}`);
    }
  }

  const livePosts = posts.filter((p) => !RETIRED_POST_SLUGS.has(p.slug) && p.title);
  if (livePosts.length) {
    add("", "## Blog", "");
    for (const p of livePosts) add(`- [${clean(p.title)}](${en(blogPathFromSlug(p.slug))})`);
  }

  add(
    "",
    "## Notes",
    "",
    "- Prices are the starting (\"from\") price shown on each tour page and can change; the tour page always shows the current price.",
    `- Each page has Spanish and French versions: replace /en/ with /es/ or /fr-ca/ in the address.`,
    `- Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  );

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
