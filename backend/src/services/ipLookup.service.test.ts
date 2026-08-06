import { env } from "../config/env";
import { ipLookupService } from "./ipLookup.service";

function mockFetchOnce(response: { ok: boolean; status?: number; json?: () => Promise<unknown> }) {
  const fetchSpy = jest.fn().mockResolvedValue(response);
  global.fetch = fetchSpy as unknown as typeof fetch;
  return fetchSpy;
}

describe("ipLookupService.getInfo", () => {
  const originalIpLookupEnabled = env.ipLookupEnabled;
  const originalFetch = global.fetch;

  afterEach(() => {
    env.ipLookupEnabled = originalIpLookupEnabled;
    global.fetch = originalFetch;
  });

  it("devuelve null sin llamar a la red cuando está desactivado (comportamiento en tests)", async () => {
    env.ipLookupEnabled = false;
    const fetchSpy = jest.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;

    const result = await ipLookupService.getInfo("8.8.8.8");

    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it.each(["127.0.0.1", "10.0.0.5", "192.168.1.20", "172.20.0.3", "::1"])(
    "descarta IPs privadas/locales sin llamar a la red: %s",
    async (ip) => {
      env.ipLookupEnabled = true;
      const fetchSpy = jest.fn();
      global.fetch = fetchSpy as unknown as typeof fetch;

      const result = await ipLookupService.getInfo(ip);

      expect(result).toBeNull();
      expect(fetchSpy).not.toHaveBeenCalled();
    },
  );

  it("mapea la respuesta exitosa de ip-api.com", async () => {
    env.ipLookupEnabled = true;
    mockFetchOnce({
      ok: true,
      json: async () => ({
        status: "success",
        isp: "Comcast Cable",
        org: "Comcast",
        as: "AS7922 Comcast Cable Communications",
        city: "Ashburn",
      }),
    });

    const result = await ipLookupService.getInfo("34.1.2.3-test-success");

    expect(result).toMatchObject({
      isp: "Comcast Cable",
      org: "Comcast",
      asn: "AS7922 Comcast Cable Communications",
      city: "Ashburn",
    });
  });

  it("devuelve null cuando ip-api.com responde status:fail (ej. IP reservada)", async () => {
    env.ipLookupEnabled = true;
    mockFetchOnce({
      ok: true,
      json: async () => ({ status: "fail", message: "reserved range" }),
    });

    const result = await ipLookupService.getInfo("34.1.2.3-test-fail");

    expect(result).toBeNull();
  });

  it("se degrada a null (sin lanzar) si ip-api.com responde con error HTTP", async () => {
    env.ipLookupEnabled = true;
    mockFetchOnce({ ok: false, status: 500 });

    const result = await ipLookupService.getInfo("34.1.2.3-test-http-error");

    expect(result).toBeNull();
  });

  it("se degrada a null (sin lanzar) si la petición de red falla", async () => {
    env.ipLookupEnabled = true;
    global.fetch = jest.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;

    const result = await ipLookupService.getInfo("34.1.2.3-test-network-error");

    expect(result).toBeNull();
  });

  it("cachea el resultado por IP: pedidos repetidos no vuelven a llamar a la red", async () => {
    env.ipLookupEnabled = true;
    const fetchSpy = mockFetchOnce({
      ok: true,
      json: async () => ({ status: "success", isp: "Claro", org: "Claro", as: "AS3816", city: "Popayán" }),
    });

    await ipLookupService.getInfo("34.1.2.3-test-cache");
    await ipLookupService.getInfo("34.1.2.3-test-cache");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
