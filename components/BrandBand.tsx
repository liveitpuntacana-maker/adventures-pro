import Image from "next/image";

type BrandBandProps = {
  children: React.ReactNode;
  /** Vertical padding; the search box sits in a tighter band than the contact form. */
  paddingClassName?: string;
};

/**
 * Blue band that makes a white card stand out: under the hero photo for the
 * search box, and around the trip-planning form. A soft glow sits behind the
 * card and the logo shows as a very faint white silhouette in the corner.
 */
export default function BrandBand({ children, paddingClassName = "py-6 md:py-8" }: BrandBandProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-b from-blue-950 to-[#1b3478] px-4 md:px-10 lg:px-12 ${paddingClassName}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_50%_30%,rgba(96,165,250,0.22),transparent)]"
      />
      <Image
        src="/images/logo-adventures-finder.webp"
        alt=""
        width={580}
        height={307}
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -right-16 w-72 select-none opacity-[0.06] brightness-0 invert md:-bottom-24 md:-right-20 md:w-[34rem]"
      />
      <div className="relative mx-auto w-full max-w-4xl">{children}</div>
    </div>
  );
}
