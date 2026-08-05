import { signAccessToken, verifyAccessToken } from "./jwt";

describe("jwt", () => {
  it("firma y verifica un token de acceso, recuperando el payload original", () => {
    const token = signAccessToken({ sub: "user-123", email: "user@example.com", role: "user" });
    const payload = verifyAccessToken(token);

    expect(payload.sub).toBe("user-123");
    expect(payload.email).toBe("user@example.com");
    expect(payload.role).toBe("user");
  });

  it("conserva el rol de administrador en el payload", () => {
    const token = signAccessToken({ sub: "admin-1", email: "admin@example.com", role: "admin" });
    expect(verifyAccessToken(token).role).toBe("admin");
  });

  it("lanza un error al verificar un token inválido", () => {
    expect(() => verifyAccessToken("token-que-no-existe")).toThrow();
  });
});
