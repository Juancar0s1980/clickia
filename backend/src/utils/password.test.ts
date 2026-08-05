import { comparePassword, hashPassword } from "./password";

describe("password", () => {
  it("genera un hash distinto al texto plano y lo verifica correctamente", async () => {
    const hash = await hashPassword("clave12345");

    expect(hash).not.toBe("clave12345");
    await expect(comparePassword("clave12345", hash)).resolves.toBe(true);
  });

  it("rechaza una contraseña incorrecta contra el hash", async () => {
    const hash = await hashPassword("clave12345");
    await expect(comparePassword("otra-clave", hash)).resolves.toBe(false);
  });
});
