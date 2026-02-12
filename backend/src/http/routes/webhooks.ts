// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import express from "express";
import type { Queue } from "bullmq";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendError, sendOk } from "../../utils/http";
import type { AppConfig } from "../../config";
import type { JobPayload } from "../../queues/jobProcessor";
import { enqueuePullRequestJob } from "../../queues";
import { logger } from "../../utils/logger";
import { verifyGitHubWebhook } from "../../middleware/githubWebhook";

const supportedActions = new Set(["opened", "synchronize", "reopened"]);

const pullRequestEventSchema = z.object({
  action: z.string(),
  pull_request: z.object({
    number: z.number(),
    head: z.object({ sha: z.string() })
  }),
  repository: z.object({
    id: z.number(),
    full_name: z.string(),
    name: z.string(),
    owner: z.object({ login: z.string() })
  }),
  installation: z.object({ id: z.number() }),
  sender: z.object({ login: z.string().optional() }).optional()
});

export const createWebhookRouter = (config: AppConfig, queue: Queue<JobPayload>) => {
  const router = express.Router();

  router.post(
    "/github",
    verifyGitHubWebhook(config),
    asyncHandler(async (req, res) => {
      const deliveryId = req.get("x-github-delivery");
      const event = req.get("x-github-event");

      if (!deliveryId) return sendError(res, "Missing delivery id", 400);
      if (!event) return sendError(res, "Missing event type", 400);
      if (!config.githubWebhookSecret) return sendError(res, "Signature required", 401);

      const duplicate = await prisma.webhookEvent.findUnique({ where: { deliveryId } });
      if (duplicate) {
        logger.info("webhook.duplicate", { deliveryId });
        return res.status(202).json({ ok: true, duplicate: true });
      }

      try {
        await prisma.webhookEvent.create({ data: { deliveryId, eventType: event } });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
          logger.info("webhook.duplicate", { deliveryId });
          return res.status(202).json({ ok: true, duplicate: true });
        }
        throw err;
      }

      if (event !== "pull_request") {
        logger.info("webhook.ignored_event", { deliveryId, event });
        return sendOk(res, { status: "ignored" });
      }

      const parsed = pullRequestEventSchema.safeParse(req.body);
      if (!parsed.success) {
        logger.warn("webhook.invalid_payload", { deliveryId, issues: parsed.error.issues });
        return sendError(res, "Invalid pull_request payload", 400);
      }

      const payload = parsed.data;

      if (!supportedActions.has(payload.action ?? "")) {
        logger.info("webhook.unhandled_action", { deliveryId, action: payload.action });
        return sendOk(res, { status: "ignored_action" });
      }

      const repo = payload.repository.full_name;
      const repoOwner = payload.repository.owner.login;
      const repoName = payload.repository.name;
      const prNumber = payload.pull_request.number;
      const headSha = payload.pull_request.head.sha;
      const installationId = payload.installation.id;
      const triggeredBy = payload.sender?.login ?? "unknown";

      await prisma.actionLog.create({
        data: {
          kind: "webhook.received",
          message: `GitHub pull_request:${payload.action}`,
          metadata: { deliveryId, repo, prNumber, headSha }
        }
      });

      const job = await enqueuePullRequestJob(queue, {
        repo,
        prNumber,
        headSha,
        triggeredBy,
        installationId,
        deliveryId,
        forceLive: true
      });

      await prisma.actionLog.create({
        data: {
          jobId: job.id,
          kind: "webhook.accepted",
          message: "Webhook accepted and job created",
          metadata: { deliveryId, repoOwner, repoName, prNumber, headSha }
        }
      });

      return sendOk(res, { enqueued: true, jobId: job.id });
    })
  );

  return router;
};
