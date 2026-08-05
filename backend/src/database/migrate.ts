import fs from "node:fs";
import path from "node:path";
import { pool } from "../config/database";

const MIGRATIONS_DIR = path.join(__dirname, "migrations");
const SEEDS_DIR = path.join(__dirname, "seeds");

async function ensureTrackingTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename    TEXT PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function appliedFilenames(): Promise<Set<string>> {
  const { rows } = await pool.query<{ filename: string }>("SELECT filename FROM schema_migrations");
  return new Set(rows.map((r) => r.filename));
}

async function applyDirectory(dir: string, applied: Set<string>): Promise<void> {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }
    const sql = fs.readFileSync(path.join(dir, file), "utf-8");
    console.log(`Applying ${path.basename(dir)}/${file}...`);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}

async function main(): Promise<void> {
  const runSeeds = process.argv.includes("--seed");

  await ensureTrackingTable();
  const applied = await appliedFilenames();

  await applyDirectory(MIGRATIONS_DIR, applied);
  console.log("Migrations up to date.");

  if (runSeeds) {
    const appliedAfterMigrations = await appliedFilenames();
    await applyDirectory(SEEDS_DIR, appliedAfterMigrations);
    console.log("Seeds up to date.");
  }

  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
