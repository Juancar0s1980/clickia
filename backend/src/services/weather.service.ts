import { env } from "../config/env";
import { logger } from "../config/logger";
import { withTimeout } from "./ai/withTimeout";

export interface WeatherSnapshot {
  zone: string;
  temperatureC: number;
  precipitationMm: number;
  weatherCode: number;
  description: string;
  // Lluvia fuerte / tormenta: condicion que puede explicar caidas de señal en un ISP,
  // no solo curiosidad meteorologica.
  isSevere: boolean;
}

// Coordenadas aproximadas: Popayán cubre las zonas/barrios ya sembrados (Centro, Norte,
// Sur, Occidente), y Timbío es el municipio vecino que DobleClick tambien atiende.
// A esta escala (clima regional) no hace falta precision de manzana.
const ZONE_COORDINATES: Record<string, { lat: number; lon: number }> = {
  Timbío: { lat: 2.3536, lon: -76.6822 },
};
const POPAYAN_COORDINATES = { lat: 2.4448, lon: -76.6147 };

function coordinatesForZone(zone: string): { lat: number; lon: number } {
  return ZONE_COORDINATES[zone] ?? POPAYAN_COORDINATES;
}

// Codigos WMO (weather_code) que documenta Open-Meteo, traducidos a espanol. No cubre
// nieve a fondo porque Popayán/Timbío (Cauca) no la tienen, pero se deja un fallback.
const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: "cielo despejado",
  1: "mayormente despejado",
  2: "parcialmente nublado",
  3: "nublado",
  45: "niebla",
  48: "niebla con escarcha",
  51: "llovizna ligera",
  53: "llovizna moderada",
  55: "llovizna intensa",
  56: "llovizna helada ligera",
  57: "llovizna helada intensa",
  61: "lluvia ligera",
  63: "lluvia moderada",
  65: "lluvia fuerte",
  66: "lluvia helada ligera",
  67: "lluvia helada intensa",
  71: "nevada ligera",
  73: "nevada moderada",
  75: "nevada intensa",
  77: "granizo pequeño",
  80: "chubascos ligeros",
  81: "chubascos moderados",
  82: "chubascos fuertes",
  85: "chubascos de nieve ligeros",
  86: "chubascos de nieve fuertes",
  95: "tormenta eléctrica",
  96: "tormenta eléctrica con granizo ligero",
  99: "tormenta eléctrica con granizo fuerte",
};

const SEVERE_CODES = new Set([65, 66, 67, 81, 82, 95, 96, 99]);

function describeWeatherCode(code: number): string {
  return WEATHER_DESCRIPTIONS[code] ?? "condiciones no determinadas";
}

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { snapshot: WeatherSnapshot; expiresAt: number }>();

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    precipitation: number;
    weather_code: number;
  };
}

// Segunda API externa del proyecto (Open-Meteo: gratuita, sin API key, sin credenciales
// que proteger). El clima se usa como señal de diagnostico real: lluvia fuerte o tormenta
// en la zona del usuario es una causa habitual de caidas de señal en un ISP.
export const weatherService = {
  async getCurrent(zone: string): Promise<WeatherSnapshot | null> {
    if (!env.weatherEnabled) {
      return null;
    }

    const cached = cache.get(zone);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.snapshot;
    }

    const { lat, lon } = coordinatesForZone(zone);
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      "&current=temperature_2m,precipitation,weather_code&timezone=America%2FBogota";

    // Un User-Agent identificable evita que Open-Meteo trate el trafico como anonimo/scraper.
    // En hosting compartido (Render free tier: muchas apps de distintos clientes salen por el
    // mismo pool de IPs) el limite por IP se puede agotar entre todos los inquilinos, no solo
    // por nuestro trafico -- un 429 ahi es un limite externo, no un bug local. Un reintento
    // corto es la unica mitigacion posible desde el codigo (el bucket se recarga por minuto).
    const fetchOptions = { headers: { "User-Agent": "ClickIA-DobleClick/1.0 (soporte tecnico ISP)" } };

    try {
      let res = await withTimeout(fetch(url, fetchOptions), 4000, "open-meteo forecast");
      if (res.status === 429) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        res = await withTimeout(fetch(url, fetchOptions), 4000, "open-meteo forecast (retry)");
      }
      if (!res.ok) {
        logger.warn({ zone, status: res.status }, "weather.service: respuesta no-OK de Open-Meteo");
        return null;
      }

      const data = (await res.json()) as OpenMeteoResponse;
      const code = data.current.weather_code;
      const snapshot: WeatherSnapshot = {
        zone,
        temperatureC: data.current.temperature_2m,
        precipitationMm: data.current.precipitation,
        weatherCode: code,
        description: describeWeatherCode(code),
        isSevere: SEVERE_CODES.has(code),
      };

      cache.set(zone, { snapshot, expiresAt: Date.now() + CACHE_TTL_MS });
      return snapshot;
    } catch (err) {
      // Se degrada sin romper el chat: el clima es una señal extra, no una dependencia dura.
      logger.warn({ err, zone }, "weather.service: no se pudo consultar Open-Meteo");
      return null;
    }
  },
};
