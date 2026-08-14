import type { ListingIntro } from "@/lib/content/listingIntro";

type ListingSeoContentProps = {
  content: ListingIntro;
  faqTitle: string;
};

/**
 * Introductory copy and page-specific FAQs for category and destination pages.
 *
 * These pages were previously a hero plus a grid of cards, which gave Google
 * almost no text of their own to rank. The same FAQ entries are emitted as
 * FAQPage structured data by the page that renders this.
 */
export default function ListingSeoContent({
  content,
  faqTitle,
}: ListingSeoContentProps) {
  return (
    <section className="mx-auto max-w-3xl px-6 pb-4 pt-12 md:px-10 md:pt-16 lg:px-12">
      <div className="space-y-4 text-[15px] leading-relaxed text-slate-700 md:text-base">
        <p>{content.intro}</p>
        <p>{content.detail}</p>
      </div>

      {content.faqs.length > 0 ? (
        <div className="mt-12 border-t border-slate-200 pt-10">
          <h2 className="text-xl font-semibold tracking-tight text-[#0a192f] md:text-2xl">
            {faqTitle}
          </h2>
          <dl className="mt-6 space-y-6">
            {content.faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="text-base font-semibold text-slate-900">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-slate-700">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  );
}
