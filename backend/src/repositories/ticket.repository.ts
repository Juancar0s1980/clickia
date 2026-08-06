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

  // El admin puede cambiar solo el estado, o cambiarlo junto con una respuesta escrita
  // para el cliente. Si respuesta es undefined, se deja intacta la que ya hubiera.
  async respond(id: string, estado: TicketEstado, respuesta?: string): Promise<Ticket | null> {
    const { rows } = await pool.query<Ticket>(
      `UPDATE tickets
       SET estado = $1,
           respuesta = COALESCE($2, respuesta),
           fecha_respuesta = CASE WHEN $2 IS NOT NULL THEN now() ELSE fecha_respuesta END,
           updated_at = now()
       WHERE id = $3
       RETURNING *`,
      [estado, respuesta ?? null, id],
    );
    return rows[0] ?? null;
  },
};
