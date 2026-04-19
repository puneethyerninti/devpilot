// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { Router } from "express";
import { prisma } from "../../prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import { sendOk } from "../../utils/http";

export const createRepoRouter = () => {
  const router = Router();
  router.get(
    "/",
    requireAuth,
    asyncHandler(async (req, res) => {
      const repos = await prisma.repo.findMany({
        where: {
          users: {
            some: {
              userId: req.user!.sub
            }
          }
        },
        orderBy: { name: "asc" }
      });

      const latestJobs = await prisma.pRJob.groupBy({
        by: ["repoId"],
        _max: { updatedAt: true },
        where: {
          repoId: { in: repos.map((repo) => repo.id) }
        }
      });

      const latestKeyByRepoId = new Map<number, Date>();
      latestJobs.forEach((entry) => {
        if (entry._max.updatedAt) {
          latestKeyByRepoId.set(entry.repoId, entry._max.updatedAt);
        }
      });

      const latestDetails = await Promise.all(
        repos.map(async (repo) => {
          const maxUpdatedAt = latestKeyByRepoId.get(repo.id);
          if (!maxUpdatedAt) {
            return null;
          }
          const latestJob = await prisma.pRJob.findFirst({
            where: {
              repoId: repo.id,
              updatedAt: maxUpdatedAt
            },
            orderBy: { id: "desc" },
            select: {
              prNumber: true,
              headSha: true,
              installationId: true,
              updatedAt: true
            }
          });

          return latestJob
            ? {
                repoId: repo.id,
                lastPrNumber: latestJob.prNumber,
                lastHeadSha: latestJob.headSha,
                lastInstallationId: latestJob.installationId,
                lastSeenAt: latestJob.updatedAt.toISOString()
              }
            : null;
        })
      );

      const latestByRepoId = new Map<number, NonNullable<(typeof latestDetails)[number]>>();
      latestDetails.forEach((item) => {
        if (item) latestByRepoId.set(item.repoId, item);
      });

      const payload = repos.map((repo) => {
        const latest = latestByRepoId.get(repo.id);
        return {
          id: repo.id,
          fullName: repo.fullName,
          owner: repo.owner,
          name: repo.name,
          defaultBranch: repo.defaultBranch,
          lastPrNumber: latest?.lastPrNumber,
          lastHeadSha: latest?.lastHeadSha,
          lastInstallationId: latest?.lastInstallationId,
          lastSeenAt: latest?.lastSeenAt
        };
      });

      sendOk(res, payload);
    })
  );
  return router;
};
