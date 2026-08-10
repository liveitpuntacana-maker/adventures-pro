"use client";

import { useEffect, useState } from "react";

type WeatherData = {
  temperature: number;
  condition: string;
  humidity: number;
  iconUrl: string;
};

type WeatherState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: WeatherData };

type WeatherWidgetProps = {
  compact?: boolean;
  locale?: string;
};

function weatherLabels(locale: string) {
  const lang = locale.toLowerCase();

  if (lang.startsWith("es")) {
    return {
      country: "República Dominicana",
      humidity: "Humedad",
      loading: "Cargando clima",
      title: "Clima · Punta Cana",
    };
  }

  if (lang.startsWith("fr")) {
    return {
      country: "République dominicaine",
      humidity: "Humidité",
      loading: "Chargement météo",
      title: "Météo · Punta Cana",
    };
  }

  return {
    country: "Dominican Republic",
    humidity: "Humidity",
    loading: "Loading weather",
    title: "Weather · Punta Cana",
  };
}

export default function WeatherWidget({
  compact = false,
  locale = "en",
}: WeatherWidgetProps) {
  const [state, setState] = useState<WeatherState>({ status: "loading" });
  const labels = weatherLabels(locale || "en");

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      try {
        const response = await fetch(
          `/api/clima?lang=${encodeURIComponent(locale || "en")}`,
        );
        const payload = (await response.json()) as WeatherData & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load weather.");
        }

        if (
          typeof payload.temperature !== "number" ||
          typeof payload.humidity !== "number" ||
          !payload.condition ||
          !payload.iconUrl
        ) {
          throw new Error("Incomplete weather data.");
        }

        if (!cancelled) {
          setState({
            status: "success",
            data: {
              temperature: payload.temperature,
              condition: payload.condition,
              humidity: payload.humidity,
              iconUrl: payload.iconUrl,
            },
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Unable to load weather.",
          });
        }
      }
    }

    void loadWeather();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (compact) {
    if (state.status === "loading") {
      return (
        <div
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 shadow-sm"
          aria-busy="true"
          aria-label={labels.loading}
        >
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-[#0a192f]" />
          <span className="hidden h-3 w-14 animate-pulse rounded bg-slate-200 lg:block" />
        </div>
      );
    }

    if (state.status === "error") {
      return null;
    }

    const { temperature, condition, iconUrl } = state.data;

    return (
      <div
        className="inline-flex h-9 max-h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-[#0a192f] shadow-sm"
        title={`${condition} · Punta Cana`}
      >
        <img
          src={iconUrl}
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 shrink-0"
        />
        <span className="text-sm font-semibold tabular-nums leading-none">
          {temperature}°C
        </span>
        <span className="hidden text-xs font-medium text-slate-500 lg:inline">
          Punta Cana
        </span>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div
        className="w-full max-w-sm animate-pulse rounded-2xl border border-white/40 bg-white/80 p-6 shadow-lg backdrop-blur-md"
        aria-busy="true"
        aria-label={labels.loading}
      >
        <div className="mb-4 h-3 w-28 rounded bg-slate-200" />
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-slate-200" />
          <div className="space-y-2">
            <div className="h-10 w-24 rounded bg-slate-200" />
            <div className="h-4 w-32 rounded bg-slate-200" />
          </div>
        </div>
        <div className="mt-5 h-3 w-36 rounded bg-slate-200" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div
        className="w-full max-w-sm rounded-2xl border border-red-100 bg-white/90 p-6 shadow-lg backdrop-blur-md"
        role="alert"
      >
        <p className="text-sm font-semibold tracking-wide text-[#0a192f]">
          {labels.title}
        </p>
        <p className="mt-3 text-sm text-slate-600">{state.message}</p>
      </div>
    );
  }

  const { temperature, condition, humidity, iconUrl } = state.data;

  return (
    <article className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/50 bg-gradient-to-br from-white/95 via-white/90 to-[#0a192f]/5 p-6 shadow-lg backdrop-blur-md">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0a192f]/70">
          Punta Cana
        </p>
        <p className="mt-1 text-sm text-slate-500">{labels.country}</p>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <img
          src={iconUrl}
          alt={condition}
          width={72}
          height={72}
          className="h-[72px] w-[72px] shrink-0 drop-shadow-sm"
        />
        <div className="min-w-0">
          <p className="text-5xl font-semibold tracking-tight text-[#0a192f] md:text-6xl">
            {temperature}
            <span className="align-top text-2xl font-medium text-[#0a192f]/70">
              °C
            </span>
          </p>
          <p className="mt-1 truncate text-base font-medium capitalize text-slate-700 md:text-lg">
            {condition}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-[#0a192f]/10 pt-4 text-sm text-slate-600">
        <span>{labels.humidity}</span>
        <span className="font-semibold text-[#0a192f]">{humidity}%</span>
      </div>
    </article>
  );
}
