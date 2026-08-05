import request from "supertest";
import { createApp } from "../../src/app";
import { pool } from "../../src/config/database";

export const app = createApp();

// Cada archivo de test tiene su propio registro de modulos (y por lo tanto su propia
// instancia de `pool`); sin cerrarlo, Jest queda con el handle de conexion abierto.
afterAll(async () => {
  await pool.end();
});

interface RegisteredUser {
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
}

function uniqueEmail(prefix: string): string {
  return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`;
}

export async function registerAndLogin(prefix = "user"): Promise<RegisteredUser> {
  const email = uniqueEmail(prefix);
  const password = "clave12345";

  await request(app).post("/api/users").send({ nombre: "Usuario de Prueba", email, password }).expect(201);

  const loginRes = await request(app).post("/api/auth/login").send({ email, password }).expect(200);

  return {
    email,
    password,
    accessToken: loginRes.body.accessToken,
    refreshToken: loginRes.body.refreshToken,
    userId: loginRes.body.user.id,
  };
}
