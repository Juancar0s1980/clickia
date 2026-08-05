import { pool } from "../config/database";
import { TechnicalProblem } from "../models/technicalProblem.model";

export const technicalProblemRepository = {
  async findAll(): Promise<TechnicalProblem[]> {
    const { rows } = await pool.query<TechnicalProblem>("SELECT * FROM technical_problems ORDER BY nombre");
    return rows;
  },

  async findById(id: string): Promise<TechnicalProblem | null> {
    const { rows } = await pool.query<TechnicalProblem>(
      "SELECT * FROM technical_problems WHERE id = $1",
      [id],
    );
    return rows[0] ?? null;
  },
};
