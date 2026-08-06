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
      .send({
        nombre: "Cliente Nuevo",
        email,
        password: "clave12345",
        direccion: "Carrera 9 # 4-30, Popayán",
        tipoServicio: "tv",
      })
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
        direccion: "Carrera 9 # 4-30, Popayán",
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

  describe("Carga masiva de usuarios", () => {
    it("rechaza a un usuario normal", async () => {
      const { accessToken } = await registerAndLogin("bulk-plain");
      await request(app)
        .post("/api/admin/users/bulk")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ rows: [] })
        .expect(403);
    });

    it("crea las filas válidas y reporta las inválidas por separado", async () => {
      const admin = await registerAndLoginAsAdmin("bulk-admin");
      const dupEmail = `bulk.dup.${Date.now()}@example.com`;

      const res = await request(app)
        .post("/api/admin/users/bulk")
        .set("Authorization", `Bearer ${admin.accessToken}`)
        .send({
          rows: [
            {
              nombre: "Cliente Uno",
              email: `bulk.uno.${Date.now()}@example.com`,
              password: "clave12345",
              direccion: "Calle 1 # 2-30, Popayán",
              tipoServicio: "wifi",
            },
            { nombre: "Cliente Dos", email: dupEmail, password: "clave12345", direccion: "Calle 1 # 2-30, Popayán", tipoServicio: "tv" },
            {
              nombre: "Cliente Dos Repetido",
              email: dupEmail,
              password: "clave12345",
              direccion: "Calle 1 # 2-30, Popayán",
              tipoServicio: "tv",
            },
            { nombre: "X", email: "correo-invalido", password: "123", tipoServicio: "wifi" },
          ],
        })
        .expect(207);

      expect(res.body.created).toHaveLength(2);
      expect(res.body.errors).toHaveLength(2);
      expect(res.body.errors[0].email).toBe(dupEmail);
      expect(res.body.errors[1].row).toBe(4);
    });
  });

  describe("Estadísticas", () => {
    it("rechaza a un usuario normal", async () => {
      const { accessToken } = await registerAndLogin("stats-plain");
      await request(app).get("/api/admin/stats/summary").set("Authorization", `Bearer ${accessToken}`).expect(403);
    });

    it("resume totales de usuarios, conversaciones y tickets", async () => {
      const admin = await registerAndLoginAsAdmin("summary-admin");
      const customer = await registerAndLogin("summary-customer");

      await request(app)
        .post("/api/chat")
        .set("Authorization", `Bearer ${customer.accessToken}`)
        .send({ message: "No tengo internet", zone: "Centro" })
        .expect(200);
      await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${customer.accessToken}`)
        .send({ descripcion: "El internet sigue caído tras los pasos sugeridos." })
        .expect(201);

      const res = await request(app)
        .get("/api/admin/stats/summary")
        .set("Authorization", `Bearer ${admin.accessToken}`)
        .expect(200);

      expect(res.body.totalUsers).toBeGreaterThanOrEqual(2);
      expect(res.body.totalConversations).toBeGreaterThanOrEqual(1);
      expect(res.body.totalTickets).toBeGreaterThanOrEqual(1);
      expect(res.body.openTickets).toBeGreaterThanOrEqual(1);
    });

    it("cuenta el problema detectado con mayor frecuencia", async () => {
      const admin = await registerAndLoginAsAdmin("top-problems-admin");
      const customer = await registerAndLogin("top-problems-customer");

      for (let i = 0; i < 3; i++) {
        await request(app)
          .post("/api/chat")
          .set("Authorization", `Bearer ${customer.accessToken}`)
          .send({ message: "Mi router tiene una luz roja encendida", zone: "Centro" })
          .expect(200);
      }
      await request(app)
        .post("/api/chat")
        .set("Authorization", `Bearer ${customer.accessToken}`)
        .send({ message: "Mi wifi esta lento", zone: "Centro" })
        .expect(200);

      const res = await request(app)
        .get("/api/admin/stats/top-problems")
        .set("Authorization", `Bearer ${admin.accessToken}`)
        .expect(200);

      // La tabla diagnostics es compartida por toda la suite (otros archivos tambien
      // generan diagnosticos), asi que no se afirma que este sea el problema #1 global
      // -- solo que las 3 repeticiones de "luz roja" se contaron correctamente.
      const routerProblem = res.body.problems.find((p: { nombre: string }) => p.nombre === "Router con luz roja");
      expect(routerProblem).toBeDefined();
      expect(routerProblem.total).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Gestión de tickets", () => {
    it("rechaza a un usuario normal", async () => {
      const { accessToken } = await registerAndLogin("tickets-plain");
      await request(app).get("/api/admin/tickets").set("Authorization", `Bearer ${accessToken}`).expect(403);
    });

    it("lista tickets de todos los usuarios con su nombre/correo y permite cambiar el estado", async () => {
      const admin = await registerAndLoginAsAdmin("tickets-admin");
      const customer = await registerAndLogin("tickets-customer");

      const created = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${customer.accessToken}`)
        .send({ descripcion: "El internet sigue caído después de todos los pasos sugeridos." })
        .expect(201);

      const list = await request(app)
        .get("/api/admin/tickets")
        .set("Authorization", `Bearer ${admin.accessToken}`)
        .expect(200);
      const found = list.body.tickets.find((t: { id: string }) => t.id === created.body.ticket.id);
      expect(found).toMatchObject({ user_email: customer.email, estado: "abierto" });

      const updated = await request(app)
        .patch(`/api/admin/tickets/${created.body.ticket.id}`)
        .set("Authorization", `Bearer ${admin.accessToken}`)
        .send({ estado: "en_proceso" })
        .expect(200);
      expect(updated.body.ticket.estado).toBe("en_proceso");
    });

    it("responde 404 al actualizar un ticket inexistente", async () => {
      const admin = await registerAndLoginAsAdmin("tickets-404");
      await request(app)
        .patch("/api/admin/tickets/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${admin.accessToken}`)
        .send({ estado: "resuelto" })
        .expect(404);
    });

    it("permite al admin dejar una respuesta escrita junto con el cambio de estado, y el cliente la ve", async () => {
      const admin = await registerAndLoginAsAdmin("tickets-respond-admin");
      const customer = await registerAndLogin("tickets-respond-customer");

      const created = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${customer.accessToken}`)
        .send({ descripcion: "El internet sigue caído después de todos los pasos sugeridos." })
        .expect(201);

      const updated = await request(app)
        .patch(`/api/admin/tickets/${created.body.ticket.id}`)
        .set("Authorization", `Bearer ${admin.accessToken}`)
        .send({ estado: "resuelto", respuesta: "Un técnico revisó el nodo de tu zona y ya quedó operativo." })
        .expect(200);

      expect(updated.body.ticket.estado).toBe("resuelto");
      expect(updated.body.ticket.respuesta).toBe("Un técnico revisó el nodo de tu zona y ya quedó operativo.");
      expect(updated.body.ticket.fecha_respuesta).toEqual(expect.any(String));

      const list = await request(app)
        .get("/api/tickets")
        .set("Authorization", `Bearer ${customer.accessToken}`)
        .expect(200);
      const own = list.body.tickets.find((t: { id: string }) => t.id === created.body.ticket.id);
      expect(own.respuesta).toBe("Un técnico revisó el nodo de tu zona y ya quedó operativo.");
    });

    it("permite cambiar solo el estado sin borrar una respuesta ya guardada", async () => {
      const admin = await registerAndLoginAsAdmin("tickets-keep-respond-admin");
      const customer = await registerAndLogin("tickets-keep-respond-customer");

      const created = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${customer.accessToken}`)
        .send({ descripcion: "Problema de conexión" })
        .expect(201);

      await request(app)
        .patch(`/api/admin/tickets/${created.body.ticket.id}`)
        .set("Authorization", `Bearer ${admin.accessToken}`)
        .send({ estado: "resuelto", respuesta: "Ya se solucionó desde nuestro lado." })
        .expect(200);

      const closed = await request(app)
        .patch(`/api/admin/tickets/${created.body.ticket.id}`)
        .set("Authorization", `Bearer ${admin.accessToken}`)
        .send({ estado: "cerrado" })
        .expect(200);

      expect(closed.body.ticket.estado).toBe("cerrado");
      expect(closed.body.ticket.respuesta).toBe("Ya se solucionó desde nuestro lado.");
    });

    it("rechaza una respuesta vacía", async () => {
      const admin = await registerAndLoginAsAdmin("tickets-empty-respond-admin");
      const customer = await registerAndLogin("tickets-empty-respond-customer");

      const created = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${customer.accessToken}`)
        .send({ descripcion: "Problema de conexión" })
        .expect(201);

      await request(app)
        .patch(`/api/admin/tickets/${created.body.ticket.id}`)
        .set("Authorization", `Bearer ${admin.accessToken}`)
        .send({ estado: "en_proceso", respuesta: "" })
        .expect(400);
    });
  });
});
