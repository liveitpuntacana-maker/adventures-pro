import { NextRequest, NextResponse } from "next/server";

export const revalidate = 1800;

type OpenWeatherResponse = {
  main?: {
    temp?: number;
    humidity?: number;
  };
  weather?: Array<{
    description?: string;
    icon?: string;
  }>;
};

function resolveWeatherLang(lang: string | null): string {
  const normalized = (lang ?? "en").trim().toLowerCase();

  if (normalized.startsWith("es")) return "es";
  if (normalized.startsWith("fr")) return "fr";
  return "en";
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.WEATHER_API_KEY;
  const lang = resolveWeatherLang(request.nextUrl.searchParams.get("lang"));

  if (!apiKey) {
    return NextResponse.json(
      { error: "WEATHER_API_KEY is not configured." },
      { status: 500 },
    );
  }

  try {
    const url = new URL("https://api.openweathermap.org/data/2.5/weather");
    url.searchParams.set("q", "Punta Cana,DO");
    url.searchParams.set("appid", apiKey);
    url.searchParams.set("units", "metric");
    url.searchParams.set("lang", lang);

    const response = await fetch(url.toString(), {
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Unable to fetch weather data." },
        { status: 502 },
      );
    }

    const data = (await response.json()) as OpenWeatherResponse;
    const weather = data.weather?.[0];
    const temperature = data.main?.temp;
    const humidity = data.main?.humidity;
    const condition = weather?.description?.trim();
    const icon = weather?.icon?.trim();

    if (
      typeof temperature !== "number" ||
      typeof humidity !== "number" ||
      !condition ||
      !icon
    ) {
      return NextResponse.json(
        { error: "Incomplete weather data." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      temperature: Math.round(temperature),
      condition: condition.charAt(0).toUpperCase() + condition.slice(1),
      humidity,
      iconUrl: `https://openweathermap.org/img/wn/${icon}@2x.png`,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch weather data." },
      { status: 500 },
    );
  }
}
