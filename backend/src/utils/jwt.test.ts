import { signAccessToken, verifyAccessToken } from "./jwt";

describe("jwt", () => {
  it("firma y verifica un token de acceso, recuperando el payload original", () => {
    const token = signAccessToken({ sub: "user-123", email: "user@example.com" });
    const payload = verifyAccessToken(token);

    expect(payload.sub).toBe("user-123");
    expect(payload.email).toBe("user@example.com");
  });

  it("lanza un error al verificar un token inválido", () => {
    expect(() => verifyAccessToken("token-que-no-existe")).toThrow();
  });
});
