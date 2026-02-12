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
    aiMode: "mock",
    openAiKey: undefined,
    aiModel: "gpt-4.1-mini",
    sentryDsn: undefined,
    socketRedisHost: "localhost",
    socketRedisPort: 6379
  };
};

describe("queues/jobProcessor streamReviewForJob", () => {
  it("emits BullMQ progress and calls publishProgress callback", async () => {
    const config = makeConfig();
    const job = {
      updateProgress: jest.fn(async () => undefined)
    };
    const publishProgress = jest.fn(async () => undefined);
    const persistPartial = jest.fn(async () => undefined);
    const logLine = jest.fn(async () => undefined);

    const { result } = await streamReviewForJob(config, job, 999, "hello", { publishProgress, persistPartial, logLine });

    expect(job.updateProgress).toHaveBeenCalled();
    expect(publishProgress).toHaveBeenCalled();
    expect(persistPartial).toHaveBeenCalled();
    expect(result.summary).toContain("Mock");
  });
});
