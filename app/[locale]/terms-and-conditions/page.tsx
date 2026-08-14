import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/seo";
import { getDefaultOgImage } from "@/lib/ogImage";

export const revalidate = 86400;

type TermsPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Seo" });

  return buildPageMetadata({
    locale,
    pathname: "/terms-and-conditions",
    title: t("terms.title"),
    description: t("terms.description"),
    image: await getDefaultOgImage(),
    // The legal text itself is only available in English. Declaring Spanish
    // and French versions of an English document would create duplicates, so
    // the other locales stay readable but out of the index until translated.
    availableLocales: ["en"],
    noIndex: locale !== "en",
  });
}

export default async function TermsAndConditionsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <article className="space-y-10">
          <header className="border-b border-slate-200 pb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#0a192f] md:text-4xl">
              Terms and Conditions
            </h1>
            <h2 className="mt-4 text-xl font-semibold text-slate-800 md:text-2xl">
              Tours Cancellation Policy
            </h2>
          </header>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold uppercase tracking-wide text-[#0a192f]">
              YOUR ELIGIBILITY
            </h3>
            <p className="leading-relaxed text-slate-700">
              You must be an individual, 18 years of age or older. If you are under 18, you may use
              ADVENTURES FINDER TOURS only with involvement of a parent or legal guardian.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold uppercase tracking-wide text-[#0a192f]">
              YOUR RESPONSIBILITY
            </h3>
            <p className="leading-relaxed text-slate-700">
              Before making reservations, it is your responsibility to read the fine print associated
              with your desired product including, but not limited to, the following sections: Pricing
              and its notice, Tour itinerary, Package includes, Package Excludes, Cancellation and
              Refund Policy, Terms and Conditions, Special Note, etc.. And you herein state that you
              have read and fully understand the content of all fine print and will waive the right
              to dispute any part of it after your purchase.
            </p>
            <p className="leading-relaxed text-slate-700">
              Once you have completed your reservation, it is the customer&apos;s responsibility to
              keep all contact information up-to-date.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold uppercase tracking-wide text-[#0a192f]">
              MEDICAL CONDITIONS, PREGNANCY AND TRAVEL
            </h3>
            <p className="leading-relaxed text-slate-700">
              If you have a medical condition, or if you are pregnant and considering travel, you must
              consult with your doctor before you travel, especially if medical condition requires
              daily routine care, urgent care, or your pregnancy is high-risk. You are responsible for
              disclosing any related information to us during the check-out process by adding special
              comments. You understand ADVENTURES FINDER TOURS or local provider is not in a position
              to provide any medical services or urgent care in the event such an action may be
              required. You are liable for any risks, incidences or consequences incurred during travel.
              We highly recommend that you purchase medical insurance and travel insurance before you
              travel.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold uppercase tracking-wide text-[#0a192f]">
              TRAVEL INSURANCE
            </h3>
            <p className="leading-relaxed text-slate-700">
              ADVENTURES FINDER TOURS strongly recommends our customers acquire insurance covering
              medical, trip cancellation, and baggage, etc. ADVENTURES FINDER TOURS does not currently
              offer any travel arrangements. ADVENTURES FINDER TOURS shall be exempt from any liability
              in the event of an accident resulting in, but not limited to, loss or damage of
              properties, injury to people, death during trip, delays, irregularities or other
              occurrences beyond its control. Settlements will ensue in accordance with rules set by
              airlines, hotels, buses, etc. You agree that ADVENTURES FINDER TOURS will not be liable
              for any costs or damages arising out of a dispute or disagreement between you and any
              participating provider or a third party for anything that is in any way related to this
              site or the use of information contained in this site, and you hereby expressively waive
              any such claim against ADVENTURES FINDER TOURS and its owner, members, officers,
              directors, employees, parents, subsidiaries, agents and representatives.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold uppercase tracking-wide text-[#0a192f]">
              WHAT CAN BE REFUNDED:
            </h3>
            <p className="leading-relaxed text-slate-700">
              Some tours may require a minimum number of travelers to operate. The affected traveler
              will be fully refunded or may choose a similar tour product as a substitute. Should this
              occur, it would be under very rare circumstances. Please note that the product
              substitute chosen by the traveler may be more expensive than the original product and
              therefore may be subject to an additional cost. Any additional refunds based on
              extenuating circumstances will depend on the individual tour.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold uppercase tracking-wide text-[#0a192f]">
              WHAT CANNOT BE REFUNDED:
            </h3>
            <p className="leading-relaxed text-slate-700">
              All hotel and tour schedules are arranged ahead of time. Any person failing to appear on
              the day of departure will not be refunded. No refund will be given for any portions of
              the tour unused by the traveler after tour departure regardless of Hotel extensions and
              instant Confirmation products (admission tickets, city passes) cannot be exchanged or
              refunded once confirmed.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold uppercase tracking-wide text-[#0a192f]">
              DEPOSIT &amp; PAYMENT
            </h3>
            <p className="leading-relaxed text-slate-700">
              You understand and agree that, as a condition of booking Travel Services through
              ADVENTURES FINDER Tours, you and all participants in any Travel Services waive all
              claims and agree to defend, release and indemnify ADVENTURES FINDER Tours, its employees
              and agents from any and all liability or damages arising in any way from any Travel
              Services.
            </p>
            <p className="leading-relaxed text-slate-700">
              You understand that traveling and participating in the Travel Services can involve
              dangers and inherently risky activities that may result in death, personal injury, loss
              or damage to property, delays, inconvenience, extra costs or other losses.
            </p>
            <p className="leading-relaxed text-slate-700">
              ADVENTURES FINDER Tours, its employees and agents shall under no circumstances be liable
              for any representation, misrepresentation or information given or omitted in relation
              to the suitability of any Travel Services, visas, passports, health issues, insurance
              issues, taxation or any other matter.
            </p>
            <p className="leading-relaxed text-slate-700">
              ADVENTURES FINDER Tours, its employees and agents shall also under no circumstances be
              liable for any loss or damage including injury, death, loss of personal effects or
              luggage, loss of revenue or profit, costs, expenses, delays, inconvenience, loss of
              enjoyment or emotional upset, no matter how caused, whether or not due to any act,
              omission or negligence of ADVENTURES FINDER Tours, its employees or agents.
            </p>
            <p className="leading-relaxed text-slate-700">
              In the alternative, should the liability Release &amp; Agreement Not to Sue contained
              above be found unenforceable for any reason, all liability of ADVENTURES FINDER Tours
              shall be limited to the lesser of the total price of the Travel Services.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold uppercase tracking-wide text-[#0a192f]">
              CLAIMS
            </h3>
            <p className="leading-relaxed text-slate-700">
              ADVENTURES FINDER Tours is committed to customer satisfaction. If you encounter any
              difficulties or problems please let us know immediately so that we may attempt to
              address your concerns. If we are unsuccessful in resolving your concern, and your claim
              is for any reason not covered by the Liability Release &amp; Agreement Not to Sue
              detailed above, you agree that any claim relating in any way to any Travel Services
              arranged through ADVENTURES FINDER Tours is null and void unless notice is provided in
              writing within 15 days of the completion of any Travel Services.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}
