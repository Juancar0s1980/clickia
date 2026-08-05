import crypto from "node:crypto";
import { env } from "../config/env";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { userRepository } from "../repositories/user.repository";
import { toPublicUser, PublicUser } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { signAccessToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/password";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

async function issueTokens(userId: string, email: string) {
  const accessToken = signAccessToken({ sub: userId, email });

  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000);
  await refreshTokenRepository.create(userId, hashToken(refreshToken), expiresAt);

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: {
    nombre: string;
    email: string;
    password: string;
    telefono?: string;
  }): Promise<PublicUser> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict("Ya existe una cuenta con ese correo");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      nombre: input.nombre,
      email: input.email,
      passwordHash,
      telefono: input.telefono,
    });

    return toPublicUser(user);
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.activo) {
      throw ApiError.unauthorized("Credenciales inválidas");
    }

    const passwordMatches = await comparePassword(password, user.password_hash);
    if (!passwordMatches) {
      throw ApiError.unauthorized("Credenciales inválidas");
    }

    const tokens = await issueTokens(user.id, user.email);
    return { user: toPublicUser(user), ...tokens };
  },

  async refresh(refreshToken: string) {
    const stored = await refreshTokenRepository.findValidByHash(hashToken(refreshToken));
    if (!stored) {
      throw ApiError.unauthorized("Refresh token inválido o expirado");
    }

    const user = await userRepository.findById(stored.user_id);
    if (!user || !user.activo) {
      throw ApiError.unauthorized("Refresh token inválido o expirado");
    }

    await refreshTokenRepository.revoke(stored.id);
    const tokens = await issueTokens(user.id, user.email);
    return { user: toPublicUser(user), ...tokens };
  },

  async logout(refreshToken: string): Promise<void> {
    const stored = await refreshTokenRepository.findValidByHash(hashToken(refreshToken));
    if (stored) {
      await refreshTokenRepository.revoke(stored.id);
    }
  },
};
