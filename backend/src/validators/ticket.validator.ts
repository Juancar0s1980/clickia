import { z } from "zod";

export const createTicketSchema = z.object({
  conversationId: z.string().uuid().optional(),
  descripcion: z.string().trim().min(10).max(2000),
  prioridad: z.enum(["baja", "media", "alta", "critica"]).optional(),
});
