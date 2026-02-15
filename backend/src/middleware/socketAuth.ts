import type { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import type { AppConfig } from "../config";

export type SocketUser = {
  sub: string;
  role: "viewer" | "operator" | "admin";
  login: string;
};

declare module "socket.io" {
  interface Socket {
    user?: SocketUser;
  }
}

const extractToken = (socket: Socket) => {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.trim()) return authToken;

  const header = socket.handshake.headers.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice("Bearer ".length);
  }

  const cookieHeader = socket.handshake.headers.cookie;
  if (typeof cookieHeader === "string") {
    const match = cookieHeader.match(/(?:^|;\s*)devpilot_session=([^;]+)/);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }

  return undefined;
};

export const verifySocketAuth = (config: AppConfig) => {
  return (socket: Socket, next: (err?: Error) => void) => {
    const token = extractToken(socket);
    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, config.sessionSecret, { issuer: config.jwtIssuer }) as SocketUser;
      socket.user = decoded;
      return next();
    } catch {
      return next(new Error("Invalid authentication token"));
    }
  };
};
