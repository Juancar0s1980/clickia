// Crea (o promueve a admin, si ya existe) el usuario administrador inicial.
// Las credenciales nunca van en el codigo: se leen de variables de entorno.
//
// Uso:
//   ADMIN_EMAIL=admin@clickia.com ADMIN_PASSWORD=... ADMIN_NOMBRE="Admin ClickIA" \
//     npm run create-admin
import { pool } from "../src/config/database";
import { userRepository } from "../src/repositories/user.repository";
import { hashPassword } from "../src/utils/password";

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const nombre = process.env.ADMIN_NOMBRE ?? "Administrador";

  if (!email || !password) {
    console.error("Uso: ADMIN_EMAIL=... ADMIN_PASSWORD=... [ADMIN_NOMBRE=...] npm run create-admin");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("ADMIN_PASSWORD debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  const existing = await userRepository.findByEmail(email);

  if (existing) {
    await userRepository.setRole(existing.id, "admin");
    console.log(`Usuario existente '${email}' promovido a admin.`);
  } else {
    const passwordHash = await hashPassword(password);
    // El admin no es cliente del ISP, no aplica una direccion de instalacion.
    await userRepository.create({ nombre, email, passwordHash, direccion: "", role: "admin" });
    console.log(`Usuario admin '${email}' creado.`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error("No se pudo crear/promover el admin:", err);
  process.exit(1);
});
