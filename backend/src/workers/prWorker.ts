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

const config = loadConfig();
const workerId = `worker-${process.pid}`;

const worker = registerJobWorker(config, workerId);
const queue = new Queue<JobPayload>(config.queueName, { connection: new IORedis(config.redisUrl) });

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
