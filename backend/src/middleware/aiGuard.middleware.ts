import { NextFunction, Response } from "express";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { ApiError } from "../utils/ApiError";
import { sanitizeText } from "../utils/sanitize";
import { AuthenticatedRequest } from "./auth.middleware";

// Patrones de intento de manipular al modelo (prompt injection / jailbreak) en
// espanol e ingles. No es exhaustivo -- es una primera linea de defensa, no la unica:
// el system prompt (ver services/ai/promptBuilder.ts) tambien instruye al modelo a
// ignorar instrucciones que vengan dentro del mensaje del usuario.
const DANGEROUS_PATTERNS: RegExp[] = [
  /ignora(?:r)?\s+(todas\s+)?las\s+instrucciones/i,
  /ignore\s+(all\s+|previous\s+|prior\s+)*instructions/i,
  /revela(?:r)?\s+(tu|el)\s+(prompt|instrucciones)/i,
  /reveal\s+your\s+(system\s+)?prompt/i,
  /act(u|ú)a\s+como\s+(un|otro)/i,
  /you\s+are\s+now/i,
  /modo\s+desarrollador/i,
  /developer\s+mode/i,
  /jailbreak/i,
  /^\s*system\s*:/i,
];

interface UsageEntry {
  timestamps: number[];
}

// Rate limiting de uso de IA por usuario autenticado (distinto del rate limit por IP):
// evita que una sola cuenta agote la cuota del proveedor de IA. En memoria porque es
// un MVP de una sola instancia; con varias instancias del backend habria que mover esto
// a Redis para que el conteo sea compartido.
const usageByUser = new Map<string, UsageEntry>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const windowStart = now - env.aiRateLimitWindowMs;
  const entry = usageByUser.get(userId) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= env.aiRateLimitMax) {
    usageByUser.set(userId, entry);
    return true;
  }

  entry.timestamps.push(now);
  usageByUser.set(userId, entry);
  return false;
}

export function aiGuard(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const userId = req.userId!;

  if (isRateLimited(userId)) {
    logger.warn({ userId }, "ai_guard: rate limit exceeded");
    next(new ApiError(429, "Has enviado demasiados mensajes en poco tiempo. Espera unos minutos."));
    return;
  }

  const sanitized = sanitizeText(String(req.body.message ?? ""));
  if (sanitized.length === 0) {
    next(ApiError.badRequest("El mensaje no puede estar vacío."));
    return;
  }

  const isSuspicious = DANGEROUS_PATTERNS.some((pattern) => pattern.test(sanitized));
  if (isSuspicious) {
    logger.warn({ userId, messageLength: sanitized.length }, "ai_guard: blocked suspicious content");
    next(ApiError.badRequest("Tu mensaje contiene contenido no permitido. Reformúlalo, por favor."));
    return;
  }

  req.body.message = sanitized;
  // Se registra la longitud, no el contenido: evita almacenar en logs texto libre
  // que el usuario podria considerar sensible.
  logger.info({ userId, messageLength: sanitized.length }, "ai_guard: query allowed");
  next();
}
