import { env } from "../config/env";
import { logger } from "../config/logger";
import { withTimeout } from "./ai/withTimeout";

export interface GeocodeResult {
  lat: number;
  lon: number;
  formattedAddress: string;
  // 0-10 segun OpenCage: que tan seguro esta el geocoder de haber encontrado el lugar
  // correcto. Se guarda para que el admin sepa si conviene confirmar la direccion a mano
  // antes de mandar un tecnico (ej. una direccion muy generica puede dar confianza baja).
  confidence: number;
}

interface OpenCageResponse {
  results: Array<{
    formatted: string;
    confidence: number;
    geometry: { lat: number; lng: number };
  }>;
}

// Cuarta API externa del proyecto (OpenCage Geocoding, gratuita hasta 2500 peticiones/dia,
// requiere API key a diferencia de Open-Meteo e ip-api.com). Convierte la direccion de la
// casa del cliente en coordenadas reales, para que el admin pueda abrir el mapa exacto al
// despachar un tecnico -- resuelve el "decirle mas facil al tecnico donde ir" mas alla de
// solo texto libre. Se llama una vez, al registrar/crear al cliente (no en cada mensaje del
// chat), asi que no necesita cache por zona como weather/ipLookup.
export const geocodingService = {
  async geocodeAddress(direccion: string, zona: string): Promise<GeocodeResult | null> {
    if (!env.geocodingEnabled || !env.opencageApiKey) {
      return null;
    }

    // Timbio es un municipio vecino distinto de Popayan (ver weather.service.ts); sin esto
    // el geocoder podria ubicar la direccion en el Popayan urbano equivocado.
    const municipio = zona === "Timbío" ? "Timbío" : "Popayán";
    const query = `${direccion}, ${municipio}, Cauca, Colombia`;
    const url =
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}` +
      `&key=${env.opencageApiKey}&countrycode=co&language=es&limit=1&no_annotations=1`;

    try {
      const res = await withTimeout(fetch(url), 4000, "opencage geocoding");
      if (!res.ok) {
        logger.warn({ status: res.status }, "geocoding.service: respuesta no-OK de OpenCage");
        return null;
      }

      const data = (await res.json()) as OpenCageResponse;
      const top = data.results[0];
      if (!top) {
        return null;
      }

      return {
        lat: top.geometry.lat,
        lon: top.geometry.lng,
        formattedAddress: top.formatted,
        confidence: top.confidence,
      };
    } catch (err) {
      // Se degrada sin romper el registro: la direccion en texto libre ya quedo guardada,
      // esto solo enriquece el dato cuando esta disponible.
      logger.warn({ err }, "geocoding.service: no se pudo consultar OpenCage");
      return null;
    }
  },
};
