// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { Prisma } from "@prisma/client";
import type { AppConfig } from "../config";
import { publishSocketEvent } from "../ws/publisher";
import type { JobPayload } from "./jobProcessor";
import { prisma } from "../prisma/client";
import { logger } from "../utils/logger";

export type EnqueueJobInput = {
  repo: string;
  prNumber: number;
  headSha: string;
  triggeredBy: string;
  installationId?: number | null;
  deliveryId?: string;
  forceLive?: boolean;
};

const ensureRepoRecord = async (fullName: string) => {
  const [owner, name] = fullName.split("/");
  if (!owner || !name) {
    throw new Error(`Invalid repository name: ${fullName}`);
  }
  return prisma.repo.upsert({
    where: { fullName },
    update: { owner, name },
    create: {
      fullName,
      owner,
      name,
      defaultBranch: "main"
    }
  });
};

export const createJobQueue = (config: AppConfig) => {
  const connection = new IORedis(config.redisUrl);
  return new Queue<JobPayload>(config.queueName, { connection });
};

export const enqueuePullRequestJob = async (queue: Queue<JobPayload>, input: EnqueueJobInput) => {
  const repoRecord = await ensureRepoRecord(input.repo);
  let queueJobId = `pr-${repoRecord.owner}-${repoRecord.name}-${input.prNumber}-${input.headSha}`;

  const hasInstallationId = input.installationId !== undefined && input.installationId !== null;

  const uniqueWhere: Prisma.PRJobWhereUniqueInput | null = input.deliveryId
    ? { deliveryId: input.deliveryId }
    : hasInstallationId
      ? {
          installationId_repoOwner_repoName_prNumber_headSha: {
            installationId: input.installationId!,
            repoOwner: repoRecord.owner,
            repoName: repoRecord.name,
            prNumber: input.prNumber,
            headSha: input.headSha
          }
        }
      : null;

  if (!uniqueWhere && !hasInstallationId) {
    logger.info("job.manual_run.no_installationId", {
      repo: input.repo,
      prNumber: input.prNumber,
      headSha: input.headSha
    });
  }

  const existing = uniqueWhere ? await prisma.pRJob.findUnique({ where: uniqueWhere }) : null;
  const existingMeta = (existing?.meta as Record<string, unknown> | null) ?? {};
  const meta = {
    ...existingMeta,
    ...(input.deliveryId ? { deliveryId: input.deliveryId } : {}),
    forceLive: Boolean(input.forceLive)
  };

  const baseJobData = {
    jobId: `pr-${repoRecord.owner}-${repoRecord.name}-${input.prNumber}-${input.headSha}`,
    prNumber: input.prNumber,
    headSha: input.headSha,
    status: "queued" as const,
    repoId: repoRecord.id,
    triggeredBy: input.triggeredBy,
    installationId: hasInstallationId ? input.installationId : null,
    repoOwner: repoRecord.owner,
    repoName: repoRecord.name,
    deliveryId: input.deliveryId ?? null,
    summary: null as string | null,
    aiReviewMd: null as string | null,
    aiResponseRaw: Prisma.JsonNull,
    inlineSuggestions: Prisma.JsonNull,
    riskScore: null as number | null,
    errorText: null as string | null,
    tokenCount: null as number | null,
    costCents: null as number | null,
    startedAt: null as Date | null,
    finishedAt: null as Date | null,
    meta
  };

  const jobRecord = uniqueWhere
    ? await prisma.pRJob.upsert({
        where: uniqueWhere,
        update: baseJobData,
        create: baseJobData
      })
    : await prisma.pRJob.create({ data: baseJobData });

  queueJobId = `prjob-${jobRecord.id}`;
  if (jobRecord.jobId !== queueJobId) {
    const updated = await prisma.pRJob.update({ where: { id: jobRecord.id }, data: { jobId: queueJobId } });
    queueJobId = updated.jobId;
  }

  await prisma.pRFile.deleteMany({ where: { jobId: jobRecord.id } });

  await queue.add(
    "pr-analysis",
    {
      repo: input.repo,
      prNumber: input.prNumber,
      headSha: input.headSha,
      triggeredBy: input.triggeredBy,
      dbJobId: jobRecord.id,
      installationId: hasInstallationId ? input.installationId : null,
      deliveryId: input.deliveryId,
      repoOwner: repoRecord.owner,
      repoName: repoRecord.name,
      forceLive: input.forceLive
    },
    {
      removeOnComplete: true,
      removeOnFail: false,
      jobId: queueJobId,
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 }
    }
  );

  await prisma.actionLog.create({
    data: {
      jobId: jobRecord.id,
      kind: "job.created",
      message: `Queued PR ${repoRecord.owner}/${repoRecord.name}#${input.prNumber} (${input.headSha.slice(0, 7)})`,
      metadata: { deliveryId: input.deliveryId ?? null, queueJobId }
    }
  });

  await prisma.actionLog.create({
    data: {
      jobId: jobRecord.id,
      kind: "job.enqueued",
      message: "Job enqueued for processing",
      metadata: { queue: queue.name, queueJobId }
    }
  });

  await publishSocketEvent({ type: "job.created", payload: { id: jobRecord.id, repo: input.repo, status: "queued" } });

  const finalJob = jobRecord.jobId === queueJobId ? jobRecord : await prisma.pRJob.findUnique({ where: { id: jobRecord.id } });
  return finalJob ?? jobRecord;
};
