import { pool } from "../config/database";
import { Solution } from "../models/solution.model";

export const solutionRepository = {
  async findByProblemId(problemId: string): Promise<Solution[]> {
    const { rows } = await pool.query<Solution>(
      "SELECT * FROM solutions WHERE problem_id = $1",
      [problemId],
    );
    return rows;
  },
};
