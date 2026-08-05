import request from "supertest";
import { app, registerAndLogin, registerAndLoginAsAdmin } from "../helpers/testClient";

describe("Admin", () => {
  it("rechaza el acceso a rutas de admin sin autenticación", async () => {
    await request(app).get("/api/admin/users").expect(401);
  });

  it("rechaza el acceso a rutas de admin a un usuario normal", async () => {
    const { accessToken } = await registerAndLogin("plain");

    const res = await request(app).get("/api/admin/users").set("Authorization", `Bearer ${accessToken}`).expect(403);

    expect(res.body.error).toMatch(/administrador/i);
  });

  it("permite a un admin registrar un usuario con tipo de servicio y lo lista", async () => {
    const admin = await registerAndLoginAsAdmin("owner-admin");
    const email = `cliente.${Date.now()}@example.com`;

    const created = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ nombre: "Cliente Nuevo", email, password: "clave12345", tipoServicio: "tv" })
      .expect(201);

    expect(created.body.user.tipo_servicio).toBe("tv");
    expect(created.body.user.role).toBe("user");
    expect(created.body.user.password_hash).toBeUndefined();

    const list = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .expect(200);
    expect(list.body.users.some((u: { email: string }) => u.email === email)).toBe(true);
  });

  it("rechaza un tipo de servicio inválido", async () => {
    const admin = await registerAndLoginAsAdmin("invalid-service");

    const res = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({
        nombre: "Cliente",
        email: `x.${Date.now()}@example.com`,
        password: "clave12345",
        tipoServicio: "satelital",
      })
      .expect(400);

    expect(res.body.error).toBeDefined();
  });

  it("permite a un admin ver las conversaciones y el detalle de cualquier usuario", async () => {
    const admin = await registerAndLoginAsAdmin("viewer-admin");
    const customer = await registerAndLogin("customer");

    const chat = await request(app)
      .post("/api/chat")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ message: "No tengo internet", zone: "Centro" })
      .expect(200);

    const conversations = await request(app)
      .get(`/api/admin/users/${customer.userId}/conversations`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .expect(200);
    expect(conversations.body.conversations[0].id).toBe(chat.body.conversation.id);

    const detail = await request(app)
      .get(`/api/admin/conversations/${chat.body.conversation.id}`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .expect(200);
    expect(detail.body.messages).toHaveLength(2);
  });

  it("permite a un admin actualizar el estado de una zona y el chat lo refleja de inmediato", async () => {
    const admin = await registerAndLoginAsAdmin("network-admin");
    const customer = await registerAndLogin("network-customer");

    await request(app)
      .patch("/api/admin/network-status/Norte")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ status: "falla", estimatedTime: "45 minutos" })
      .expect(200);

    const list = await request(app)
      .get("/api/admin/network-status")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .expect(200);
    expect(list.body.statuses.find((s: { zone: string }) => s.zone === "Norte")).toMatchObject({
      status: "falla",
      estimated_time: "45 minutos",
    });

    const chat = await request(app)
      .post("/api/chat")
      .set("Authorization", `Bearer ${customer.accessToken}`)
      .send({ message: "No tengo internet", zone: "Norte" })
      .expect(200);
    expect(chat.body.networkStatus).toMatchObject({ zone: "Norte", status: "falla", estimated_time: "45 minutos" });
  });
});
