// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { Router } from "express";
import { prisma } from "../../prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import { sendOk } from "../../utils/http";

export const createUserRouter = () => {
  const router = Router();
  router.get(
    "/me",
    requireAuth,
    asyncHandler(async (req, res) => {
      const profile = await prisma.user.findUnique({ where: { id: req.user!.sub } });
      sendOk(res, profile);
    })
  );
  return router;
};
