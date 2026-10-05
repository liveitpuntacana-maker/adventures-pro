import Image from "next/image";

export default function AllianceLogos() {
  return (
    <section className="w-full bg-white py-8 md:py-16">
      {/* A 2x2 grid on a phone, so the logos line up in even cells instead of
          wrapping into a staggered stack; the single wrapping row returns from md. */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 place-items-center gap-x-6 gap-y-6 px-6 md:flex md:flex-wrap md:items-center md:justify-center md:gap-16 md:px-10 lg:px-12">
        <a
          href="https://theromantictourist.com/specialists/adventures-finder-dominican-republic-dmc"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 w-full items-center justify-center md:h-auto md:w-auto"
        >
          <Image
            src="/alliances/romantic-tourist.png"
            alt="The Romantic Tourist"
            width={260}
            height={80}
            className="h-9 w-auto max-w-[140px] object-contain grayscale opacity-70 transition-all hover:grayscale-0 hover:opacity-100 md:h-16 md:max-w-none"
          />
        </a>
        <a
          href="https://www.instagram.com/opetur"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 w-full items-center justify-center md:h-auto md:w-auto"
        >
          <Image
            src="/alliances/opetur.png"
            alt="OPETUR - Asociacion de Tour Operadores Receptivos de la Republica Dominicana"
            width={520}
            height={178}
            className="h-9 w-auto max-w-[140px] object-contain grayscale opacity-70 transition-all hover:grayscale-0 hover:opacity-100 md:h-16 md:max-w-none"
          />
        </a>
        <a
          href="https://wellnesstourismassociation.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 w-full items-center justify-center md:h-auto md:w-auto"
        >
          <Image
            src="/alliances/wellness.png"
            alt="Wellness Tourism Association"
            width={260}
            height={80}
            className="h-9 w-auto max-w-[140px] object-contain grayscale opacity-70 transition-all hover:grayscale-0 hover:opacity-100 md:h-16 md:max-w-none"
          />
        </a>
        <a
          href="https://globalagents.ca/marketing/adventures-finder"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 w-full items-center justify-center md:h-auto md:w-auto"
        >
          <Image
            src="/alliances/Global Agents logo.png"
            alt="Global Agents Canada"
            width={200}
            height={70}
            className="h-9 w-auto max-w-[140px] object-contain grayscale opacity-70 transition-all hover:grayscale-0 hover:opacity-100 md:h-16 md:max-w-none"
          />
        </a>
      </div>
    </section>
  );
}
