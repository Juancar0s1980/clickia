import request from "supertest";
import { createApp } from "../../src/app";
import { pool } from "../../src/config/database";
import { userRepository } from "../../src/repositories/user.repository";

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

  await request(app)
    .post("/api/users")
    .send({ nombre: "Usuario de Prueba", email, password, direccion: "Calle 5 # 10-20, Popayán", aceptoDatos: true })
    .expect(201);

  const loginRes = await request(app).post("/api/auth/login").send({ email, password }).expect(200);

  return {
    email,
    password,
    accessToken: loginRes.body.accessToken,
    refreshToken: loginRes.body.refreshToken,
    userId: loginRes.body.user.id,
  };
}

// No hay endpoint HTTP para volverse admin (a proposito: eso se hace con
// `npm run create-admin`, fuera del flujo publico). Para probar rutas de
// admin, se promueve directo en la BD y se vuelve a iniciar sesion, porque
// el rol viaja embebido en el JWT emitido al hacer login.
export async function registerAndLoginAsAdmin(prefix = "admin"): Promise<RegisteredUser> {
  const user = await registerAndLogin(prefix);
  await userRepository.setRole(user.userId, "admin");

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: user.email, password: user.password })
    .expect(200);

  return { ...user, accessToken: loginRes.body.accessToken, refreshToken: loginRes.body.refreshToken };
}
