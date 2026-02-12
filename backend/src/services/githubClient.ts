// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { Octokit } from "@octokit/rest";
import type { Repo } from "@prisma/client";
import { prisma } from "../prisma/client";
import { logger } from "../utils/logger";

export class GithubClient {
  private octokit: Octokit;

  constructor(token?: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async getPullRequest(repoFullName: string, prNumber: number) {
    const [owner, repo] = repoFullName.split("/");
    const response = await this.octokit.pulls.get({ owner, repo, pull_number: prNumber });
    return response.data;
  }

  async listInstalledRepos(userId: string): Promise<Repo[]> {
    const repos = await prisma.repo.findMany({ where: { users: { some: { userId } } }, orderBy: { name: "asc" } });
    return repos;
  }

  async ensureRepo(repoFullName: string): Promise<Repo> {
    const [owner, repo] = repoFullName.split("/");
    const response = await this.octokit.repos.get({ owner, repo });
    const dbRepo = await prisma.repo.upsert({
      where: { fullName: repoFullName },
      create: {
        fullName: repoFullName,
        name: response.data.name,
        owner,
        defaultBranch: response.data.default_branch ?? "main"
      },
      update: {
        name: response.data.name,
        defaultBranch: response.data.default_branch ?? "main"
      }
    });
    logger.info("repo.synced", { repo: repoFullName });
    return dbRepo;
  }
}
