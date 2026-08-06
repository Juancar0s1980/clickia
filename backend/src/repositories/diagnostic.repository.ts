import { pool } from "../config/database";
import { Diagnostic, TopProblemRow } from "../models/diagnostic.model";

export const diagnosticRepository = {
  async create(input: {
    conversationId: string;
    problemId: string | null;
    zone: string | null;
    networkStatus: string | null;
  }): Promise<Diagnostic> {
    const { rows } = await pool.query<Diagnostic>(
      `INSERT INTO diagnostics (conversation_id, problem_id, zone, network_status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.conversationId, input.problemId, input.zone, input.networkStatus],
    );
    return rows[0]!;
  },

  async topProblems(limit: number): Promise<TopProblemRow[]> {
    const { rows } = await pool.query<TopProblemRow>(
      `SELECT tp.id AS problem_id, tp.nombre, tp.categoria, COUNT(*) AS total
       FROM diagnostics d
       JOIN technical_problems tp ON tp.id = d.problem_id
       GROUP BY tp.id, tp.nombre, tp.categoria
       ORDER BY total DESC
       LIMIT $1`,
      [limit],
    );
    return rows;
  },

  async countUnresolved(): Promise<number> {
    const { rows } = await pool.query<{ total: string }>(
      "SELECT COUNT(*) AS total FROM diagnostics WHERE problem_id IS NULL",
    );
    return Number(rows[0]?.total ?? 0);
  },
};
