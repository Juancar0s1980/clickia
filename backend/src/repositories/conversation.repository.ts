import { pool } from "../config/database";
import { Conversation, ConversationEstado } from "../models/conversation.model";

export const conversationRepository = {
  async create(userId: string): Promise<Conversation> {
    const { rows } = await pool.query<Conversation>(
      `INSERT INTO conversations (user_id) VALUES ($1) RETURNING *`,
      [userId],
    );
    return rows[0]!;
  },

  async findById(id: string): Promise<Conversation | null> {
    const { rows } = await pool.query<Conversation>("SELECT * FROM conversations WHERE id = $1", [id]);
    return rows[0] ?? null;
  },

  async listByUser(userId: string): Promise<Conversation[]> {
    const { rows } = await pool.query<Conversation>(
      `SELECT * FROM conversations WHERE user_id = $1 ORDER BY fecha_inicio DESC`,
      [userId],
    );
    return rows;
  },

  async updateEstado(id: string, estado: ConversationEstado): Promise<void> {
    await pool.query("UPDATE conversations SET estado = $1, updated_at = now() WHERE id = $2", [estado, id]);
  },
};
