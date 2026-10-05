import Image from "next/image";

const LIVE_IT_URL = "https://liveitpuntacana.com/";

export default function LiveItBanner() {
  return (
    <section className="mx-auto my-12 w-full max-w-7xl px-4 md:px-10 lg:px-12">
      <a
        href={LIVE_IT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-2xl transition-transform duration-300 hover:scale-[1.01] hover:shadow-xl"
      >
        <Image
          src="/images/live-it-banner-2026.webp"
          alt="Live It App - Golf, Tours, Transfers - Download on Google Play and App Store"
          width={1600}
          height={600}
          className="h-auto w-full rounded-2xl object-cover"
        />
      </a>
    </section>
  );
}
