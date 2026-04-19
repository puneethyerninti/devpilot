// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import "dotenv/config";
import { loadConfig } from "../config";
import { registerJobWorker } from "../queues/jobProcessor";
import { prisma } from "../prisma/client";
import { publishSocketEvent } from "../ws/publisher";
import { logger } from "../utils/logger";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import type { JobPayload } from "../queues/jobProcessor";
import * as Sentry from "@sentry/node";

const config = loadConfig();
const workerId = `worker-${process.pid}`;

if (config.sentryDsn) {
  Sentry.init({ dsn: config.sentryDsn, tracesSampleRate: 0.2 });
}

const worker = registerJobWorker(config, workerId);
const queueConnection = new IORedis(config.redisUrl);
queueConnection.on("error", (err) => {
  logger.warn("redis.worker_status_queue_error", { workerId, error: err.message });
});
const queue = new Queue<JobPayload>(config.queueName, { connection: queueConnection });

const recordStatus = async (status: "online" | "offline") => {
  let queueDepth = 0;
  try {
    const counts = await queue.getJobCounts("waiting", "active", "delayed");
    queueDepth = (counts.waiting ?? 0) + (counts.active ?? 0) + (counts.delayed ?? 0);
  } catch (err) {
    logger.warn("worker.queue_depth_error", { err: (err as Error).message });
  }

  await prisma.actionLog.create({
    data: {
      workerId,
      kind: "worker.status",
      message: status,
      metadata: { queue: config.queueName, queueDepth }
    }
  });
  await publishSocketEvent({ type: "worker.status", payload: { workerId, status, queueDepth, updatedAt: new Date().toISOString() } });
};

setInterval(() => {
  recordStatus("online").catch((err) => logger.error("worker.heartbeat_error", { err: err.message }));
}, 15000);

worker.on("ready", () => {
  logger.info("worker.ready", { workerId, queue: config.queueName });
  recordStatus("online").catch((err) => logger.error("worker.status_error", { err: err.message }));
});

worker.on("closed", () => {
  recordStatus("offline").catch((err) => logger.error("worker.status_error", { err: err.message }));
});

process.on("SIGINT", async () => {
  await worker.close();
  await recordStatus("offline");
  process.exit(0);
});

process.on("uncaughtException", async (err) => {
  logger.error("worker.uncaught_exception", { err: err.message, stack: err.stack });
  Sentry.captureException(err);
  try {
    await recordStatus("offline");
  } finally {
    process.exit(1);
  }
});

process.on("unhandledRejection", async (reason) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  logger.error("worker.unhandled_rejection", { err: err.message, stack: err.stack });
  Sentry.captureException(err);
});
