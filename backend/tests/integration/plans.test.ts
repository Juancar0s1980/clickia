import request from "supertest";
import { app, registerAndLogin } from "../helpers/testClient";

describe("Planes", () => {
  it("rechaza la consulta sin autenticación", async () => {
    await request(app).get("/api/plans").expect(401);
  });

  it("devuelve el catálogo sembrado ordenado por número, con precios reales", async () => {
    const { accessToken } = await registerAndLogin("plans");

    const res = await request(app).get("/api/plans").set("Authorization", `Bearer ${accessToken}`).expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(15);

    const numeros = res.body.map((p: { numero: number }) => p.numero);
    expect(numeros).toEqual([...numeros].sort((a, b) => a - b));

    const plan300 = res.body.find((p: { nombre: string }) => p.nombre === "Combo Internet 300 Mb + TV");
    expect(plan300.precio_mensual).toBe(100000);
    expect(plan300.categoria).toBe("doble");

    const triple450 = res.body.find((p: { nombre: string }) => p.nombre.includes("Triple Internet 450 Mb"));
    expect(triple450.precio_mensual).toBeNull();
  });
});
