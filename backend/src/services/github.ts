import type { Octokit } from "@octokit/rest";
import type { AppConfig } from "../config";
import { logger } from "../utils/logger";
import { githubApiRequestsTotal } from "./metrics";

export type GitHubReviewComment = {
  file: string;
  startLine: number;
  endLine: number;
  body: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const withRateLimitRetry = async <T>(fn: () => Promise<T>, opts?: { maxRetries?: number }) => {
  const maxRetries = opts?.maxRetries ?? 3;
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      const anyErr = err as any;
      const retryAfterHeader = anyErr?.response?.headers?.["retry-after"] ?? anyErr?.headers?.["retry-after"];
      const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : NaN;
      const status = anyErr?.status ?? anyErr?.response?.status;

      if (attempt > maxRetries || !(status === 403 || status === 429) || !Number.isFinite(retryAfterSeconds)) {
        throw err;
      }
      const backoffMs = Math.min(30000, Math.max(1000, retryAfterSeconds * 1000));
      logger.warn("github.rate_limited", { status, retryAfterSeconds, backoffMs, attempt });
      await sleep(backoffMs);
    }
  }
};

export const postSummaryComment = async (
  config: AppConfig,
  installationId: number,
  params: { owner: string; repo: string; prNumber: number; body: string }
) => {
  const { getInstallationClient } = await import("../github/githubAppClient.js");
  githubApiRequestsTotal.inc({ operation: "issues.createComment" });
  const octokit = await getInstallationClient(config, installationId);
  await withRateLimitRetry(() => octokit.issues.createComment({ owner: params.owner, repo: params.repo, issue_number: params.prNumber, body: params.body }));
};

export const postReviewComments = async (
  config: AppConfig,
  installationId: number,
  params: { owner: string; repo: string; prNumber: number; comments: GitHubReviewComment[] }
) => {
  if (!params.comments.length) return;
  const { getInstallationClient } = await import("../github/githubAppClient.js");
  githubApiRequestsTotal.inc({ operation: "pulls.createReviewComment" });
  const octokit = await getInstallationClient(config, installationId);
  await postReviewCommentsWithOctokit(octokit, params);
};

export const postReviewCommentsWithOctokit = async (
  octokit: Octokit,
  params: { owner: string; repo: string; prNumber: number; comments: GitHubReviewComment[] }
) => {
  if (!params.comments.length) return;

  const { data: pr } = await withRateLimitRetry(() =>
    (githubApiRequestsTotal.inc({ operation: "pulls.get" }),
    octokit.pulls.get({ owner: params.owner, repo: params.repo, pull_number: params.prNumber })
    )
  );
  const commitId = (pr as any)?.head?.sha as string | undefined;
  if (!commitId) {
    throw new Error("Unable to determine commit SHA for pull request");
  }

  for (const comment of params.comments) {
    await withRateLimitRetry(() =>
      (githubApiRequestsTotal.inc({ operation: "pulls.createReviewComment" }),
      octokit.pulls.createReviewComment({
        owner: params.owner,
        repo: params.repo,
        pull_number: params.prNumber,
        commit_id: commitId,
        path: comment.file,
        start_line: comment.startLine,
        start_side: "RIGHT",
        line: comment.endLine,
        side: "RIGHT",
        body: comment.body
      })
      )
    );
  }
};
