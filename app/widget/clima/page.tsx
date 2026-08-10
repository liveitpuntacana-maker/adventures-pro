import type { Metadata } from "next";
import WeatherWidget from "@/components/WeatherWidget";

export const metadata: Metadata = {
  title: "Clima Punta Cana",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ClimaWidgetPage() {
  return <WeatherWidget />;
}
