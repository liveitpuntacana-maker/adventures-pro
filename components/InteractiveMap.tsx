"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
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
  const [comingSoonSlug, setComingSoonSlug] = useState<string | null>(null);

  const pinnedDestinations = useMemo(
    () =>
      destinations
        .map((destination) => {
          const position = mapPositions[destination.slug];
          if (!position) return null;
          return {
            ...destination,
            ...position,
          };
        })
        .filter((item): item is PinnedDestination => item !== null),
    [destinations],
  );

  useEffect(() => {
    if (!comingSoonSlug) return;
    const timer = window.setTimeout(() => setComingSoonSlug(null), 2500);
    return () => window.clearTimeout(timer);
  }, [comingSoonSlug]);

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
        {pinnedDestinations.map((destination) => {
          const hasTours = destination.tourCount > 0;
          const showComingSoon = comingSoonSlug === destination.slug;

          const pinClassName = `group absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 transition ${
            hasTours ? "cursor-pointer hover:scale-105" : "cursor-default"
          }`;
          const pinStyle = { top: `${destination.top}%`, left: `${destination.left}%` };

          const pin = (
            <>
              {showComingSoon ? (
                <span className="pointer-events-none absolute bottom-full mb-2 whitespace-nowrap rounded-lg bg-slate-900/95 px-3 py-1.5 text-xs font-semibold text-white shadow-lg ring-1 ring-white/10 md:text-sm">
                  {t("comingSoon")}
                </span>
              ) : null}
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60 ${
                    hasTours ? "animate-ping" : ""
                  }`}
                />
                <span
                  className={`relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-orange-500 shadow-md ${
                    hasTours ? "" : "opacity-80"
                  }`}
                />
              </span>
              <span className="whitespace-nowrap rounded bg-black/50 px-2 py-0.5 text-xs font-semibold text-white shadow-[0_1px_4px_rgba(0,0,0,0.45)] md:text-sm">
                {destination.title}
              </span>
            </>
          );

          // Un destino con tours es un enlace de verdad, no un boton que navega.
          // Era un <button onClick={router.push}>, y Google no pulsa botones: las
          // cinco paginas de destino no recibian un solo enlace interno de todo
          // el sitio, la de Punta Cana incluida, que agrupa 76 tours. De paso el
          // visitante recupera lo que un enlace le debe — abrir en otra pestana,
          // copiar la direccion, verla antes de hacer clic.
          if (hasTours) {
            return (
              <Link
                key={destination.slug}
                href={destinationExcursionPath(destination.slug)}
                className={pinClassName}
                style={pinStyle}
                aria-label={destination.title}
              >
                {pin}
              </Link>
            );
          }

          // Sin tours no hay pagina a la que ir: el aviso de "proximamente" es
          // toda la interaccion, y un enlace prometeria algo que no existe.
          return (
            <button
              key={destination.slug}
              type="button"
              onClick={() => setComingSoonSlug(destination.slug)}
              className={pinClassName}
              style={pinStyle}
              aria-label={destination.title}
            >
              {pin}
            </button>
          );
        })}
      </div>
    </section>
  );
}
