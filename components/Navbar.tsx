"use client";

import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import WeatherWidget from "@/components/WeatherWidget";
import { categoryExcursionPath } from "@/lib/categoryPath";
import { type NavCategory } from "@/lib/sanityCategories";

type NavbarProps = {
  categories?: NavCategory[];
};

export default function Navbar({ categories = [] }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [excursionsOpen, setExcursionsOpen] = useState(false);
  const [desktopExcursionsOpen, setDesktopExcursionsOpen] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const currentLocale = useLocale();

  const isExcursionsActive =
    pathname === "/excursions" || pathname.startsWith("/excursions/");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!desktopMenuRef.current?.contains(event.target as Node)) {
        setDesktopExcursionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // whitespace-nowrap: sin el, flex encoge los enlaces y parte "Who We Are" o
  // "Agency Registration" en dos lineas en cuanto la barra va justa de ancho.
  const linkClass = (isActive: boolean) =>
    `whitespace-nowrap ${
      isActive
        ? "text-[#0a192f] underline underline-offset-8"
        : "text-slate-700 hover:text-[#0a192f]"
    }`;

  const mobileLinkClass = (isActive: boolean) =>
    isActive
      ? "text-[#0a192f] underline underline-offset-4"
      : "hover:bg-slate-100";

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 md:px-10 lg:px-12 xl:h-24">
        <Link href="/" className="inline-flex shrink-0 items-center">
          <Image
            src="/images/logo-v3.png"
            alt="Adventures Finder"
            width={250}
            height={83}
            className="h-12 w-auto shrink-0 sm:h-14 xl:h-[83px]"
          />
        </Link>
        <nav
          // Con el logo a su ancho real (250px) el menu completo mide ~950px en
          // frances, el idioma mas largo. Por debajo de xl no cabe sin desbordar
          // la pagina, asi que ahi manda la hamburguesa.
          className="hidden items-center gap-6 text-sm font-medium text-slate-800 xl:flex"
        >
          <Link href="/" className={`transition ${linkClass(pathname === "/")}`}>
            {t("home")}
          </Link>
          <Link href="/about" className={`transition ${linkClass(pathname === "/about" || pathname.startsWith("/about/"))}`}>
            {t("about")}
          </Link>
          <Link href="/transfers" className={`transition ${linkClass(pathname === "/transfers" || pathname.startsWith("/transfers/"))}`}>
            {t("transfers")}
          </Link>
          <div
            ref={desktopMenuRef}
            className="relative"
            onMouseEnter={() => setDesktopExcursionsOpen(true)}
            onMouseLeave={() => setDesktopExcursionsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setDesktopExcursionsOpen((value) => !value)}
              className={`inline-flex items-center gap-1 transition ${linkClass(isExcursionsActive)}`}
              aria-expanded={desktopExcursionsOpen}
              aria-haspopup="true"
            >
              {t("excursions")}
              <ChevronDown
                className={`h-4 w-4 transition ${desktopExcursionsOpen ? "rotate-180" : ""}`}
              />
            </button>
            {desktopExcursionsOpen ? (
              <div className="absolute left-0 top-full z-50 min-w-[220px] pt-2">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
                  <Link
                    href="/excursions"
                    className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-[#0a192f]"
                    onClick={() => setDesktopExcursionsOpen(false)}
                  >
                    {t("allExcursions")}
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={categoryExcursionPath(category.slug)}
                      className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-[#0a192f]"
                      onClick={() => setDesktopExcursionsOpen(false)}
                    >
                      {category.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <Link href="/blog" className={`transition ${linkClass(pathname === "/blog" || pathname.startsWith("/blog/"))}`}>
            {t("blog")}
          </Link>
          <a
            href="https://www.afdmctravel.com/en/agency-registration"
            target="_blank"
            rel="noopener noreferrer"
            className={`transition ${linkClass(false)}`}
          >
            {t("agencyRegistration")}
          </a>
          <div className="hidden items-center gap-2 xl:flex">
            <WeatherWidget compact locale={currentLocale} />
          </div>
          <LanguageSwitcher />
        </nav>
        <div className="flex items-center gap-2 xl:hidden">
          <LanguageSwitcher compact />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700"
            aria-label="Open menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 xl:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium text-slate-800">
            <Link
              href="/"
              className={`rounded-lg px-2 py-2 transition ${mobileLinkClass(pathname === "/")}`}
              onClick={() => setOpen(false)}
            >
              {t("home")}
            </Link>
            <Link
              href="/about"
              className={`rounded-lg px-2 py-2 transition ${mobileLinkClass(pathname === "/about" || pathname.startsWith("/about/"))}`}
              onClick={() => setOpen(false)}
            >
              {t("about")}
            </Link>
            <Link
              href="/transfers"
              className={`rounded-lg px-2 py-2 transition ${mobileLinkClass(pathname === "/transfers" || pathname.startsWith("/transfers/"))}`}
              onClick={() => setOpen(false)}
            >
              {t("transfers")}
            </Link>
            <div className="rounded-lg px-2 py-2">
              <button
                type="button"
                onClick={() => setExcursionsOpen((value) => !value)}
                className={`flex w-full items-center justify-between py-1 transition ${mobileLinkClass(isExcursionsActive)}`}
                aria-expanded={excursionsOpen}
              >
                {t("excursions")}
                <ChevronDown
                  className={`h-4 w-4 transition ${excursionsOpen ? "rotate-180" : ""}`}
                />
              </button>
              {excursionsOpen ? (
                <div className="mt-2 flex flex-col gap-1 border-l border-slate-200 pl-4">
                  <Link
                    href="/excursions"
                    className="rounded-lg px-2 py-2 transition hover:bg-slate-100"
                    onClick={() => {
                      setOpen(false);
                      setExcursionsOpen(false);
                    }}
                  >
                    {t("allExcursions")}
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={categoryExcursionPath(category.slug)}
                      className="rounded-lg px-2 py-2 transition hover:bg-slate-100"
                      onClick={() => {
                        setOpen(false);
                        setExcursionsOpen(false);
                      }}
                    >
                      {category.title}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            <Link
              href="/blog"
              className={`rounded-lg px-2 py-2 transition ${mobileLinkClass(pathname === "/blog" || pathname.startsWith("/blog/"))}`}
              onClick={() => setOpen(false)}
            >
              {t("blog")}
            </Link>
            <a
              href="https://www.afdmctravel.com/en/agency-registration"
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-lg px-2 py-2 transition ${mobileLinkClass(false)}`}
              onClick={() => setOpen(false)}
            >
              {t("agencyRegistration")}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
