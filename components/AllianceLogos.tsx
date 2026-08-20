import Image from "next/image";

export default function AllianceLogos() {
  return (
    <section className="w-full bg-white py-12 md:py-16">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-12 px-6 md:gap-16 md:px-10 lg:px-12">
        <a
          href="https://theromantictourist.com/specialists/adventures-finder-dominican-republic-dmc"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center"
        >
          <Image
            src="/alliances/romantic-tourist.png"
            alt="The Romantic Tourist"
            width={260}
            height={80}
            className="h-16 w-auto object-contain grayscale opacity-70 transition-all hover:grayscale-0 hover:opacity-100"
          />
        </a>
        <a
          href="https://www.instagram.com/opetur"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center"
        >
          <Image
            src="/alliances/opetur.png"
            alt="OPETUR - Asociacion de Tour Operadores Receptivos de la Republica Dominicana"
            width={520}
            height={178}
            className="h-16 w-auto object-contain grayscale opacity-70 transition-all hover:grayscale-0 hover:opacity-100"
          />
        </a>
        <a
          href="https://wellnesstourismassociation.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center"
        >
          <Image
            src="/alliances/wellness.png"
            alt="Wellness Tourism Association"
            width={260}
            height={80}
            className="h-16 w-auto object-contain grayscale opacity-70 transition-all hover:grayscale-0 hover:opacity-100"
          />
        </a>
      </div>
    </section>
  );
}
