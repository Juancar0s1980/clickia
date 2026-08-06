import { z } from "zod";
import { ZONAS } from "./auth.validator";

export const createUserByAdminSchema = z.object({
  nombre: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
  direccion: z.string().trim().min(5, "Ingresa la dirección de la casa del cliente").max(200),
  zona: z.enum(ZONAS, { errorMap: () => ({ message: "Selecciona la zona del cliente" }) }),
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

export const updateTicketStatusSchema = z.object({
  estado: z.enum(["abierto", "en_proceso", "resuelto", "cerrado"]),
  respuesta: z.string().trim().min(1, "La respuesta no puede estar vacía").max(2000).optional(),
});
