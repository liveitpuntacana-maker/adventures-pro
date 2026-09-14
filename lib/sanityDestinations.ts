import { groq } from "next-sanity";

export const mapDestinationsQuery = groq`*[_type == "destination"] | order(coalesce(title.en, title.es, title.frCA) asc) {
  "slug": slug.current,
  "title": coalesce(
    select($locale == "fr-ca" => title.frCA, title[$locale]),
    title.en,
    title.es,
    title.frCA
  ),
  "tourCount": count(*[_type == "tour" && destination->slug.current == ^.slug.current])
}`;

export type MapDestination = {
  slug: string;
  title: string;
  tourCount: number;
};

/**
 * Destinations for the main menu.
 *
 * Only ones with at least one tour: a destination with nothing to show is a
 * dead end for a visitor, and it starts appearing on its own the moment a
 * tour is assigned to it. Punta Cana and Bayahibe/La Romana lead deliberately
 * — they carry the most tours by a wide margin — the rest follow
 * alphabetically.
 */
export const navDestinationsQuery = groq`*[
  _type == "destination" &&
  count(*[_type == "tour" && destination->slug.current == ^.slug.current]) > 0
] {
  "slug": slug.current,
  "title": coalesce(
    select($locale == "fr-ca" => title.frCA, title[$locale]),
    title.en,
    title.es,
    title.frCA
  ),
  "order": select(
    slug.current == "punta-cana" => 0,
    slug.current == "bayahibe-la-romana" => 1,
    2
  )
} | order(order asc, title asc)`;

export type NavDestination = {
  slug: string;
  title: string;
};
