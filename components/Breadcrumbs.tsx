import { Link } from "@/i18n/navigation";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  /** Bottom margin; listing pages pass "mb-0" because the page below sets its own spacing. */
  className?: string;
};

export default function Breadcrumbs({ items, className = "mb-6" }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`${className} text-sm text-slate-500`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? (
              <span className="text-slate-300" aria-hidden>
                {">"}
              </span>
            ) : null}
            {item.href ? (
              <Link
                href={item.href}
                className="transition hover:text-orange-500"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-slate-800">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
