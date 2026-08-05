import request from "supertest";
import { app } from "../helpers/testClient";

describe("API ISP simulada", () => {
  it("devuelve el estado sembrado para una zona conocida", async () => {
    const res = await request(app).get("/api/network/status").query({ zone: "Centro" }).expect(200);
    expect(res.body).toEqual({
      zone: "Centro",
      service: "internet",
      status: "mantenimiento",
      estimated_time: "30 minutos",
    });
  });

  it("no requiere autenticación", async () => {
    await request(app).get("/api/network/status").query({ zone: "Norte" }).expect(200);
  });

  it("usa un valor por defecto cuando no se indica zona", async () => {
    const res = await request(app).get("/api/network/status").expect(200);
    expect(res.body.status).toBe("operativo");
  });
});
