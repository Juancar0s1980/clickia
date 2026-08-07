// Borra permanentemente las cuentas de prueba (email en el dominio reservado @example.com,
// RFC 2606 -- ningun cliente real puede tener ese dominio) usadas para probar features durante
// el desarrollo. Por defecto es un dry-run (solo lista lo que borraria); solo borra de verdad
// con --confirm. Respeta el orden de las FK (tickets/refresh_tokens son ON DELETE RESTRICT,
// conversations cascada a messages/diagnostics).
//
// Uso:
//   DATABASE_URL=... npm run cleanup-test-users               (dry-run: solo lista)
//   DATABASE_URL=... npm run cleanup-test-users -- --confirm  (borra de verdad)
import { pool } from "../src/config/database";

const TEST_EMAIL_PATTERN = "%@example.com";

async function main(): Promise<void> {
  const confirm = process.argv.includes("--confirm");

  const { rows: candidates } = await pool.query<{
    id: string;
    nombre: string;
    email: string;
    fecha_creacion: string;
  }>(
    `SELECT id, nombre, email, fecha_creacion FROM users
     WHERE email LIKE $1 AND role = 'user'
     ORDER BY fecha_creacion`,
    [TEST_EMAIL_PATTERN],
  );

  if (candidates.length === 0) {
    console.log("No hay cuentas de prueba (@example.com) para borrar.");
    await pool.end();
    return;
  }

  console.log(`${candidates.length} cuenta(s) de prueba encontradas:\n`);
  for (const u of candidates) {
    console.log(`  - ${u.nombre} <${u.email}> (creado ${u.fecha_creacion})`);
  }

  if (!confirm) {
    console.log("\nEsto fue un dry-run: no se borro nada. Vuelve a correr con --confirm para borrar de verdad.");
    await pool.end();
    return;
  }

  const ids = candidates.map((u) => u.id);
  await pool.query("BEGIN");
  try {
    await pool.query("DELETE FROM tickets WHERE user_id = ANY($1)", [ids]);
    await pool.query("DELETE FROM refresh_tokens WHERE user_id = ANY($1)", [ids]);
    // Cascada automatica a messages y diagnostics (ON DELETE CASCADE en esas tablas).
    await pool.query("DELETE FROM conversations WHERE user_id = ANY($1)", [ids]);
    await pool.query("DELETE FROM users WHERE id = ANY($1)", [ids]);
    await pool.query("COMMIT");
    console.log(`\n${candidates.length} cuenta(s) de prueba borradas permanentemente.`);
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }

  await pool.end();
}

main().catch((err) => {
  console.error("No se pudo limpiar las cuentas de prueba:", err);
  process.exit(1);
});
