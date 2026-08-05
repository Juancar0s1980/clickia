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
