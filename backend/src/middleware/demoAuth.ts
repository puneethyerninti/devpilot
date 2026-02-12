// Lightweight dev-only auth shim for demos. Do not enable in production.
import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export const demoAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== "development") return next();

  const demoToken = process.env.DEMO_TOKEN;
  const authz = req.get("authorization") ?? "";
  if (demoToken && authz === `Bearer ${demoToken}`) {
    req.user = { sub: "demo", role: "admin", login: "demo" } as typeof req.user;
    if (process.env.DEMO_LOG !== "silent") {
      logger.debug("demoAuth.applied", { login: req.user.login, role: req.user.role });
    }
  }

  return next();
};
