import request from "supertest";
import { app, registerAndLogin } from "../helpers/testClient";

describe("Tickets", () => {
  it("rechaza la creación de tickets sin autenticación", async () => {
    await request(app).post("/api/tickets").send({ descripcion: "Sin sesión iniciada" }).expect(401);
  });

  it("rechaza una descripción demasiado corta", async () => {
    const { accessToken } = await registerAndLogin("ticket-invalid");

    const res = await request(app)
      .post("/api/tickets")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ descripcion: "corto" })
      .expect(400);

    expect(res.body.error).toBeDefined();
  });

  it("crea un ticket con número correlativo y prioridad por defecto", async () => {
    const { accessToken } = await registerAndLogin("ticket-basic");

    const res = await request(app)
      .post("/api/tickets")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ descripcion: "El internet sigue caído después de reiniciar el router." })
      .expect(201);

    expect(res.body.ticket.ticket_number).toMatch(/^TCK-\d{6}$/);
    expect(res.body.ticket.estado).toBe("abierto");
    expect(res.body.ticket.prioridad).toBe("media");
  });

  it("al crear un ticket ligado a una conversación, la escala", async () => {
    const { accessToken } = await registerAndLogin("ticket-escala");

    const chat = await request(app)
      .post("/api/chat")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ message: "No tengo internet", zone: "Centro" })
      .expect(200);
    const conversationId = chat.body.conversation.id;

    await request(app)
      .post("/api/tickets")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ conversationId, descripcion: "El diagnóstico automático no resolvió el problema.", prioridad: "alta" })
      .expect(201);

    const detail = await request(app)
      .get(`/api/conversations/${conversationId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(detail.body.conversation.estado).toBe("escalada");
  });

  it("lista solo los tickets del usuario autenticado", async () => {
    const owner = await registerAndLogin("ticket-owner");
    const other = await registerAndLogin("ticket-other");

    await request(app)
      .post("/api/tickets")
      .set("Authorization", `Bearer ${owner.accessToken}`)
      .send({ descripcion: "Ticket del propietario para esta prueba." })
      .expect(201);

    const otherList = await request(app)
      .get("/api/tickets")
      .set("Authorization", `Bearer ${other.accessToken}`)
      .expect(200);

    expect(otherList.body.tickets).toHaveLength(0);
  });
});
