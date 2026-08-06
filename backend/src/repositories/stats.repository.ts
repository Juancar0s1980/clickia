import { pool } from "../config/database";

export interface AdminSummary {
  totalUsers: number;
  totalConversations: number;
  totalTickets: number;
  openTickets: number;
}

export const statsRepository = {
  async getSummary(): Promise<AdminSummary> {
    const { rows } = await pool.query<{
      total_users: string;
      total_conversations: string;
      total_tickets: string;
      open_tickets: string;
    }>(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'user') AS total_users,
        (SELECT COUNT(*) FROM conversations) AS total_conversations,
        (SELECT COUNT(*) FROM tickets) AS total_tickets,
        (SELECT COUNT(*) FROM tickets WHERE estado IN ('abierto', 'en_proceso')) AS open_tickets
    `);
    const row = rows[0]!;
    return {
      totalUsers: Number(row.total_users),
      totalConversations: Number(row.total_conversations),
      totalTickets: Number(row.total_tickets),
      openTickets: Number(row.open_tickets),
    };
  },
};
