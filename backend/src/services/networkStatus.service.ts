import { networkStatusRepository } from "../repositories/networkStatus.repository";
import { NetworkServiceStatus, NetworkStatusRow } from "../models/networkStatus.model";

export type { NetworkServiceStatus } from "../models/networkStatus.model";

export interface NetworkStatus {
  zone: string;
  service: string;
  status: NetworkServiceStatus;
  estimated_time: string | null;
}

const DEFAULT_STATUS: NetworkStatus = {
  zone: "Desconocida",
  service: "internet",
  status: "operativo",
  estimated_time: null,
};

function toNetworkStatus(row: NetworkStatusRow): NetworkStatus {
  return { zone: row.zone, service: row.service, status: row.status, estimated_time: row.estimated_time };
}

// API de infraestructura del ISP (GET /api/network/status), respaldada por la tabla
// network_status en vez de un objeto en memoria: un admin puede actualizarla de verdad
// (ver controllers/admin.controller.ts) y el chat siempre lee el valor vigente.
export const networkStatusService = {
  async getStatus(zone?: string): Promise<NetworkStatus> {
    if (!zone) {
      return DEFAULT_STATUS;
    }
    const row = await networkStatusRepository.findByZone(zone);
    return row ? toNetworkStatus(row) : { ...DEFAULT_STATUS, zone };
  },

  async listAll(): Promise<NetworkStatus[]> {
    const rows = await networkStatusRepository.findAll();
    return rows.map(toNetworkStatus);
  },

  async setStatus(zone: string, status: NetworkServiceStatus, estimatedTime: string | null): Promise<NetworkStatus> {
    const row = await networkStatusRepository.upsert({ zone, status, estimatedTime });
    return toNetworkStatus(row);
  },
};
