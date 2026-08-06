export type PlanCategoria = "doble" | "triple";

export interface Plan {
  id: string;
  numero: number;
  categoria: PlanCategoria;
  nombre: string;
  velocidad_mb: number;
  incluye_tv: boolean;
  tv_canales: number | null;
  moviles_gb: number | null;
  precio_mensual: number | null;
  nota: string;
  activo: boolean;
}
