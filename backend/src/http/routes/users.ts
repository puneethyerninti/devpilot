// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { Router } from "express";
import { prisma } from "../../prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendOk } from "../../utils/http";

export const createUserRouter = () => {
  const router = Router();
  router.get(
    "/me",
    asyncHandler(async (req, res) => {
      if (!req.user) {
        return sendOk(res, null);
      }

      const profile = await prisma.user.findUnique({ where: { id: req.user!.sub } });
      if (profile) {
        return sendOk(res, profile);
      }

      return sendOk(res, {
        id: req.user!.sub,
        login: req.user!.login,
        role: req.user!.role,
        name: req.user!.login,
        avatarUrl: null
      });
    })
  );
  return router;
};
