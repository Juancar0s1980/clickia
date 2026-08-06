import { Weather } from "../../types/api";

export function WeatherBadge({ weather }: { weather: Weather }) {
  const style = weather.isSevere
    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
    : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {weather.description}, {Math.round(weather.temperatureC)}°C
      {weather.isSevere ? " · puede afectar la señal" : ""}
    </span>
  );
}
