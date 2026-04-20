import jwt from "jsonwebtoken";
import type { AppConfig } from "../../config";
import { verifySocketAuth } from "../socketAuth";

const baseConfig: AppConfig = {
  nodeEnv: "test",
  port: 4000,
  frontendUrl: "http://localhost:5173",
  databaseUrl: "postgresql://devpilot:devpilot@localhost:5432/devpilotdb",
  redisUrl: "redis://localhost:6379",
  queueName: "pr-jobs",
  githubClientId: "",
  githubClientSecret: "",
  githubWebhookSecret: "secret",
  githubAppId: 1,
  githubPrivateKey: "key",
  sessionSecret: "secret",
  jwtIssuer: "devpilot",
  aiMode: "mock",
  enableOpenAi: true,
  openAiKey: undefined,
  aiModel: "gpt-4.1-mini",
  sentryDsn: undefined,
  socketRedisHost: "localhost",
  socketRedisPort: 6379,
  apiRateLimitWindowMs: 60000,
  apiRateLimitMax: 120
};

describe("socketAuth middleware", () => {
  type SocketArg = Parameters<ReturnType<typeof verifySocketAuth>>[0];

  it("accepts valid JWT in handshake auth token", (done) => {
    const token = jwt.sign({ sub: "u1", role: "operator", login: "alice" }, baseConfig.sessionSecret, {
      issuer: baseConfig.jwtIssuer,
      audience: "devpilot"
    });

    const socket = {
      handshake: {
        auth: { token },
        headers: {}
      }
    } as unknown as SocketArg;

    verifySocketAuth(baseConfig)(socket, (err?: Error) => {
      expect(err).toBeUndefined();
      const socketUser = socket as SocketArg & { user?: { login?: string } };
      expect(socketUser.user?.login).toBe("alice");
      done();
    });
  });

  it("rejects missing auth token", (done) => {
    const socket = {
      handshake: {
        auth: {},
        headers: {}
      }
    } as unknown as SocketArg;

    verifySocketAuth(baseConfig)(socket, (err?: Error) => {
      expect(err).toBeInstanceOf(Error);
      done();
    });
  });
});
