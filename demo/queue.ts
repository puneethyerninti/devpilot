import { Queue } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export interface PRJobPayload {
  repoFullName: string;
  prNumber: number;
  prTitle: string;
  headSha: string;
  installationId: number;
}

/**
 * Shared Redis connection for BullMQ objects.
 */
export const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

/**
 * Queue definition (worker lives in worker.ts).
 */
export const prQueue = new Queue<PRJobPayload>("prQueue", {
  connection,
});
