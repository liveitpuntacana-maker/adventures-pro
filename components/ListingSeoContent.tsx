import FaqAccordion from "@/components/FaqAccordion";
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
    <section className="mx-auto max-w-3xl px-6 pb-4 pt-8 md:px-10 md:pt-16 lg:px-12">
      <div className="space-y-4 text-[15px] leading-relaxed text-slate-700 md:text-base">
        <p>{content.intro}</p>
        <p>{content.detail}</p>
      </div>

      {content.faqs.length > 0 ? (
        <div className="mt-12 border-t border-slate-200 pt-10">
          <h2 className="text-xl font-semibold tracking-tight text-[#0a192f] md:text-2xl">
            {faqTitle}
          </h2>
          <FaqAccordion
            className="mt-5"
            items={content.faqs.map((faq) => ({ question: faq.question, answer: <p>{faq.answer}</p> }))}
          />
        </div>
      ) : null}
    </section>
  );
}
