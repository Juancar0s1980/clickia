import { Weather } from "../types/api";
import { httpClient } from "./httpClient";

export const weatherApi = {
  async getCurrent(zone: string): Promise<Weather | null> {
    const { data } = await httpClient.get<{ weather: Weather | null }>("/weather", { params: { zone } });
    return data.weather;
  },
};
