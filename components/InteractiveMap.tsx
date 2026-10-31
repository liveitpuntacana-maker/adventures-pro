import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { destinationExcursionPath } from "@/lib/destinationPath";
import { type MapDestination } from "@/lib/sanityDestinations";
import { urlFor } from "@/sanity/lib/image";

const mapPositions: Record<string, { top: number; left: number }> = {
  "puerto-plata": { top: 16, left: 41 },
  samana: { top: 35, left: 68 },
  miches: { top: 48, left: 76 },
  "punta-cana": { top: 60, left: 86 },
  "bayahibe-la-romana": { top: 65, left: 73 },
  "juan-dolio": { top: 68, left: 58 },
  "santo-domingo": { top: 75, left: 48 },
};

// The five pins are close together on a phone-sized map and labels under every
// pin ended up covering the neighbouring pins. Below md a few labels move: Punta
// Cana above its pin (nudged right), Sámana and Miches to the left of theirs.
// From md up every label stays under its pin, exactly as before.
const mobileLabelPlacement: Record<string, string> = {
  "punta-cana": "max-md:-translate-y-[45px] max-md:translate-x-2.5",
  samana: "max-md:-translate-x-[39px] max-md:-translate-y-6",
  miches: "max-md:-translate-x-[37px] max-md:-translate-y-6",
};

/**
 * "Bayahibe / La Romana" is twice as wide as every other label and, on a phone,
 * ran into its neighbours and sat off-centre from its pin. Below md it stacks on
 * two lines, so it stays centred under the pin; from md up it is one line.
 */
function MapLabel({ title }: { title: string }) {
  const parts = title.split(" / ");
  if (parts.length !== 2) return <>{title}</>;
  return (
    <>
      {parts[0]} /<br className="md:hidden" />
      <span className="max-md:hidden"> </span>
      {parts[1]}
    </>
  );
}

/**
 * Crop of a destination photo, honouring the hotspot set in Sanity. Portrait for
 * the cards; landscape for the lead card on a phone, where it spans the full
 * width. Cropping the portrait down to a wide strip kept only sand and water.
 */
function destinationImageUrl(image: unknown, landscape = false): string | null {
  if (!image) return null;
  try {
    const crop = landscape ? urlFor(image).width(1200).height(675) : urlFor(image).width(800).height(1000);
    return crop.fit("crop").url();
  } catch {
    return null;
  }
}

type InteractiveMapProps = {
  destinations?: MapDestination[];
};

type PinnedDestination = MapDestination & { top: number; left: number };

export default function InteractiveMap({ destinations = [] }: InteractiveMapProps) {
  const t = useTranslations("InteractiveMap");

  // A destination with no tours is kept in Sanity but left off the map and the
  // buttons: it is a dead end for a visitor. It shows up by itself the moment
  // a tour is assigned to it, because the tour count comes from the query.
  const available = destinations
    .filter((destination) => destination.tourCount > 0)
    // Biggest first, so Punta Cana leads the buttons on a phone.
    .sort((a, b) => b.tourCount - a.tourCount);

  const pinnedDestinations = available
    .map((destination) => {
      const position = mapPositions[destination.slug];
      return position ? { ...destination, ...position } : null;
    })
    .filter((item): item is PinnedDestination => item !== null);

  if (available.length === 0) return null;

  return (
    <section className="w-full">
      <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-900/70">
          {t("kicker")}
        </p>
        <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-blue-950 md:text-4xl md:leading-tight">
          {t("headline")}
        </h2>
      </div>
      {/* Every destination gets a card with a photo of the zone, first thing under
          the heading, so a visitor can pick a zone before looking at the map. The
          biggest zone leads and spans the full width on a phone, so the rest pair
          up evenly. */}
      <nav
        aria-label={t("destinationsNav")}
        className="mx-auto flex max-w-5xl flex-wrap items-stretch justify-center gap-3"
      >
        {available.map((destination, index) => {
          const imageUrl = destinationImageUrl(destination.mainImage);
          // Only the lead card changes shape (full width below md).
          const wideUrl = index === 0 ? destinationImageUrl(destination.mainImage, true) : null;
          return (
            <Link
              key={destination.slug}
              href={destinationExcursionPath(destination.slug)}
              className="group relative isolate block aspect-[4/5] w-[calc(50%-0.375rem)] overflow-hidden rounded-2xl bg-slate-800 shadow-md transition hover:-translate-y-1 hover:shadow-xl max-md:first:aspect-[16/9] max-md:first:w-full md:w-[calc(33.333%-0.5rem)] lg:w-[calc(20%-0.6rem)]"
            >
              {wideUrl ? (
                <Image
                  src={wideUrl}
                  alt=""
                  fill
                  className="object-cover object-center transition duration-500 group-hover:scale-105 md:hidden"
                  sizes="100vw"
                />
              ) : null}
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  className={`object-cover object-center transition duration-500 group-hover:scale-105 ${wideUrl ? "max-md:hidden" : ""}`}
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 200px"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-3 text-left text-base font-semibold leading-tight text-white drop-shadow md:p-4 md:text-lg">
                {destination.title}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="relative mx-auto mt-8 aspect-[16/9] h-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-blue-950 shadow-lg">
        <Image
          src="/images/dr-map.webp"
          alt={t("mapAlt")}
          fill
          className="object-contain object-center"
          sizes="(max-width: 768px) 100vw, 1024px"
        />
        {pinnedDestinations.map((destination) => (
          // A real link, not a button that navigates: Google does not press
          // buttons, and the destination pages were getting no internal links.
          <Link
            key={destination.slug}
            href={destinationExcursionPath(destination.slug)}
            className="group absolute z-10 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center gap-1.5 transition hover:scale-105"
            style={{ top: `${destination.top}%`, left: `${destination.left}%` }}
            aria-label={destination.title}
          >
            <span className="relative flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-60" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-orange-500 shadow-md" />
            </span>
            <span className={`whitespace-nowrap rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold leading-tight text-white shadow-[0_1px_4px_rgba(0,0,0,0.45)] md:px-2 md:text-sm max-md:text-center ${mobileLabelPlacement[destination.slug] ?? ""}`}>
              <MapLabel title={destination.title} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
