import { pool } from "../config/database";

export interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  fecha_creacion: Date;
}

export const refreshTokenRepository = {
  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshTokenRow> {
    const { rows } = await pool.query<RefreshTokenRow>(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, tokenHash, expiresAt],
    );
    return rows[0]!;
  },

  async findValidByHash(tokenHash: string): Promise<RefreshTokenRow | null> {
    const { rows } = await pool.query<RefreshTokenRow>(
      `SELECT * FROM refresh_tokens
       WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()`,
      [tokenHash],
    );
    return rows[0] ?? null;
  },

  async revoke(id: string): Promise<void> {
    await pool.query("UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1", [id]);
  },
};
