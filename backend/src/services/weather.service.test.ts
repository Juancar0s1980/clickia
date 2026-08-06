import { env } from "../config/env";
import { weatherService } from "./weather.service";

function mockFetchOnce(response: { ok: boolean; status?: number; json?: () => Promise<unknown> }) {
  const fetchSpy = jest.fn().mockResolvedValue(response);
  global.fetch = fetchSpy as unknown as typeof fetch;
  return fetchSpy;
}

describe("weatherService.getCurrent", () => {
  const originalWeatherEnabled = env.weatherEnabled;
  const originalFetch = global.fetch;

  afterEach(() => {
    env.weatherEnabled = originalWeatherEnabled;
    global.fetch = originalFetch;
  });

  it("devuelve null sin llamar a la red cuando el clima está desactivado (comportamiento en tests)", async () => {
    env.weatherEnabled = false;
    const fetchSpy = jest.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;

    const result = await weatherService.getCurrent("Centro-disabled");

    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("mapea la respuesta de Open-Meteo y marca como severa una tormenta eléctrica", async () => {
    env.weatherEnabled = true;
    mockFetchOnce({
      ok: true,
      json: async () => ({ current: { temperature_2m: 18.2, precipitation: 12.5, weather_code: 95 } }),
    });

    const result = await weatherService.getCurrent("Timbío-storm");

    expect(result).toMatchObject({
      zone: "Timbío-storm",
      temperatureC: 18.2,
      precipitationMm: 12.5,
      weatherCode: 95,
      description: "tormenta eléctrica",
      isSevere: true,
    });
  });

  it("no marca como severo el cielo despejado", async () => {
    env.weatherEnabled = true;
    mockFetchOnce({
      ok: true,
      json: async () => ({ current: { temperature_2m: 20, precipitation: 0, weather_code: 0 } }),
    });

    const result = await weatherService.getCurrent("Centro-clear");

    expect(result?.isSevere).toBe(false);
    expect(result?.description).toBe("cielo despejado");
  });

  it("se degrada a null (sin lanzar) si Open-Meteo responde con error HTTP", async () => {
    env.weatherEnabled = true;
    mockFetchOnce({ ok: false, status: 500 });

    const result = await weatherService.getCurrent("Centro-http-error");

    expect(result).toBeNull();
  });

  it("se degrada a null (sin lanzar) si la petición de red falla", async () => {
    env.weatherEnabled = true;
    global.fetch = jest.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;

    const result = await weatherService.getCurrent("Centro-network-error");

    expect(result).toBeNull();
  });

  it("reintenta una vez si Open-Meteo responde 429 (rate limit) y usa el resultado del reintento", async () => {
    env.weatherEnabled = true;
    const fetchSpy = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ current: { temperature_2m: 21, precipitation: 0, weather_code: 2 } }),
      });
    global.fetch = fetchSpy as unknown as typeof fetch;

    const result = await weatherService.getCurrent("Centro-retry-429");

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({ zone: "Centro-retry-429", temperatureC: 21 });
  });

  it("se degrada a null si Open-Meteo sigue en 429 tras el reintento", async () => {
    env.weatherEnabled = true;
    const fetchSpy = jest.fn().mockResolvedValue({ ok: false, status: 429 });
    global.fetch = fetchSpy as unknown as typeof fetch;

    const result = await weatherService.getCurrent("Centro-still-429");

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(result).toBeNull();
  });

  it("cachea el resultado por zona: pedidos repetidos no vuelven a llamar a la red", async () => {
    env.weatherEnabled = true;
    const fetchSpy = mockFetchOnce({
      ok: true,
      json: async () => ({ current: { temperature_2m: 19, precipitation: 0, weather_code: 1 } }),
    });

    await weatherService.getCurrent("Centro-cache");
    await weatherService.getCurrent("Centro-cache");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
