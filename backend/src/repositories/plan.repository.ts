import { pool } from "../config/database";
import { Plan } from "../models/plan.model";

export const planRepository = {
  async findAllActive(): Promise<Plan[]> {
    const { rows } = await pool.query<Plan>(
      "SELECT * FROM plans WHERE activo = true ORDER BY numero",
    );
    return rows;
  },
};
