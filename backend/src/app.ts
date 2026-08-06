import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { apiRateLimiter } from "./middleware/rateLimit.middleware";
import routes from "./routes";

export function createApp(): Express {
  const app = express();

  // Necesario para que req.ip refleje la IP real del cliente (no la del proxy) una vez
  // desplegado detras de nginx/un balanceador; sin esto, ipLookup.service siempre veria
  // la IP interna del proxy. Se confia en un solo salto (el proxy inmediato) en vez de
  // `true` (todos los proxies): con `true`, cualquiera podria falsificar X-Forwarded-For
  // para saltarse el rate limiting por IP.
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json({ limit: "100kb" }));
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === "/health" } }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", nodeVersion: process.version });
  });

  // Diagnostico temporal: expone el error real (no el que weather.service.ts silencia)
  // de un fetch saliente desde el contenedor de Render, para confirmar si el problema
  // es de red egress/DNS/TLS o algo especifico de Open-Meteo.
  app.get("/debug/fetch-test", async (_req, res) => {
    const results: Record<string, unknown> = {};
    for (const [name, url] of Object.entries({
      openMeteo: "https://api.open-meteo.com/v1/forecast?latitude=2.44&longitude=-76.61&current=temperature_2m",
      ipApi: "http://ip-api.com/json/8.8.8.8",
      httpbin: "https://httpbin.org/get",
    })) {
      try {
        const start = Date.now();
        const r = await fetch(url);
        results[name] = { ok: r.ok, status: r.status, ms: Date.now() - start };
      } catch (err) {
        results[name] = {
          error: err instanceof Error ? err.message : String(err),
          name: err instanceof Error ? err.name : undefined,
          cause: err instanceof Error && err.cause ? String(err.cause) : undefined,
        };
      }
    }
    res.status(200).json(results);
  });

  app.use("/api", apiRateLimiter, routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
