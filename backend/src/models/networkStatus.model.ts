export type NetworkServiceStatus = "operativo" | "mantenimiento" | "falla";

export interface NetworkStatusRow {
  zone: string;
  service: string;
  status: NetworkServiceStatus;
  estimated_time: string | null;
  updated_at: Date;
}
