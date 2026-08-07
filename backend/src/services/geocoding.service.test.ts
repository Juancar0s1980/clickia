import { env } from "../config/env";
import { geocodingService } from "./geocoding.service";

function mockFetchOnce(response: { ok: boolean; status?: number; json?: () => Promise<unknown> }) {
  const fetchSpy = jest.fn().mockResolvedValue(response);
  global.fetch = fetchSpy as unknown as typeof fetch;
  return fetchSpy;
}

describe("geocodingService.geocodeAddress", () => {
  const originalGeocodingEnabled = env.geocodingEnabled;
  const originalOpencageApiKey = env.opencageApiKey;
  const originalFetch = global.fetch;

  afterEach(() => {
    env.geocodingEnabled = originalGeocodingEnabled;
    env.opencageApiKey = originalOpencageApiKey;
    global.fetch = originalFetch;
  });

  it("devuelve null sin llamar a la red si esta desactivado por env var (comportamiento en tests)", async () => {
    env.geocodingEnabled = false;
    env.opencageApiKey = "fake-key";
    const fetchSpy = jest.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;

    const result = await geocodingService.geocodeAddress("Calle 5 # 10-20", "Centro");

    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("devuelve null sin llamar a la red si no hay API key configurada", async () => {
    env.geocodingEnabled = true;
    env.opencageApiKey = "";
    const fetchSpy = jest.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;

    const result = await geocodingService.geocodeAddress("Calle 5 # 10-20", "Centro");

    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("mapea el primer resultado de OpenCage a lat/lon/direccion formateada/confianza", async () => {
    env.geocodingEnabled = true;
    env.opencageApiKey = "fake-key";
    const fetchSpy = mockFetchOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            formatted: "Calle 5 #10-20, Popayán, Cauca, Colombia",
            confidence: 8,
            geometry: { lat: 2.4448, lng: -76.6147 },
          },
        ],
      }),
    });

    const result = await geocodingService.geocodeAddress("Calle 5 # 10-20", "Centro");

    expect(result).toEqual({
      lat: 2.4448,
      lon: -76.6147,
      formattedAddress: "Calle 5 #10-20, Popayán, Cauca, Colombia",
      confidence: 8,
    });
    const calledUrl = fetchSpy.mock.calls[0][0] as string;
    expect(calledUrl).toContain("Popay%C3%A1n");
    expect(calledUrl).not.toContain("Timb%C3%ADo");
  });

  it("usa Timbío como municipio cuando la zona es Timbío", async () => {
    env.geocodingEnabled = true;
    env.opencageApiKey = "fake-key";
    const fetchSpy = mockFetchOnce({
      ok: true,
      json: async () => ({
        results: [{ formatted: "Timbío, Cauca, Colombia", confidence: 6, geometry: { lat: 2.3536, lng: -76.6822 } }],
      }),
    });

    await geocodingService.geocodeAddress("Vereda El Tablón", "Timbío");

    const calledUrl = fetchSpy.mock.calls[0][0] as string;
    expect(calledUrl).toContain("Timb%C3%ADo");
  });

  it("se degrada a null (sin lanzar) si OpenCage no encuentra resultados", async () => {
    env.geocodingEnabled = true;
    env.opencageApiKey = "fake-key";
    mockFetchOnce({ ok: true, json: async () => ({ results: [] }) });

    const result = await geocodingService.geocodeAddress("dirección sin sentido asdkjh", "Centro");

    expect(result).toBeNull();
  });

  it("se degrada a null (sin lanzar) si OpenCage responde con error HTTP", async () => {
    env.geocodingEnabled = true;
    env.opencageApiKey = "fake-key";
    mockFetchOnce({ ok: false, status: 401 });

    const result = await geocodingService.geocodeAddress("Calle 5 # 10-20", "Centro");

    expect(result).toBeNull();
  });

  it("se degrada a null (sin lanzar) si la petición de red falla", async () => {
    env.geocodingEnabled = true;
    env.opencageApiKey = "fake-key";
    global.fetch = jest.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;

    const result = await geocodingService.geocodeAddress("Calle 5 # 10-20", "Centro");

    expect(result).toBeNull();
  });
});
