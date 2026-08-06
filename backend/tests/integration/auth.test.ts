import request from "supertest";
import { app, registerAndLogin } from "../helpers/testClient";

describe("Autenticación", () => {
  it("registra un usuario nuevo y no expone el password_hash", async () => {
    const email = `nuevo.${Date.now()}@example.com`;

    const res = await request(app)
      .post("/api/users")
      .send({ nombre: "Ana Pérez", email, password: "clave12345" })
      .expect(201);

    expect(res.body.user).toMatchObject({ nombre: "Ana Pérez", email });
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it("rechaza el registro con email duplicado", async () => {
    const { email } = await registerAndLogin("dup");

    const res = await request(app)
      .post("/api/users")
      .send({ nombre: "Otro", email, password: "clave12345" })
      .expect(409);

    expect(res.body.error).toMatch(/ya existe/i);
  });

  it("rechaza datos de registro inválidos", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ nombre: "X", email: "no-es-un-correo", password: "123" })
      .expect(400);

    expect(res.body.error).toBeDefined();
  });

  it("inicia sesión con credenciales correctas", async () => {
    const email = `login.${Date.now()}@example.com`;
    const password = "clave12345";
    await request(app).post("/api/users").send({ nombre: "Login Test", email, password }).expect(201);

    const res = await request(app).post("/api/auth/login").send({ email, password }).expect(200);

    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.refreshToken).toEqual(expect.any(String));
    expect(res.body.user.email).toBe(email);
  });

  it("rechaza login con contraseña incorrecta", async () => {
    const { email } = await registerAndLogin("badpass");

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "contraseña-incorrecta" })
      .expect(401);

    expect(res.body.error).toMatch(/credenciales/i);
  });

  it("rota el refresh token y revoca el anterior", async () => {
    const { refreshToken } = await registerAndLogin("refresh");

    const refreshed = await request(app).post("/api/auth/refresh").send({ refreshToken }).expect(200);
    expect(refreshed.body.accessToken).toEqual(expect.any(String));
    expect(refreshed.body.refreshToken).not.toBe(refreshToken);

    // El refresh token original ya fue revocado: reutilizarlo debe fallar.
    await request(app).post("/api/auth/refresh").send({ refreshToken }).expect(401);
  });

  it("protege rutas privadas sin token", async () => {
    await request(app).get("/api/conversations").expect(401);
  });

  describe("Cambio de contraseña", () => {
    it("rechaza el cambio sin autenticación", async () => {
      await request(app)
        .patch("/api/users/me/password")
        .send({ currentPassword: "x", newPassword: "clave67890" })
        .expect(401);
    });

    it("rechaza la contraseña actual incorrecta", async () => {
      const { accessToken } = await registerAndLogin("changepass-wrong");

      const res = await request(app)
        .patch("/api/users/me/password")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ currentPassword: "no-es-la-actual", newPassword: "clave67890" })
        .expect(401);

      expect(res.body.error).toMatch(/no es correcta/i);
    });

    it("cambia la contraseña y permite iniciar sesión con la nueva", async () => {
      const { email, accessToken } = await registerAndLogin("changepass-ok");

      await request(app)
        .patch("/api/users/me/password")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ currentPassword: "clave12345", newPassword: "clave67890" })
        .expect(204);

      await request(app).post("/api/auth/login").send({ email, password: "clave12345" }).expect(401);
      await request(app).post("/api/auth/login").send({ email, password: "clave67890" }).expect(200);
    });
  });
});
