import rateLimit from "express-rate-limit";
import { env } from "../config/env";

// Limite general por IP para toda la API: contiene abuso basico (scraping, bots) sin
// estorbar el uso normal.
export const apiRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Intenta de nuevo más tarde." },
});

// Limite mas estricto en login/refresh: mitiga fuerza bruta de credenciales.
export const authRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos de autenticación. Intenta de nuevo más tarde." },
});
