"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2400&q=85",
    alt: "Executive airport transfer van",
  },
  {
    src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2400&q=85",
    alt: "Catamaran and ocean excursions",
  },
  {
    src: "https://images.unsplash.com/photo-1628526495849-e82acd46496d?auto=format&fit=crop&w=2400&q=85",
    alt: "Off-road and land adventures",
  },
  {
    src: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2400&q=85",
    alt: "Tropical beach and coastline",
  },
];

const ROTATE_MS = 6000;

type HeroSlide = {
  src: string;
  alt?: string;
  /** Focal point set in Sanity (hotspot), as fractions of the image. */
  focus?: { x: number; y: number } | null;
};

/**
 * Where to centre the crop when the editor has not set a hotspot. The slider
 * images are wide banners (1920x750); a phone shows a slice about a quarter of
 * that width, and the centre of the image was cutting through nothing in
 * particular (sky, a stretch of forest). Keyed by the asset hash in the URL, so
 * it holds if the slides are reordered; the value is the horizontal position.
 */
const DEFAULT_FOCUS_X: Record<string, number> = {
  "60faf7d2": 70, // beach: the palm trees are on the right
  "8468b4c4": 30, // zipline: the rider is left of centre
  "797058cd": 50, // monkeys and the woman taking a selfie
};

function objectPosition(slide: HeroSlide): string {
  if (slide.focus) {
    return `${Math.round(slide.focus.x * 100)}% ${Math.round(slide.focus.y * 100)}%`;
  }
  const hash = Object.keys(DEFAULT_FOCUS_X).find((key) => slide.src.includes(key));
  return hash ? `${DEFAULT_FOCUS_X[hash]}% 50%` : "50% 50%";
}

type HomeHeroSliderProps = {
  slides?: HeroSlide[];
};

export default function HomeHeroSlider({ slides }: HomeHeroSliderProps) {
  const [active, setActive] = useState(0);
  const safeSlides = slides?.length ? slides : SLIDES;

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((n) => (n + 1) % safeSlides.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [safeSlides.length]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      {safeSlides.map((slide, index) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === active ? "z-[1] opacity-100" : "z-0 opacity-0"
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt || "Hero slide"}
            fill
            className="object-cover"
            style={{ objectPosition: objectPosition(slide) }}
            sizes="100vw"
            priority={index === 0}
          />
        </div>
      ))}
      <div className="absolute inset-0 z-[2] bg-black/50" aria-hidden />
    </div>
  );
}
