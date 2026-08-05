import { Pool } from "pg";
import { env } from "./env";
import { logger } from "./logger";

export const pool = new Pool({
  connectionString: env.databaseUrl,
});

pool.on("error", (err) => {
  logger.error({ err }, "unexpected error on idle database client");
});
