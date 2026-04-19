// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import fs from "node:fs";
import path from "node:path";
import type { AppConfig } from "../config";
import { logger } from "../utils/logger";

const resolvePrivateKey = (config: AppConfig): string => {
  const filePath = process.env.GITHUB_PRIVATE_KEY_FILE;
  if (filePath && fs.existsSync(filePath)) {
    const key = fs.readFileSync(path.resolve(filePath), "utf8");
    logger.info("github.private_key.from_file", { filePath });
    return key;
  }

  const b64 = process.env.GITHUB_PRIVATE_KEY_BASE64;
  if (b64) {
    const key = Buffer.from(b64, "base64").toString("utf8");
    logger.info("github.private_key.from_base64");
    return key;
  }

  let key = process.env.GITHUB_PRIVATE_KEY ?? config.githubPrivateKey;
  if (!key) {
    throw new Error("GITHUB_PRIVATE_KEY missing");
  }

  if (key.includes("\\n")) {
    key = key.replace(/\\n/g, "\n");
  }

  return key.trim();
};

export const getInstallationClient = async (config: AppConfig, installationId: number) => {
  if (!installationId) {
    throw new Error("installationId is required for GitHub App authentication");
  }

  const auth = createAppAuth({
    appId: config.githubAppId,
    privateKey: resolvePrivateKey(config)
  });

  const { token } = await auth({ type: "installation", installationId });

  return new Octokit({ auth: token });
};

export const getAppClient = async (config: AppConfig) => {
  const auth = createAppAuth({
    appId: config.githubAppId,
    privateKey: resolvePrivateKey(config)
  });

  const { token } = await auth({ type: "app" });
  return new Octokit({ auth: token });
};

export const getRepositoryInstallationId = async (config: AppConfig, owner: string, repo: string): Promise<number | null> => {
  const appClient = await getAppClient(config);
  try {
    const { data } = await appClient.apps.getRepoInstallation({ owner, repo });
    return data.id;
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 404) return null;
    throw err;
  }
};

export type ReviewCommentInput = { file: string; startLine: number; endLine: number; body: string };

export const postReviewComments = async (octokit: Octokit, params: { owner: string; repo: string; pullNumber: number; comments: ReviewCommentInput[] }) => {
  if (!params.comments.length) return;

  const { data: pr } = await octokit.pulls.get({
    owner: params.owner,
    repo: params.repo,
    pull_number: params.pullNumber
  });

  const commitId = pr.head?.sha;
  if (!commitId) {
    throw new Error("Unable to determine commit SHA for pull request");
  }

  // Fallback: create individual comments to avoid draft review complexity.
  for (const comment of params.comments) {
    await octokit.pulls.createReviewComment({
      owner: params.owner,
      repo: params.repo,
      pull_number: params.pullNumber,
      commit_id: commitId,
      path: comment.file,
      start_line: comment.startLine,
      start_side: "RIGHT",
      line: comment.endLine,
      side: "RIGHT",
      body: comment.body
    });
  }
};
