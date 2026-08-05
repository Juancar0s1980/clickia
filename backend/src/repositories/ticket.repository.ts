import { pool } from "../config/database";
import { Ticket, TicketPrioridad } from "../models/ticket.model";

export const ticketRepository = {
  async create(input: {
    userId: string;
    conversationId: string | null;
    descripcion: string;
    prioridad: TicketPrioridad;
  }): Promise<Ticket> {
    const { rows } = await pool.query<Ticket>(
      `INSERT INTO tickets (user_id, conversation_id, descripcion, prioridad)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.userId, input.conversationId, input.descripcion, input.prioridad],
    );
    return rows[0]!;
  },

  async listByUser(userId: string): Promise<Ticket[]> {
    const { rows } = await pool.query<Ticket>(
      `SELECT * FROM tickets WHERE user_id = $1 ORDER BY fecha_creacion DESC`,
      [userId],
    );
    return rows;
  },
};
