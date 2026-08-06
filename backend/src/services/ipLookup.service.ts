import { env } from "../config/env";
import { logger } from "../config/logger";
import { withTimeout } from "./ai/withTimeout";

export interface IspInfo {
  ip: string;
  isp: string;
  org: string;
  asn: string;
  city: string | null;
}

// Rangos privados/de loopback comunes: consultarlos en ip-api.com siempre falla
// ("private range"/"reserved range"), asi que se descartan antes de gastar la llamada.
// En desarrollo local (o detras de un proxy sin `trust proxy`) la IP casi siempre cae aqui.
const PRIVATE_IP_PATTERNS = [
  /^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[0-1])\./, /^::1$/, /^::ffff:127\./, /^fc/, /^fe80:/,
];

function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(ip));
}

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { info: IspInfo | null; expiresAt: number }>();

interface IpApiResponse {
  status: "success" | "fail";
  message?: string;
  isp?: string;
  org?: string;
  as?: string;
  city?: string;
}

// Tercera API externa del proyecto (ip-api.com: gratuita, sin API key). Identifica desde
// que proveedor/red llega la conexion actual del cliente que escribe en el chat -- una
// señal de diagnostico real: si el cliente reporta que "no tiene internet" mientras escribe
// desde una red distinta a la contratada (ej. datos moviles de su celular), el diagnostico
// de conectividad de DobleClick no aplica de la misma forma.
export const ipLookupService = {
  async getInfo(ip: string): Promise<IspInfo | null> {
    if (!env.ipLookupEnabled || !ip || isPrivateIp(ip)) {
      return null;
    }

    const cached = cache.get(ip);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.info;
    }

    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,isp,org,as,city`;

    try {
      const res = await withTimeout(fetch(url), 4000, "ip-api lookup");
      if (!res.ok) {
        logger.warn({ status: res.status }, "ipLookup.service: respuesta no-OK de ip-api.com");
        return null;
      }

      const data = (await res.json()) as IpApiResponse;
      if (data.status !== "success") {
        cache.set(ip, { info: null, expiresAt: Date.now() + CACHE_TTL_MS });
        return null;
      }

      const info: IspInfo = {
        ip,
        isp: data.isp ?? "desconocido",
        org: data.org ?? "",
        asn: data.as ?? "",
        city: data.city ?? null,
      };

      cache.set(ip, { info, expiresAt: Date.now() + CACHE_TTL_MS });
      return info;
    } catch (err) {
      // Se degrada sin romper el chat: es una señal extra, no una dependencia dura.
      logger.warn({ err }, "ipLookup.service: no se pudo consultar ip-api.com");
      return null;
    }
  },
};
