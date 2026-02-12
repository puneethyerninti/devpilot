// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { Router } from "express";
import { prisma } from "../../prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole } from "../../middleware/auth";
import { sendOk } from "../../utils/http";

export const createWorkerRouter = () => {
  const router = Router();
  router.get(
    "/",
    requireRole("operator"),
    asyncHandler(async (_req, res) => {
      const logs = await prisma.actionLog.findMany({
        where: { kind: "worker.status" },
        orderBy: { createdAt: "desc" },
        take: 100
      });
      const deduped = Object.values(
        logs.reduce<Record<string, typeof logs[number]>>((acc, log) => {
          if (!log.workerId) return acc;
          if (!acc[log.workerId]) {
            acc[log.workerId] = log;
          }
          return acc;
        }, {})
      );

      const shaped = deduped.map((log) => {
        const meta = (log.metadata as { queueDepth?: number; jobId?: number } | null) ?? {};
        return {
          workerId: log.workerId,
          status: log.message,
          lastHeartbeat: log.createdAt.toISOString(),
          currentJobId: meta.jobId ?? null,
          queueDepth: meta.queueDepth ?? null
        };
      });

      sendOk(res, shaped);
    })
  );
  return router;
};
