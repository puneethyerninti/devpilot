import express from "express";
import request from "supertest";
import crypto from "node:crypto";
import { createWebhookRouter } from "../webhooks";
import type { AppConfig } from "../../../config";
import type { Queue } from "bullmq";
import type { JobPayload } from "../../../queues/jobProcessor";

jest.mock("../../../queues", () => {
  const enqueuePullRequestJob = jest.fn();
  return { enqueuePullRequestJob, __enqueueMock: enqueuePullRequestJob };
});

jest.mock("../../../prisma/client", () => {
  const webhookEvent = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  };
  return { prisma: { webhookEvent }, __webhookMock: webhookEvent };
});

type WebhookMock = { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock };
const getWebhookMock = (): WebhookMock => (jest.requireMock("../../../prisma/client") as { __webhookMock: WebhookMock }).__webhookMock;
const getEnqueueMock = (): jest.Mock => (jest.requireMock("../../../queues") as { __enqueueMock: jest.Mock }).__enqueueMock;

describe("webhooks route", () => {
  const secret = "unit-secret";
  const config = {
    githubWebhookSecret: secret,
    githubAppId: 1,
    githubPrivateKey: "test",
    nodeEnv: "test",
    port: 0,
    frontendUrl: "http://localhost:5173",
    databaseUrl: "",
    redisUrl: "redis://localhost:6379",
    queueName: "pr-jobs",
    githubClientId: "",
    githubClientSecret: "",
    sessionSecret: "session",
    jwtIssuer: "devpilot",
    aiMode: "mock",
    openAiKey: undefined,
    aiModel: "gpt-4.1-mini",
    sentryDsn: undefined,
    socketRedisHost: "localhost",
    socketRedisPort: 6379
  } satisfies AppConfig;

  const buildApp = () => {
    const app = express();
    app.use(
      express.json({
        verify: (req, _res, buf) => {
          (req as express.Request & { rawBody?: Buffer }).rawBody = Buffer.from(buf);
        }
      })
    );
    const queue = { add: jest.fn() } as unknown as Queue<JobPayload>;
    app.use("/api/webhooks", createWebhookRouter(config, queue));
    return app;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("accepts a valid signed pull_request webhook and enqueues", async () => {
    const payload = {
      action: "opened",
      pull_request: { number: 7, head: { sha: "abc123" }, title: "Add stuff" },
      repository: { full_name: "org/repo" },
      installation: { id: 99 },
      sender: { login: "alice" }
    };
    const raw = JSON.stringify(payload);
    const signature = "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
    const webhookMock = getWebhookMock();
    const enqueueMock = getEnqueueMock();
    webhookMock.findUnique.mockResolvedValueOnce(null);
    webhookMock.create.mockResolvedValueOnce({ id: 1 });
    enqueueMock.mockResolvedValueOnce({});

    const res = await request(buildApp())
      .post("/api/webhooks/github")
      .set("X-GitHub-Event", "pull_request")
      .set("X-GitHub-Delivery", "delivery-1")
      .set("X-Hub-Signature-256", signature)
      .send(payload);

    expect(res.status).toBe(200);
    expect(enqueueMock).toHaveBeenCalledWith(expect.anything(), {
      repo: "org/repo",
      prNumber: 7,
      headSha: "abc123",
      triggeredBy: "alice",
      installationId: 99,
      deliveryId: "delivery-1"
    });
  });

  it("dedupes by delivery id", async () => {
    const webhookMock = getWebhookMock();
    const enqueueMock = getEnqueueMock();
    webhookMock.findUnique.mockResolvedValueOnce({ id: 123 });
    const payload = { action: "opened", pull_request: { number: 1, head: { sha: "x" } }, repository: { full_name: "o/r" }, installation: { id: 1 } };
    const raw = JSON.stringify(payload);
    const signature = "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");

    const res = await request(buildApp())
      .post("/api/webhooks/github")
      .set("X-GitHub-Event", "pull_request")
      .set("X-GitHub-Delivery", "delivery-dup")
      .set("X-Hub-Signature-256", signature)
      .send(payload);

    expect(res.status).toBe(202);
    expect(enqueueMock).not.toHaveBeenCalled();
    expect(webhookMock.create).not.toHaveBeenCalled();
  });
});
