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

import { streamReviewForJob } from "../jobProcessor";

const streamFromChunks = (chunks: string[]) => {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    }
  });
};

const makeConfig = (): AppConfig => {
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

describe("queues/jobProcessor streamReviewForJob", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("emits BullMQ progress and calls publishProgress callback", async () => {
    const config = makeConfig();
    const job = {
      updateProgress: jest.fn(async () => undefined)
    };
    const publishProgress = jest.fn(async () => undefined);
    const persistPartial = jest.fn(async () => undefined);
    const logLine = jest.fn(async () => undefined);

    const ssePayload = [
      'data: {"choices":[{"delta":{"content":"{\\"summary\\":\\"Review complete\\",\\"findings\\":[{"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"\\"severity\\":\\"low\\",\\"file\\":\\"src/index.ts\\",\\"line\\":1,\\"explanation\\":\\"Looks fine\\"}]"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"}"}}]}\n\n',
      "data: [DONE]\n\n"
    ];

    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(streamFromChunks(ssePayload), {
        status: 200,
        headers: { "Content-Type": "text/event-stream" }
      })
    );

    const { result } = await streamReviewForJob(config, job, 999, "hello", { publishProgress, persistPartial, logLine });

    expect(job.updateProgress).toHaveBeenCalled();
    expect(publishProgress).toHaveBeenCalled();
    expect(persistPartial).toHaveBeenCalled();
    expect(result.summary).toContain("Review complete");
  });
});
