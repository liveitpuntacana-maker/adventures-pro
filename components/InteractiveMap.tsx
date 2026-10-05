import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { destinationExcursionPath } from "@/lib/destinationPath";
import { type MapDestination } from "@/lib/sanityDestinations";

const mapPositions: Record<string, { top: number; left: number }> = {
  "puerto-plata": { top: 16, left: 41 },
  samana: { top: 35, left: 68 },
  miches: { top: 48, left: 76 },
  "punta-cana": { top: 60, left: 86 },
  "bayahibe-la-romana": { top: 65, left: 73 },
  "juan-dolio": { top: 68, left: 58 },
  "santo-domingo": { top: 75, left: 48 },
};

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
      <div className="relative mx-auto aspect-[16/9] h-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-blue-950 shadow-lg">
        <Image
          src="/images/dr-map.jpg"
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
            <span className="whitespace-nowrap rounded bg-black/50 px-2 py-0.5 text-xs font-semibold text-white shadow-[0_1px_4px_rgba(0,0,0,0.45)] md:text-sm">
              {destination.title}
            </span>
          </Link>
        ))}
      </div>

      {/* Small pins are hard to hit on a phone, so every destination also gets
          a plain button under the map. */}
      <nav
        aria-label={t("destinationsNav")}
        className="mx-auto mt-5 flex max-w-5xl flex-wrap items-center justify-center gap-2"
      >
        {available.map((destination) => (
          <Link
            key={destination.slug}
            href={destinationExcursionPath(destination.slug)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
          >
            {destination.title}
          </Link>
        ))}
      </nav>
    </section>
  );
}
