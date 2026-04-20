// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { Router } from "express";
import type { Queue } from "bullmq";
import type { JobPayload } from "../../queues/jobProcessor";
import type { AppConfig } from "../../config";
import { createJobRouter } from "./jobs";
import { createRepoRouter } from "./repos";
import { createUserRouter } from "./users";
import { createWorkerRouter } from "./workers";

export const createApiRouter = (queue: Queue<JobPayload>, config: AppConfig) => {
  const router = Router();
  router.use("/jobs", createJobRouter(queue, config));
  router.use("/repos", createRepoRouter());
  router.use("/users", createUserRouter());
  router.use("/workers", createWorkerRouter());
  return router;
};
