"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

function FlagIcon({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex h-4 w-6 shrink-0 overflow-hidden rounded-sm border border-gray-200/40 shadow-sm"
      aria-hidden
    >
      <svg viewBox="0 0 640 480" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        {children}
      </svg>
    </span>
  );
}

function UsFlag() {
  return (
    <FlagIcon>
      <path fill="#b22234" d="M0 0h640v480H0" />
      <path
        stroke="#fff"
        strokeWidth="36.9"
        d="M0 55.4h640M0 129.2h640M0 203h640M0 276.9h640M0 350.8h640M0 424.6h640"
      />
      <path fill="#3c3b6e" d="M0 0h256v259H0" />
      <g fill="#fff">
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3, 4, 5].map((col) => (
            <circle
              key={`a-${row}-${col}`}
              cx={24 + col * 42}
              cy={24 + row * 52}
              r="10"
            />
          )),
        )}
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3, 4].map((col) => (
            <circle
              key={`b-${row}-${col}`}
              cx={45 + col * 42}
              cy={50 + row * 52}
              r="10"
            />
          )),
        )}
      </g>
    </FlagIcon>
  );
}

function EsFlag() {
  return (
    <FlagIcon>
      <path fill="#c60b1e" d="M0 0h640v480H0" />
      <path fill="#ffc400" d="M0 120h640v240H0" />
    </FlagIcon>
  );
}

function FrFlag() {
  return (
    <FlagIcon>
      <path fill="#002654" d="M0 0h213.3v480H0" />
      <path fill="#fff" d="M213.3 0h213.4v480H213.3" />
      <path fill="#ce1126" d="M426.7 0H640v480H426.7" />
    </FlagIcon>
  );
}

const localeOptions: { code: AppLocale; label: string; flag: ReactNode }[] = [
  { code: "en", label: "English", flag: <UsFlag /> },
  { code: "es", label: "Spanish", flag: <EsFlag /> },
  { code: "fr-ca", label: "French", flag: <FrFlag /> },
];

type LanguageSwitcherProps = {
  compact?: boolean;
};

const normalizeLocaleKey = (value: string) => value.trim().toLowerCase().replace(/_/g, "-");

const resolveAppLocale = (raw: string): AppLocale => {
  const key = normalizeLocaleKey(raw);
  if (routing.locales.includes(key as AppLocale)) return key as AppLocale;
  if (key === "us") return "en";
  if (key === "fr" || key.startsWith("fr-")) return "fr-ca";
  if (key.startsWith("en")) return "en";
  if (key.startsWith("es")) return "es";
  return routing.defaultLocale;
};

const localeMeta = (code: AppLocale) => {
  if (code === "en") return { label: "English", flag: <UsFlag /> };
  if (code === "es") return { label: "Spanish", flag: <EsFlag /> };
  return { label: "French", flag: <FrFlag /> };
};

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const rawLocale = useLocale();
  const activeLocale = resolveAppLocale(String(rawLocale));
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = localeMeta(activeLocale);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selectLocale = (code: AppLocale) => {
    if (!routing.locales.includes(code)) return;
    router.replace(pathname, { locale: code });
    setOpen(false);
  };

  // En movil solo caben bandera y flecha: con la palabra, el boton pide 124px y
  // la cabecera se pasa de los 360 de un telefono estrecho. El nombre del idioma
  // vuelve desde sm, y el aria-label cubre el hueco para lectores de pantalla.
  const triggerClass = compact
    ? "h-9 grid-cols-[auto_auto] gap-1.5 px-2.5 text-sm sm:min-w-[108px] sm:grid-cols-[auto_1fr_auto]"
    : "h-10 min-w-[168px] grid-cols-[auto_1fr_auto] gap-2.5 px-3.5 text-sm";

  const rowClass = compact ? "px-3 py-2 text-sm" : "px-3.5 py-2.5 text-sm";

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-label="Language switcher"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className={`grid items-center rounded-full border border-slate-200 bg-white font-medium text-slate-900 shadow-sm outline-none transition hover:border-slate-300 focus-visible:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-500/20 ${triggerClass}`}
      >
        {current.flag}
        <span
          className={`truncate text-center ${compact ? "hidden sm:block" : ""}`}
        >
          {current.label}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 min-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm"
        >
          {localeOptions.map((item) => {
            const meta = localeMeta(item.code);
            return (
              <li key={item.code} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={item.code === activeLocale}
                  onClick={() => selectLocale(item.code)}
                  className={`flex w-full items-center gap-2.5 rounded-xl font-medium hover:bg-slate-50 ${rowClass} ${
                    item.code === activeLocale ? "bg-slate-100 text-slate-900" : "text-slate-800"
                  }`}
                >
                  {meta.flag}
                  <span>{meta.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
