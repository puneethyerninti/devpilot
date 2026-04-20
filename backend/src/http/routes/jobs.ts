// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendError, sendOk } from "../../utils/http";
import { requireAuth, requireRole } from "../../middleware/auth";
import type { Queue } from "bullmq";
import type { JobPayload } from "../../queues/jobProcessor";
import { enqueuePullRequestJob } from "../../queues";
import type { $Enums } from "@prisma/client";
import type { AppConfig } from "../../config";
import { resolveLivePullRequestContext } from "../../services/githubResolution";
type JobStatus = $Enums.JobStatus;

const progressFor = (status: JobStatus) => {
  if (status === "done" || status === "failed") return 100;
  if (status === "processing") return 50;
  return 0;
};

const runJobSchema = z.object({
  repo: z.string(),
  prNumber: z.coerce.number(),
  headSha: z.string().min(6).optional(),
  installationId: z.coerce.number().int().positive().optional()
});

const idSchema = z.object({ id: z.coerce.number().int().positive() });
const queueJobIdSchema = z.object({ queueJobId: z.string().min(1) });

const toUiStatus = (job: {
  status: JobStatus;
  postedToGithubAt: Date | null;
  postedToGithubError: string | null;
}) => {
  if (job.status === "done") {
    if (job.postedToGithubAt) return "posted";
    if (job.postedToGithubError) return "reviewed";
    return "reviewed";
  }
  if (job.status === "processing") return "running";
  return job.status;
};

export const createJobRouter = (queue: Queue<JobPayload>, config: AppConfig) => {
  const router = Router();

  router.get(
    "/dlq",
    requireRole("operator"),
    asyncHandler(async (_req, res) => {
      const failedJobs = await queue.getFailed(0, 99);
      const payload = failedJobs.map((job) => ({
        queueJobId: String(job.id ?? ""),
        name: job.name,
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason,
        timestamp: job.timestamp,
        finishedOn: job.finishedOn ?? null,
        data: {
          repo: job.data?.repo,
          prNumber: job.data?.prNumber,
          dbJobId: job.data?.dbJobId
        }
      }));

      sendOk(res, payload);
    })
  );

  router.post(
    "/dlq/:queueJobId/retry",
    requireRole("operator"),
    asyncHandler(async (req, res) => {
      const parsed = queueJobIdSchema.safeParse(req.params);
      if (!parsed.success) {
        return sendError(res, "Invalid queue job id", 400);
      }

      const queueJobId = parsed.data.queueJobId;
      const failedJob = await queue.getJob(queueJobId);
      if (!failedJob) {
        return sendError(res, "DLQ job not found", 404);
      }

      const state = await failedJob.getState();
      if (state !== "failed") {
        return sendError(res, `Job is not failed (current state: ${state})`, 400);
      }

      await failedJob.retry();

      const dbJobId = failedJob.data?.dbJobId;
      if (typeof dbJobId === "number") {
        await prisma.actionLog.create({
          data: {
            jobId: dbJobId,
            kind: "job.dlq.retry",
            message: `Retried failed queue job ${queueJobId}`,
            metadata: { queueJobId, retriedBy: req.user?.login ?? "unknown" }
          }
        });
      }

      sendOk(res, { queueJobId }, 202);
    })
  );

  router.get(
    "/",
    requireAuth,
    asyncHandler(async (req, res) => {
      const { status, repo, page = "1", perPage = "20" } = req.query;
      const allowedStatuses = new Set(["queued", "processing", "done", "failed"]);
      const statusFilter = typeof status === "string" && allowedStatuses.has(status) ? status : undefined;
      const where = {
        ...(statusFilter ? { status: statusFilter as JobStatus } : {}),
        ...(repo ? { repo: { is: { fullName: repo as string } } } : {})
      };

      const pageNum = Number.isNaN(Number(page)) ? 1 : Number(page);
      const perPageNumber = Number.isNaN(Number(perPage)) ? 20 : Number(perPage);
      const take = Math.min(perPageNumber, 100);
      const skip = (pageNum - 1) * take;

      const [jobs, total] = await Promise.all([
        prisma.pRJob.findMany({ where, orderBy: { createdAt: "desc" }, skip, take, include: { repo: true } }),
        prisma.pRJob.count({ where })
      ]);

      const serializedJobs = jobs.map(({ repo, meta, ...job }) => {
        const workerId = meta && typeof meta === "object" ? (meta as Record<string, unknown>).workerId : undefined;
        return {
          id: job.id,
          repoFullName: repo.fullName,
          prNumber: job.prNumber,
          status: job.status,
          uiStatus: toUiStatus(job),
          summary: job.summary ?? undefined,
          aiReviewMd: job.aiReviewMd ?? undefined,
          riskScore: job.riskScore ?? undefined,
          tokenCount: job.tokenCount ?? undefined,
          costCents: job.costCents ?? undefined,
          postedToGithubAt: job.postedToGithubAt?.toISOString(),
          postedToGithubError: job.postedToGithubError ?? undefined,
          createdAt: job.createdAt.toISOString(),
          updatedAt: job.updatedAt.toISOString(),
          progress: progressFor(job.status),
          workerId: typeof workerId === "string" ? workerId : null
        };
      });

      sendOk(res, { jobs: serializedJobs, total, page: pageNum, perPage: take });
    })
  );

  router.get(
    "/:id",
    requireAuth,
    asyncHandler(async (req, res) => {
      const parsedId = idSchema.safeParse(req.params);
      if (!parsedId.success) {
        return sendError(res, "Invalid job id", 400);
      }
      const jobId = parsedId.data.id;
      const job = await prisma.pRJob.findUnique({
        where: { id: jobId },
        include: { files: true, actionLogs: { orderBy: { createdAt: "asc" }, take: 500 }, repo: true }
      });
      if (!job) {
        return sendError(res, "Job not found", 404);
      }
      const { actionLogs, repo, files, meta, ...rest } = job;

      const timeline = actionLogs.map((log) => ({
        id: log.id,
        kind: log.kind,
        message: log.message,
        createdAt: log.createdAt.toISOString()
      }));

      const workerMeta = meta && typeof meta === "object" ? (meta as Record<string, unknown>) : undefined;

      const payload = {
        id: rest.id,
        repoFullName: repo.fullName,
        prNumber: rest.prNumber,
        headSha: rest.headSha,
        triggeredBy: rest.triggeredBy ?? null,
        status: rest.status,
        uiStatus: toUiStatus(rest),
        summary: rest.summary ?? undefined,
        aiReviewMd: rest.aiReviewMd ?? undefined,
        riskScore: rest.riskScore ?? undefined,
        tokenCount: rest.tokenCount ?? undefined,
        costCents: rest.costCents ?? undefined,
        postedToGithubAt: rest.postedToGithubAt?.toISOString(),
        postedToGithubError: rest.postedToGithubError ?? undefined,
        inlineSuggestions: rest.inlineSuggestions ?? undefined,
        createdAt: rest.createdAt.toISOString(),
        updatedAt: rest.updatedAt.toISOString(),
        progress: progressFor(rest.status),
        logs: actionLogs.map((log) => ({ id: log.id, message: log.message, createdAt: log.createdAt.toISOString() })),
        files: files.map((file) => ({
          id: file.id,
          path: file.path,
          comments: typeof file.comments === "object" && file.comments ? (file.comments as Record<string, unknown>) : undefined
        })),
        timeline,
        worker: {
          id: typeof workerMeta?.workerId === "string" ? workerMeta.workerId : null,
          name: typeof workerMeta?.workerId === "string" ? workerMeta.workerId : null
        }
      };
      sendOk(res, payload);
    })
  );

  router.post(
    "/:id/retry",
    requireRole("operator"),
    asyncHandler(async (req, res) => {
      const parsedId = idSchema.safeParse(req.params);
      if (!parsedId.success) {
        return sendError(res, "Invalid job id", 400);
      }
      const jobId = parsedId.data.id;
      const job = await prisma.pRJob.findUnique({ where: { id: jobId }, include: { repo: true } });
      if (!job) {
        return sendError(res, "Job not found", 404);
      }
      let resolved;
      try {
        resolved = await resolveLivePullRequestContext(config, {
          repo: job.repo.fullName,
          prNumber: job.prNumber,
          headSha: job.headSha,
          installationId: job.installationId ?? undefined
        });
      } catch (err) {
        return sendError(res, err instanceof Error ? err.message : "Failed to resolve GitHub PR context", 400);
      }

      const newJob = await enqueuePullRequestJob(queue, {
        repo: job.repo.fullName,
        prNumber: job.prNumber,
        headSha: resolved.headSha,
        triggeredBy: req.user!.login,
        installationId: resolved.installationId,
        forceLive: true
      });
      sendOk(res, { jobId: newJob.id }, 202);
    })
  );

  router.post(
    "/:id/run-ai",
    requireRole("operator"),
    asyncHandler(async (req, res) => {
      const parsedId = idSchema.safeParse(req.params);
      if (!parsedId.success) {
        return sendError(res, "Invalid job id", 400);
      }
      const jobId = parsedId.data.id;
      const job = await prisma.pRJob.findUnique({ where: { id: jobId }, include: { repo: true } });
      if (!job) {
        return sendError(res, "Job not found", 404);
      }

      let resolved;
      try {
        resolved = await resolveLivePullRequestContext(config, {
          repo: job.repo.fullName,
          prNumber: job.prNumber,
          headSha: job.headSha,
          installationId: job.installationId ?? undefined
        });
      } catch (err) {
        return sendError(res, err instanceof Error ? err.message : "Failed to resolve GitHub PR context", 400);
      }

      const newJob = await enqueuePullRequestJob(queue, {
        repo: job.repo.fullName,
        prNumber: job.prNumber,
        headSha: resolved.headSha,
        triggeredBy: req.user!.login,
        installationId: resolved.installationId,
        forceLive: true
      });

      sendOk(res, { jobId: newJob.id }, 202);
    })
  );

  router.post(
    "/run",
    requireRole("admin"),
    asyncHandler(async (req, res) => {
      const parsed = runJobSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.message, 400);
      }
      const payload = parsed.data;

      let resolved;
      try {
        resolved = await resolveLivePullRequestContext(config, {
          repo: payload.repo,
          prNumber: payload.prNumber,
          headSha: payload.headSha,
          installationId: payload.installationId
        });
      } catch (err) {
        return sendError(res, err instanceof Error ? err.message : "Failed to resolve GitHub PR context", 400);
      }

      const job = await enqueuePullRequestJob(queue, {
        repo: payload.repo,
        prNumber: payload.prNumber,
        headSha: resolved.headSha,
        triggeredBy: req.user!.login,
        installationId: resolved.installationId,
        forceLive: true
      });
      sendOk(res, { jobId: job.id }, 202);
    })
  );

  return router;
};
