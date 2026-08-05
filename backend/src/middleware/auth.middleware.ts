import { NextFunction, Request, Response } from "express";
import { UserRole } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: UserRole;
}

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(ApiError.unauthorized("Token de acceso requerido"));
    return;
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    req.userEmail = payload.email;
    req.userRole = payload.role;
    next();
  } catch {
    next(ApiError.unauthorized("Token de acceso inválido o expirado"));
  }
}

// Debe montarse siempre despues de requireAuth. El rol viaja en el JWT emitido al hacer
// login, asi que un cambio de rol solo toma efecto en la proxima sesion del usuario.
export function requireAdmin(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  if (req.userRole !== "admin") {
    next(ApiError.forbidden("Requiere permisos de administrador"));
    return;
  }
  next();
}
