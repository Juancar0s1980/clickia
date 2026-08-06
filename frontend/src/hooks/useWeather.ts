import { useQuery } from "@tanstack/react-query";
import { weatherApi } from "../services/weatherApi";

export function useWeather(zone: string) {
  return useQuery({
    queryKey: ["weather", zone],
    queryFn: () => weatherApi.getCurrent(zone),
  });
}
