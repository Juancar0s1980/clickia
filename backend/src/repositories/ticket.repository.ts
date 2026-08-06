import { pool } from "../config/database";
import { Ticket, TicketEstado, TicketPrioridad } from "../models/ticket.model";

export interface TicketWithUser extends Ticket {
  user_nombre: string;
  user_email: string;
}

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

  async findAllWithUser(): Promise<TicketWithUser[]> {
    const { rows } = await pool.query<TicketWithUser>(
      `SELECT t.*, u.nombre AS user_nombre, u.email AS user_email
       FROM tickets t
       JOIN users u ON u.id = t.user_id
       ORDER BY t.fecha_creacion DESC`,
    );
    return rows;
  },

  async updateEstado(id: string, estado: TicketEstado): Promise<Ticket | null> {
    const { rows } = await pool.query<Ticket>(
      `UPDATE tickets SET estado = $1, updated_at = now() WHERE id = $2 RETURNING *`,
      [estado, id],
    );
    return rows[0] ?? null;
  },
};
