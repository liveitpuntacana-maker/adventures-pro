import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/seo";
import { getDefaultOgImage } from "@/lib/ogImage";

export const revalidate = 86400;

type CancellationPolicyPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: CancellationPolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Seo" });

  return buildPageMetadata({
    locale,
    pathname: "/cancellation-policy",
    title: t("cancellation.title"),
    description: t("cancellation.description"),
    image: await getDefaultOgImage(),
    // English-only legal text; see the note in terms-and-conditions.
    availableLocales: ["en"],
    noIndex: locale !== "en",
  });
}

export default async function CancellationPolicyPage({ params }: CancellationPolicyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <article className="space-y-10">
          <header className="border-b border-slate-200 pb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#0a192f] md:text-4xl">
              Cancellation Policy Tours
            </h1>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800 md:text-2xl">Tours</h2>
            <p className="leading-relaxed text-slate-700">
              At ADVENTURES FINDER, we understand that plans can change. We strive to offer
              flexibility to our clients while ensuring the quality of our services. Below is our
              cancellation policy:
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-[#0a192f]">Standard Cancellations:</h3>
            <p className="leading-relaxed text-slate-700">
              Clients who cancel their booking more than 24 hours prior to the scheduled tour will
              receive a 100% refund.
            </p>
            <p className="leading-relaxed text-slate-700">
              Cancellations made less than 24 hours before the scheduled tour will not be eligible
              for a refund.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-[#0a192f]">
              Illness or Medical Emergencies:
            </h3>
            <p className="leading-relaxed text-slate-700">
              If clients are unable to attend the tour on the day of the event due to illness, they
              are required to present a valid medical report to qualify for a refund.
            </p>
            <p className="leading-relaxed text-slate-700">
              Without a medical report, the standard cancellation policy applies.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-[#0a192f]">Pickup Policy:</h3>
            <p className="leading-relaxed text-slate-700">
              Our drivers will wait at the designated pickup point for a maximum of 10 minutes.
            </p>
            <p className="leading-relaxed text-slate-700">
              If clients do not arrive within this 10-minute window, it will be considered a
              &ldquo;no show.&rdquo;
            </p>
            <p className="leading-relaxed text-slate-700">No shows result in no refund.</p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-[#0a192f]">
              Weather-Related Cancellations:
            </h3>
            <p className="leading-relaxed text-slate-700">
              In the event that a tour is cancelled due to weather conditions, ADVENTURES FINDER
              offers clients two options:
            </p>
            <p className="leading-relaxed text-slate-700">
              Reschedule the tour for an alternative date.
            </p>
            <p className="leading-relaxed text-slate-700">Receive a full refund.</p>
            <p className="leading-relaxed text-slate-700">
              We appreciate your understanding and cooperation. If you have any questions or require
              further clarification on our cancellation policy, please don&apos;t hesitate to contact
              us.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-[#0a192f]">
              Cancellations by Adventures Finder
            </h3>
            <p className="leading-relaxed text-slate-700">
              If we have to cancel a tour before it starts because of things like terrorism, natural
              disasters, or political problems, we&apos;ll give you a full refund or help you
              reschedule for another time. But if the cancellation is because of things beyond our
              control, like those mentioned, we might not be able to refund everything. We
              won&apos;t cover any extra costs you might have already paid for, like visas or flights
              that can&apos;t be changed.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-[#0a192f]">Our Contract</h3>
            <p className="leading-relaxed text-slate-700">
              All bookings are made with Adventures Finders (us/we). By making a booking, the
              traveler (you) is deemed to have agreed to these terms and conditions on behalf of all
              individuals included in the booking. The services to be provided are those in your
              booking confirmation invoice. No alterations or variations to these terms and
              conditions are in effect unless made in writing by and under the authority of
              AdventuresFinder.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-[#0a192f]">
              Amendments to bookings by the traveler
            </h3>
            <p className="leading-relaxed text-slate-700">
              If a traveler wishes to amend an existing booking, the original booking must be
              canceled and a new booking made. Prices applying to the new booking will be the price
              at the time the new booking is made. Cancellation charges may apply (refer to
              Cancellations by the traveler).
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-[#0a192f]">
              Changes to Your Adventure Itinerary by Adventures Finder
            </h3>
            <p className="leading-relaxed text-slate-700">
              While we aim to keep our tours as promised, sometimes changes are needed. The
              activities we list are our plan, but things like the route, stops, or transport might
              change due to local situations or events. If there&apos;s a big change before your
              trip starts, we&apos;ll let you know as soon as we can. Once the adventure has begun,
              we might also need to adjust the plan if unexpected events arise. We reserve the right
              to change an itinerary after departure due to local circumstances or events outside of
              our control.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-[#0a192f]">
              Mandatory Travel Insurance for Adventures Finder Tours Participants:
            </h3>
            <p className="leading-relaxed text-slate-700">
              For your safety and peace of mind, all travelers who embark on an activity with
              Adventures Finder are required to possess valid and comprehensive travel insurance. This
              insurance should cover potential scenarios including, but not limited to, medical
              emergencies, trip cancellations, lost luggage, and other unforeseen events.
            </p>
            <p className="leading-relaxed text-slate-700">
              Adventures Finder and our associated partners will not bear any liability for expenses,
              losses, or damages you might encounter due to lacking or inadequate insurance coverage.
              This means that any financial or logistical burdens arising from unexpected incidents
              during your trip will be your responsibility if not covered by your insurance.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}
