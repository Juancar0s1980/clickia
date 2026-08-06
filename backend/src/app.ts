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
    res.status(200).json({ status: "ok" });
  });

  app.use("/api", apiRateLimiter, routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
