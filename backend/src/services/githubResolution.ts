import type { AppConfig } from "../config";
import { getInstallationClient, getRepoInstallationId } from "../github/githubAppClient";

type ResolveContextInput = {
  repo: string;
  prNumber: number;
  headSha?: string;
  installationId?: number;
};

type ResolveContextOutput = {
  owner: string;
  repoName: string;
  headSha: string;
  installationId: number;
};

const parseRepo = (repoFullName: string) => {
  const [owner, repoName] = repoFullName.split("/");
  if (!owner || !repoName) {
    throw new Error("Repository must be in owner/repo format");
  }
  return { owner, repoName };
};

export const resolveLivePullRequestContext = async (
  config: AppConfig,
  input: ResolveContextInput
): Promise<ResolveContextOutput> => {
  const { owner, repoName } = parseRepo(input.repo);

  const installationId = input.installationId ?? (await getRepoInstallationId(config, owner, repoName));

  let headSha = input.headSha?.trim();
  if (!headSha) {
    const octokit = await getInstallationClient(config, installationId);
    const pr = await octokit.pulls.get({ owner, repo: repoName, pull_number: input.prNumber });
    headSha = pr.data.head?.sha;
  }

  if (!headSha) {
    throw new Error("Unable to resolve pull request head SHA");
  }

  return { owner, repoName, headSha, installationId };
};
