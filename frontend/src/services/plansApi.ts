import { Plan } from "../types/api";
import { httpClient } from "./httpClient";

export const plansApi = {
  async list(): Promise<Plan[]> {
    const { data } = await httpClient.get<Plan[]>("/plans");
    return data;
  },
};
