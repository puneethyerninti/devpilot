import { Worker, Job } from "bullmq";
import { prQueue, type PRJobPayload } from "../queues/prQueue";
import { connection } from "../queues/connection";
import { logger } from "../utils/logger";

async function simulateWork(durationMs: number) {
  await new Promise((resolve) => setTimeout(resolve, durationMs));
}

export const prWorker = new Worker<PRJobPayload>(
  prQueue.name,
  async (job: Job<PRJobPayload>) => {
    logger.info(`Processing job ${job.id} with payload: ${JSON.stringify(job.data)}`);
    await simulateWork(2000);
    logger.info(`Completed job ${job.id}`);
  },
  { connection }
);

prWorker.on("failed", (job, err) => {
  logger.error(`Job ${job?.id} failed: ${err.message}`);
});

prWorker.on("error", (err) => {
  logger.error(`Worker error: ${err.message}`);
});
