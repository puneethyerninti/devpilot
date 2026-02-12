// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/node";
import { createApiRouter } from "./http/routes";
import { loadConfig } from "./config";
import { logger } from "./utils/logger";
import { createJobQueue } from "./queues";
import { attachUser, createAuthRouter } from "./middleware/auth";
import { demoAuth } from "./middleware/demoAuth";
import { prisma } from "./prisma/client";
import { asyncHandler } from "./utils/asyncHandler";
import { createSocketServer } from "./ws/socket";
import { sendOk } from "./utils/http";
import { createWebhookRouter } from "./http/routes/webhooks";

const config = loadConfig();

if (config.sentryDsn) {
  // Initialize Sentry for background instrumentation; manual captures only.
  Sentry.init({ dsn: config.sentryDsn, tracesSampleRate: 0.2 });
}

export const app = express();
app.use(cors({ origin: config.frontendUrl, credentials: true }));
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
app.use(demoAuth);
app.use(attachUser(config));

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
  (_req, res) => {
    res.type("text/plain").send("devpilot_up 1\n");
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
