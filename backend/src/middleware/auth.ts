// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client";
import { asyncHandler } from "../utils/asyncHandler";
import { sendError, sendOk } from "../utils/http";
import type { AppConfig } from "../config";

export type UserRole = "viewer" | "operator" | "admin";

const SESSION_COOKIE = "devpilot_session";

interface JwtPayload {
  sub: string;
  role: UserRole;
  login: string;
}

declare global {
  /* eslint-disable @typescript-eslint/no-namespace */
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      user?: JwtPayload;
    }
  }
  /* eslint-enable @typescript-eslint/no-namespace */
}

const roleRank: Record<UserRole, number> = {
  viewer: 0,
  operator: 1,
  admin: 2
};

const signToken = (payload: JwtPayload, config: AppConfig) =>
  jwt.sign(payload, config.sessionSecret, {
    issuer: config.jwtIssuer,
    audience: "devpilot",
    expiresIn: "7d"
  });

export const createAuthRouter = (config: AppConfig) => {
  const router = Router();

  router.get("/auth/github", (req, res) => {
    const state = encodeURIComponent(jwt.sign({ nonce: Date.now() }, config.sessionSecret, { expiresIn: "10m" }));
    const origin = `${req.protocol}://${req.get("host")}`;
    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", config.githubClientId);
    url.searchParams.set("scope", "read:user user:email repo");
    url.searchParams.set("redirect_uri", `${origin}/auth/github/callback`);
    url.searchParams.set("state", state);
    res.redirect(url.toString());
  });

  router.get(
    "/auth/github/callback",
    asyncHandler(async (req, res) => {
      const { code, state } = req.query;
      if (!code || typeof code !== "string") {
        return sendError(res, "Invalid OAuth code", 400);
      }
      if (!state || typeof state !== "string") {
        return sendError(res, "Missing OAuth state", 400);
      }
      try {
        jwt.verify(decodeURIComponent(state), config.sessionSecret);
      } catch {
        return sendError(res, "Invalid OAuth state", 400);
      }

      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          client_id: config.githubClientId,
          client_secret: config.githubClientSecret,
          code
        })
      }).then((r) => r.json() as Promise<{ access_token?: string }>);

      if (!tokenResponse.access_token) {
        return sendError(res, "GitHub token exchange failed", 401);
      }

      const ghProfile = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
      }).then((r) => r.json() as Promise<{ id: number; login: string; name?: string; avatar_url?: string }>);

      const user = await prisma.user.upsert({
        where: { githubId: ghProfile.id.toString() },
        create: {
          githubId: ghProfile.id.toString(),
          login: ghProfile.login,
          name: ghProfile.name ?? ghProfile.login,
          avatarUrl: ghProfile.avatar_url ?? "",
          role: "viewer"
        },
        update: {
          login: ghProfile.login,
          name: ghProfile.name ?? ghProfile.login,
          avatarUrl: ghProfile.avatar_url ?? ""
        }
      });

      const token = signToken({ sub: user.id, role: user.role as UserRole, login: user.login }, config);

      res
        .cookie(SESSION_COOKIE, token, {
          httpOnly: true,
          sameSite: "lax",
          secure: config.nodeEnv === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000
        })
        .redirect(config.frontendUrl);
    })
  );

  router.post("/auth/logout", (req, res) => {
    res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "lax", secure: config.nodeEnv === "production" });
    sendOk(res, { message: "Logged out" });
  });

  return router;
};

export const attachUser = (config: AppConfig) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    // Respect any user injected earlier (e.g., demoAuth in dev)
    if (req.user) return next();
    const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
    if (!token) {
      return next();
    }
    try {
      req.user = jwt.verify(token, config.sessionSecret, { issuer: config.jwtIssuer }) as JwtPayload;
    } catch {
      // ignore invalid token
    }
    next();
  };
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return sendError(res, "Authentication required", 401);
  }
  return next();
};

export const requireRole = (role: UserRole) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return sendError(res, "Authentication required", 401);
  }
  if (roleRank[req.user.role] < roleRank[role]) {
    return sendError(res, "Insufficient permissions", 403);
  }
  return next();
};
