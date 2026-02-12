import type { AppConfig } from "../../config";

jest.mock("../../prisma/client", () => {
  return {
    prisma: {
      aiUsage: {
        create: jest.fn(async () => ({ id: 1 }))
      }
    }
  };
});

import { prisma } from "../../prisma/client";
import { streamReview } from "../openai";

const makeConfig = (partial?: Partial<AppConfig>): AppConfig => {
  return {
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
    openAiKey: undefined,
    aiModel: "gpt-4.1-mini",
    sentryDsn: undefined,
    socketRedisHost: "localhost",
    socketRedisPort: 6379,
    ...partial
  };
};

describe("services/openai streamReview", () => {
  it("streams chunks in mock mode and records usage when jobId present", async () => {
    const config = makeConfig({ aiMode: "mock" });
    const deltas: string[] = [];
    const progresses: number[] = [];

    const result = await streamReview(config, {
      prompt: "review this diff",
      metadata: { jobId: 123, repo: "acme/repo", prNumber: 7 },
      onChunk: async (chunk) => {
        if (chunk.type === "delta") deltas.push(chunk.text);
        if (chunk.type === "progress") progresses.push(chunk.progress);
      }
    });

    expect(deltas.join("")).toContain("mock");
    expect(progresses.length).toBeGreaterThan(0);
    expect(result.summary).toContain("Mock");
    expect(result.findings.length).toBeGreaterThan(0);

    expect(prisma.aiUsage.create).toHaveBeenCalledTimes(1);
    expect(prisma.aiUsage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          jobId: 123,
          provider: "openai"
        })
      })
    );
  });
});
