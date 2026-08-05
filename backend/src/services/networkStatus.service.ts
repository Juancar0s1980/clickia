export type NetworkServiceStatus = "operativo" | "mantenimiento" | "falla";

export interface NetworkStatus {
  zone: string;
  service: string;
  status: NetworkServiceStatus;
  estimated_time: string | null;
}

const ZONES: Record<string, NetworkStatus> = {
  centro: { zone: "Centro", service: "internet", status: "mantenimiento", estimated_time: "30 minutos" },
  norte: { zone: "Norte", service: "internet", status: "operativo", estimated_time: null },
  sur: { zone: "Sur", service: "internet", status: "falla", estimated_time: "2 horas" },
  occidente: { zone: "Occidente", service: "internet", status: "operativo", estimated_time: null },
};

const DEFAULT_STATUS: NetworkStatus = {
  zone: "Desconocida",
  service: "internet",
  status: "operativo",
  estimated_time: null,
};

// Simula la API de infraestructura del ISP (GET /api/network/status). El resto
// del sistema depende solo de esta interfaz, asi que en produccion basta con
// reemplazar la implementacion por una llamada HTTP real sin tocar consumidores.
export const networkStatusService = {
  getStatus(zone?: string): NetworkStatus {
    if (!zone) {
      return DEFAULT_STATUS;
    }
    return ZONES[zone.toLowerCase()] ?? { ...DEFAULT_STATUS, zone };
  },
};
