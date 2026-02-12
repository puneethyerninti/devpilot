// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { Worker } from "bullmq";
import IORedis from "ioredis";
import type { AppConfig } from "../config";
import { prisma } from "../prisma/client";
import type { Prisma } from "@prisma/client";
import { initSocketPublisher, publishSocketEvent } from "../ws/publisher";
import { AiClient } from "../services/aiClient";
import { logger } from "../utils/logger";
import { getInstallationClient } from "../github/githubAppClient.js";
import * as Sentry from "@sentry/node";

export type JobPayload = {
  repo: string;
  prNumber: number;
  headSha: string;
  triggeredBy: string;
  dbJobId: number;
  installationId?: number | null;
  deliveryId?: string;
  repoOwner?: string;
  repoName?: string;
  forceLive?: boolean;
};

type ParsedHunk = { file: string; startLine: number; endLine: number; hunk: string };

export const parsePatch = (file: string, patch: string): ParsedHunk[] => {
  const lines = patch.split("\n");
  const hunks: ParsedHunk[] = [];
  let current: { start: number; end: number; buf: string[] } | null = null;

  const flushCurrent = () => {
    if (!current) return;
    const { start, end, buf } = current;
    hunks.push({ file, startLine: start, endLine: end, hunk: buf.join("\n") });
  };

  for (const line of lines) {
    const match = /^@@[^+]*\+(\d+)(?:,(\d+))?/.exec(line);
    if (match) {
      flushCurrent();
      const start = Number(match[1]);
      const span = match[2] ? Number(match[2]) : 1;
      current = { start, end: start + span - 1, buf: [line] };
      continue;
    }

    if (!current) continue;
    current.buf.push(line);
    if (/^\+/.test(line) || /^-/.test(line)) {
      current.end = Math.max(current.end, current.start + current.buf.length - 1);
    }
  }

  flushCurrent();
  return hunks;
};

export const chunkHunks = (hunks: ParsedHunk[], maxBytes = 1900): Array<{ file: string; startLine: number; endLine: number; hunk: string }> => {
  const out: Array<{ file: string; startLine: number; endLine: number; hunk: string }> = [];
  hunks.forEach((h) => {
    const lines = h.hunk.split("\n");
    let buf: string[] = [];
    lines.forEach((ln) => {
      const prospective = [...buf, ln].join("\n");
      if (Buffer.byteLength(prospective, "utf8") > maxBytes && buf.length) {
        out.push({ file: h.file, startLine: h.startLine, endLine: h.endLine, hunk: buf.join("\n") });
        buf = [ln];
      } else {
        buf.push(ln);
      }
    });
    if (buf.length) out.push({ file: h.file, startLine: h.startLine, endLine: h.endLine, hunk: buf.join("\n") });
  });
  return out;
};

type PullRequestData = {
  files: Array<{ path: string; patch?: string; additions: number; deletions: number }>;
  hunks: ParsedHunk[];
  commits?: number;
  totalPatchBytes: number;
};

const fetchPullRequestData = async (
  owner: string,
  repo: string,
  prNumber: number,
  installationId: number | null | undefined,
  config: AppConfig,
  jobId: number,
  forceLive: boolean
): Promise<PullRequestData> => {
  if (!installationId && !forceLive) {
    await logJobLine(jobId, "github.fetch_pr.skipped (no installation)");
    return { files: [], hunks: [], commits: 0, totalPatchBytes: 0 };
  }

  if (!installationId && forceLive) {
    throw new Error("Missing installation id for live mode");
  }

  const octokit = installationId ? await getInstallationClient(config, installationId) : null;
  if (!octokit) {
    throw new Error("Missing GitHub installation client");
  }

  await logJobLine(jobId, "live.mode.enabled");
  logger.info("github.installation_token.created", { jobId, installationId });
  await prisma.actionLog.create({
    data: { jobId, kind: "github.installation_token.created", message: "Installation token created", metadata: { installationId } }
  });

  try {
    const prMeta = await octokit.pulls.get({ owner, repo, pull_number: prNumber });
    const commits = prMeta.data.commits;
    const filesResp = await octokit.pulls.listFiles({ owner, repo, pull_number: prNumber, per_page: 100 });
    const files = filesResp.data.map((f) => ({
      path: f.filename,
      patch: f.patch ?? undefined,
      additions: f.additions,
      deletions: f.deletions
    }));

    const hunks: ParsedHunk[] = [];
    let totalPatchBytes = 0;
    for (const file of files) {
      if (!file.patch) continue;
      totalPatchBytes += Buffer.byteLength(file.patch, "utf8");
      hunks.push(...parsePatch(file.path, file.patch));
    }

    await logJobLine(jobId, `github.fetch_pr.success files=${files.length} patchBytes=${totalPatchBytes}`);
    await prisma.actionLog.create({
      data: {
        jobId,
        kind: "github.fetch_pr.success",
        message: "Fetched pull request files",
        metadata: { files: files.length, patchBytes: totalPatchBytes, commits }
      }
    });

    return { files, hunks, commits, totalPatchBytes };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = (err as { status?: number }).status ?? (err as { statusCode?: number }).statusCode;
    await logJobLine(jobId, `github.fetch_pr.failed status=${status ?? "unknown"} message=${message}`);
    await prisma.actionLog.create({
      data: { jobId, kind: "github.fetch_pr.failed", message, metadata: { status } }
    });
    throw err;
  }
};

const logJobLine = async (jobId: number, line: string) => {
  const ts = new Date().toISOString();
  await publishSocketEvent({ type: "job.log", payload: { id: jobId, line, ts } }, `job:${jobId}`);
  await prisma.actionLog.create({
    data: {
      jobId,
      kind: "job.log",
      message: line,
      metadata: { ts }
    }
  });
};

export const registerJobWorker = (config: AppConfig, workerId: string = `worker-${process.pid}`) => {
  initSocketPublisher(config);
  const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

  const aiClient = new AiClient(config);

  const worker = new Worker<JobPayload>(
    config.queueName,
    async (job) => {
      const dbJobId = job.data.dbJobId;
      if (!dbJobId) {
        logger.error("job.missing_db_id", { queueId: job.id });
        return;
      }

      const existingMetaRaw = await prisma.pRJob.findUnique({ where: { id: dbJobId }, select: { meta: true } });
      const existingMeta = (existingMetaRaw?.meta as Record<string, unknown> | null) ?? {};
      const metaForProcessing = {
        ...existingMeta,
        ...(job.data.deliveryId ? { deliveryId: job.data.deliveryId } : {}),
        workerId,
        forceLive: job.data.forceLive ?? existingMeta.forceLive ?? false
      };

      await prisma.pRJob.update({
        where: { id: dbJobId },
        data: {
          status: "processing",
          startedAt: new Date(),
          meta: metaForProcessing
        }
      });
      await publishSocketEvent({ type: "job.updated", payload: { id: dbJobId, status: "processing", startedAt: new Date().toISOString() } });

      await logJobLine(dbJobId, `Processing pull request ${job.data.repo}#${job.data.prNumber} at ${job.data.headSha}`);

      const owner = job.data.repoOwner ?? job.data.repo.split("/")[0];
      const repoName = job.data.repoName ?? job.data.repo.split("/")[1];

      const liveRequired = Boolean(job.data.forceLive || job.data.installationId);
      let pullData: PullRequestData | null = null;
      let chunkedHunks: Array<{ file: string; startLine: number; endLine: number; hunk: string }> = [];
      try {
        pullData = await fetchPullRequestData(owner, repoName, job.data.prNumber, job.data.installationId, config, dbJobId, liveRequired);
        chunkedHunks = chunkHunks(pullData.hunks);
        await logJobLine(dbJobId, `Fetched ${pullData.hunks.length} hunks (${chunkedHunks.length} chunks)`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("diff.fetch_failed", { jobId: dbJobId, error: message });
        await prisma.pRJob.update({ where: { id: dbJobId }, data: { status: "failed", errorText: message, finishedAt: new Date() } });
        await publishSocketEvent({ type: "job.updated", payload: { id: dbJobId, status: "failed", error: message } });
        Sentry.captureException(err);
        return;
      }

      const effectiveAiMode = job.data.forceLive ? "live" : config.aiMode;

      const aiResult = await aiClient.summarize(
        {
          repo: job.data.repo,
          prNumber: job.data.prNumber,
          chunks: chunkedHunks
        },
        { forceLive: job.data.forceLive }
      );

      const riskScoreNumeric = aiResult.riskScore.level === "high" ? 0.9 : aiResult.riskScore.level === "medium" ? 0.5 : 0.2;

      await prisma.pRFile.deleteMany({ where: { jobId: dbJobId } });
      const suggestionFiles = (aiResult.inlineSuggestions ?? []).reduce<Record<string, Array<{ startLine: number; endLine: number }>>>(
        (acc, s) => {
          if (!acc[s.file]) acc[s.file] = [];
          acc[s.file].push({ startLine: s.startLine, endLine: s.endLine });
          return acc;
        },
        {}
      );

      const pathsFromGitHub = pullData?.files.map((f) => f.path) ?? [];
      const uniquePaths = Array.from(new Set([...pathsFromGitHub, ...Object.keys(suggestionFiles)]));

      await Promise.all(
        uniquePaths.map((path, idx) => {
          const comments = suggestionFiles[path]?.map((c) => [c.startLine, c.endLine]).flat() ?? [];
          return prisma.pRFile.create({
            data: {
              id: `${dbJobId}-file-${idx}`,
              jobId: dbJobId,
              path,
              comments: comments.length ? { lines: comments } : undefined
            }
          });
        })
      );

      await prisma.pRJob.update({
        where: { id: dbJobId },
        data: {
          status: "done",
          summary: aiResult.summary,
          aiReviewMd: aiResult.summary,
          inlineSuggestions: aiResult.inlineSuggestions as unknown as Prisma.InputJsonValue,
          riskScore: riskScoreNumeric,
          aiResponseRaw: aiResult.aiResponseRaw as unknown as Prisma.InputJsonValue,
          tokenCount: aiResult.tokenCount,
          costCents: aiResult.costCents,
          finishedAt: new Date(),
          meta: { ...metaForProcessing, commentPosted: false }
        }
      });

      if (job.data.deliveryId) {
        await prisma.webhookEvent.update({ where: { deliveryId: job.data.deliveryId }, data: { processed: true } }).catch((err) => {
          logger.error("webhook.mark_processed_failed", { deliveryId: job.data.deliveryId, error: err.message });
        });
      }

      const jobRecord = await prisma.pRJob.findUnique({ where: { id: dbJobId } });
      const alreadyCommented = (jobRecord?.meta as Record<string, unknown> | null)?.commentPosted === true;

      if (alreadyCommented) {
        logger.info("github.comment_skipped_duplicate", { jobId: dbJobId });
      } else if (job.data.installationId && owner && repoName) {
        try {
          const octokit = await getInstallationClient(config, job.data.installationId);
          const body = `DevPilot AI Summary (${effectiveAiMode}):\n\n${aiResult.summary}\n\nRisk: ${aiResult.riskScore.level} - ${aiResult.riskScore.reason}`;
          await octokit.issues.createComment({ owner, repo: repoName, issue_number: job.data.prNumber, body });
          if (aiResult.inlineSuggestions.length) {
            const { postReviewComments } = await import("../github/githubAppClient.js");
            await postReviewComments(octokit, {
              owner,
              repo: repoName,
              pullNumber: job.data.prNumber,
              comments: aiResult.inlineSuggestions.map((s) => ({
                file: s.file,
                startLine: s.startLine,
                endLine: s.endLine,
                body: `${s.severity.toUpperCase()}: ${s.suggestion}`
              }))
            });
          }
          await prisma.pRJob.update({
            where: { id: dbJobId },
            data: { meta: { ...metaForProcessing, commentPosted: true } }
          });
          await logJobLine(dbJobId, `Posted summary and ${aiResult.inlineSuggestions.length} inline comments to ${owner}/${repoName}#${job.data.prNumber}`);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger.error("github.comment_failed", { jobId: dbJobId, error: message });
          Sentry.captureException(err);
          throw err;
        }
      } else {
        logger.warn("github.comment_skipped", { jobId: dbJobId, installationId: job.data.installationId, owner, repo: repoName });
      }

      await publishSocketEvent({
        type: "job.completed",
        payload: {
          id: dbJobId,
          summary: aiResult.summary,
          tokenCount: aiResult.tokenCount,
          costCents: aiResult.costCents
        }
      });
      await logJobLine(dbJobId, `AI review complete (risk=${aiResult.riskScore.level}, inline=${aiResult.inlineSuggestions.length})`);
      await publishSocketEvent({ type: "job.updated", payload: { id: dbJobId, status: "done", finishedAt: new Date().toISOString() } });
      logger.info("metrics.job.success", { jobId: dbJobId, pr: job.data.prNumber });
    },
    { connection }
  );

  worker.on("failed", async (job, err) => {
    const dbJobId = job?.data?.dbJobId as number | undefined;
    if (!dbJobId) return;
    await prisma.pRJob.update({
      where: { id: dbJobId },
      data: { status: "failed", errorText: err.message }
    });
    await publishSocketEvent({ type: "job.updated", payload: { id: dbJobId, status: "failed", error: err.message } });
    await publishSocketEvent({ type: "job.failed", payload: { id: dbJobId, error: err.message } });
    logger.error("job.failed", { jobId: dbJobId, error: err.message });
    Sentry.captureException(err);
    logger.info("metrics.job.failed", { jobId: dbJobId });
  });

  worker.on("completed", async (job) => {
    const dbJobId = job?.data?.dbJobId as number | undefined;
    if (!dbJobId) return;
    publishSocketEvent({ type: "job.updated", payload: { id: dbJobId, status: "done", finishedAt: new Date().toISOString() } }).catch((err) =>
      logger.error("socket.emit_failed", { err: err.message })
    );
  });

  return worker;
};
