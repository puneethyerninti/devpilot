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
    asyncHandler(async (_req, res) => {
      const repos = await prisma.repo.findMany({ orderBy: { name: "asc" } });
      sendOk(res, repos);
    })
  );
  return router;
};
