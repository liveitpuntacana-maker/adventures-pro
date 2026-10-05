import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export type FaqAccordionItem = {
  question: string;
  answer: ReactNode;
};

type FaqAccordionProps = {
  items: FaqAccordionItem[];
  /** Heading level of each question; defaults to h3 under a section's h2. */
  questionTag?: "h2" | "h3";
  className?: string;
};

/**
 * Collapsed-by-default FAQ list: the question shows, a tap opens the answer.
 *
 * Built on <details>, not a script-driven accordion, so it works without
 * JavaScript and the answers stay in the page's HTML — Google reads the text of
 * a closed <details>, and the same entries are also emitted as FAQPage
 * structured data by the pages that render this.
 */
export default function FaqAccordion({
  items,
  questionTag: Heading = "h3",
  className = "",
}: FaqAccordionProps) {
  return (
    <div className={`divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white ${className}`}>
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-left marker:hidden [&::-webkit-details-marker]:hidden md:px-5 md:py-4">
            <Heading className="text-[15px] font-semibold leading-snug text-slate-900 md:text-base">
              {item.question}
            </Heading>
            <ChevronDown
              aria-hidden="true"
              className="h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <div className="px-4 pb-4 text-[15px] leading-relaxed text-slate-700 md:px-5">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
