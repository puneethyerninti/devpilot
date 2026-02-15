// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import "dotenv/config";
import http from "http";
import express from "express";
import type { Request } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/node";
import { createApiRouter } from "./http/routes";
import { loadConfig } from "./config";
import { logger } from "./utils/logger";
import { createJobQueue } from "./queues";
import { attachUser, createAuthRouter } from "./middleware/auth";
import { prisma } from "./prisma/client";
import { asyncHandler } from "./utils/asyncHandler";
import { createSocketServer } from "./ws/socket";
import { sendOk } from "./utils/http";
import { createWebhookRouter } from "./http/routes/webhooks";
import rateLimit from "express-rate-limit";
import { metricsRegistry } from "./services/metrics";

const config = loadConfig();

const isAllowedOrigin = (origin?: string) => {
  if (!origin) return true;
  if (origin === config.frontendUrl) return true;
  if (config.nodeEnv !== "production" && /^https?:\/\/localhost:\d+$/.test(origin)) return true;
  return false;
};

if (config.sentryDsn) {
  // Initialize Sentry for background instrumentation; manual captures only.
  Sentry.init({ dsn: config.sentryDsn, tracesSampleRate: 0.2 });
}

export const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS origin not allowed: ${origin ?? "unknown"}`));
    },
    credentials: true
  })
);
app.use(helmet());
app.use(
  express.json({
    limit: "2mb",
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = Buffer.from(buf);
    }
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(attachUser(config));

app.use(
  "/api",
  rateLimit({
    windowMs: config.apiRateLimitWindowMs,
    max: config.apiRateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      const user = req.user?.sub ?? "anon";
      const repo = typeof req.body?.repo === "string" ? req.body.repo : req.params?.repo ?? "-";
      return `${user}:${repo}:${req.ip}`;
    }
  })
);

const jobQueue = createJobQueue(config);

app.use(createAuthRouter(config));
app.use("/api/webhooks", createWebhookRouter(config, jobQueue));
app.use("/api", createApiRouter(jobQueue));

app.get(
  "/health",
  asyncHandler(async (_req, res) => {
    const redis = await jobQueue.client;
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    sendOk(res, { status: "ok" });
  })
);

app.get(
  "/metrics",
  async (_req, res) => {
    res.set("Content-Type", metricsRegistry.contentType);
    res.send(await metricsRegistry.metrics());
  }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error("http.error", { message: err.message, stack: err.stack });
  res.status(500).json({ ok: false, error: "Unexpected server error" });
});

const server = http.createServer(app);

createSocketServer(server, config).catch((err) => {
  logger.error("socket.init_failed", { error: err.message });
});

server.listen(config.port, () => {
  logger.info("server.started", { port: config.port, env: config.nodeEnv });
});
