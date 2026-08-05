import { pool } from "../config/database";
import { Message, MessageSender } from "../models/message.model";

export const messageRepository = {
  async create(conversationId: string, sender: MessageSender, message: string): Promise<Message> {
    const { rows } = await pool.query<Message>(
      `INSERT INTO messages (conversation_id, sender, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [conversationId, sender, message],
    );
    return rows[0]!;
  },

  async listByConversation(conversationId: string): Promise<Message[]> {
    const { rows } = await pool.query<Message>(
      `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY "timestamp" ASC`,
      [conversationId],
    );
    return rows;
  },
};
