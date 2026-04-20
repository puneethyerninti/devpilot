// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client";
import { asyncHandler } from "../utils/asyncHandler";
import { sendError, sendOk } from "../utils/http";
import type { AppConfig } from "../config";
import {
  buildGitHubAuthorizeUrl,
  createOAuthState,
  exchangeCodeForAccessToken,
  fetchGitHubProfile,
  verifyOAuthState
} from "../auth/githubOauth";

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

const configuredAdminLogins = () =>
  (process.env.ADMIN_GITHUB_LOGINS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

const shouldGrantBootstrapAdmin = async (config: AppConfig, login: string, existingRole?: UserRole) => {
  if (existingRole) return existingRole;

  const loginLower = login.toLowerCase();
  if (configuredAdminLogins().includes(loginLower)) {
    return "admin" as UserRole;
  }

  if (config.nodeEnv === "production") {
    return "viewer" as UserRole;
  }

  const adminCount = await prisma.user.count({ where: { role: "admin" } });
  return adminCount === 0 ? ("admin" as UserRole) : ("viewer" as UserRole);
};

export const createAuthRouter = (config: AppConfig) => {
  const router = Router();

  router.get("/auth/github", (req, res) => {
    if (!config.githubClientId || !config.githubClientSecret) {
      return sendError(res, "GitHub OAuth not configured", 503);
    }

    const state = createOAuthState(config);
    const origin = `${req.protocol}://${req.get("host")}`;
    const url = buildGitHubAuthorizeUrl(config, origin, state);
    res.redirect(url);
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
        verifyOAuthState(state, config);
      } catch {
        return sendError(res, "Invalid OAuth state", 400);
      }

      const accessToken = await exchangeCodeForAccessToken(config, code);
      if (!accessToken) {
        return sendError(res, "GitHub token exchange failed", 401);
      }

      const ghProfile = await fetchGitHubProfile(accessToken);

      const existing = await prisma.user.findUnique({ where: { githubId: ghProfile.id.toString() } });
      const roleForCreate = await shouldGrantBootstrapAdmin(config, ghProfile.login, existing?.role as UserRole | undefined);

      const user = await prisma.user.upsert({
        where: { githubId: ghProfile.id.toString() },
        create: {
          githubId: ghProfile.id.toString(),
          login: ghProfile.login,
          name: ghProfile.name ?? ghProfile.login,
          avatarUrl: ghProfile.avatar_url ?? "",
          role: roleForCreate
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
    if (req.user) return next();
    const cookieToken = req.cookies?.[SESSION_COOKIE] as string | undefined;
    const header = req.get("authorization") ?? "";
    const bearerToken = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
    const token = bearerToken ?? cookieToken;
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
