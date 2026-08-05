import { NetworkStatus } from "../types/api";
import { httpClient } from "./httpClient";

export const networkApi = {
  async getStatus(zone?: string): Promise<NetworkStatus> {
    const { data } = await httpClient.get<NetworkStatus>("/network/status", { params: { zone } });
    return data;
  },
};
