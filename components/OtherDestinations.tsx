import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { destinationExcursionPath } from "@/lib/destinationPath";
import type { NavDestination } from "@/lib/sanityDestinations";

type OtherDestinationsProps = {
  destinations: NavDestination[];
  currentSlug: string;
};

/**
 * Shown under a destination's tours: a visitor who has read to the bottom
 * without finding a fit is offered the other zones instead of a dead end.
 * Only destinations that have tours reach this component.
 */
export default async function OtherDestinations({
  destinations,
  currentSlug,
}: OtherDestinationsProps) {
  const others = destinations.filter((destination) => destination.slug !== currentSlug);
  if (others.length === 0) return null;

  const t = await getTranslations("DestinationPage");

  return (
    <section className="mx-auto max-w-3xl px-6 pt-4 text-center md:px-10 lg:px-12">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight text-[#0a192f] md:text-2xl">
          {t("otherAreasTitle")}
        </h2>
        <p className="mt-2 text-sm text-slate-600 md:text-base">{t("otherAreasSubtitle")}</p>
        <nav
          aria-label={t("otherAreasTitle")}
          className="mt-5 flex flex-wrap items-center justify-center gap-2"
        >
          {others.map((destination) => (
            <Link
              key={destination.slug}
              href={destinationExcursionPath(destination.slug)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
            >
              {destination.title}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
