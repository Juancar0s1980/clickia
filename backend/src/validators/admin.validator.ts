import { z } from "zod";

export const createUserByAdminSchema = z.object({
  nombre: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
  telefono: z.string().trim().max(30).optional(),
  tipoServicio: z.enum(["wifi", "tv", "wifi_tv"]),
});

export const updateNetworkStatusSchema = z.object({
  status: z.enum(["operativo", "mantenimiento", "falla"]),
  estimatedTime: z.string().trim().max(50).nullable().optional(),
});

// Cada fila se valida individualmente dentro de adminService.bulkCreateUsers (para poder
// reportar errores por fila sin tumbar el lote completo); aqui solo se exige que el body
// sea un arreglo de tamaño razonable.
export const bulkCreateUsersSchema = z.object({
  rows: z.array(z.record(z.unknown())).min(1).max(200),
});
