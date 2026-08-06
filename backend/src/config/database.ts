import { Pool } from "pg";
import { env } from "./env";
import { logger } from "./logger";

// Los proveedores de Postgres gestionado (Render, Neon, Supabase, etc.) casi siempre
// exigen TLS, con certificados que Node no valida por defecto (no son de una CA publica
// conocida). `rejectUnauthorized: false` sigue cifrando la conexion, solo no valida la
// cadena de certificados -- el compromiso estandar para estos proveedores. En local
// (Postgres via Docker) no hace falta, por eso solo se activa en produccion.
export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.nodeEnv === "production" ? { rejectUnauthorized: false } : undefined,
});

pool.on("error", (err) => {
  logger.error({ err }, "unexpected error on idle database client");
});
