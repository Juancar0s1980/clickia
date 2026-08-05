import { z } from "zod";

// El limite de 1000 caracteres es tambien la primera linea de defensa del AI Guard (Fase 6).
export const sendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().trim().min(1).max(1000),
  zone: z.string().trim().max(50).optional(),
});
