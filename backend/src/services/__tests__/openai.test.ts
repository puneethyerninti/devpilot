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

const streamFromChunks = (chunks: string[]) => {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    }
  });
};

const makeConfig = (partial?: Partial<AppConfig>): AppConfig => {
  return {
    ...partial,
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
    aiMode: "live",
    enableOpenAi: true,
    openAiKey: "test-openai-key",
    aiModel: "gpt-4.1-mini",
    sentryDsn: undefined,
    socketRedisHost: "localhost",
    socketRedisPort: 6379,
    apiRateLimitWindowMs: 60_000,
    apiRateLimitMax: 120
  };
};

describe("services/openai streamReview", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("streams chunks in live mode and records usage when jobId present", async () => {
    const config = makeConfig();
    const deltas: string[] = [];
    const progresses: number[] = [];

    const ssePayload = [
      'data: {"choices":[{"delta":{"content":"{\\"summary\\":\\"Strong PR overall\\",\\"findings\\":["}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"{\\"severity\\":\\"medium\\",\\"file\\":\\"src/app.ts\\",\\"line\\":12,\\"explanation\\":\\"Validate input\\"}]"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"}"}}]}\n\n',
      "data: [DONE]\n\n"
    ];

    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(streamFromChunks(ssePayload), {
        status: 200,
        headers: { "Content-Type": "text/event-stream" }
      })
    );

    const result = await streamReview(config, {
      prompt: "review this diff",
      metadata: { jobId: 123, repo: "acme/repo", prNumber: 7 },
      onChunk: async (chunk) => {
        if (chunk.type === "delta") deltas.push(chunk.text);
        if (chunk.type === "progress") progresses.push(chunk.progress);
      }
    });

    expect(deltas.join(" ")).toContain("summary");
    expect(progresses.length).toBeGreaterThan(0);
    expect(result.summary).toContain("Strong PR overall");
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
