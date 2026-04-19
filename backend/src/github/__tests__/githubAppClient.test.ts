import type { AppConfig } from "../../config";
import { getInstallationClient } from "../githubAppClient";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

jest.mock("@octokit/auth-app", () => ({ createAppAuth: jest.fn() }), { virtual: true });
jest.mock("@octokit/rest", () => ({ Octokit: jest.fn() }), { virtual: true });

describe("getInstallationClient", () => {
  const config = {
    githubAppId: 123,
    githubPrivateKey: "fake",
    githubWebhookSecret: "secret",
    githubClientId: "",
    githubClientSecret: "",
    sessionSecret: "",
    jwtIssuer: "devpilot",
    nodeEnv: "test",
    port: 0,
    frontendUrl: "http://localhost:5173",
    databaseUrl: "",
    redisUrl: "",
    queueName: "q",
    aiMode: "live",
    enableOpenAi: false,
    openAiKey: undefined,
    aiModel: "gpt-4.1-mini",
    sentryDsn: undefined,
    socketRedisHost: "localhost",
    socketRedisPort: 6379,
    apiRateLimitWindowMs: 60_000,
    apiRateLimitMax: 120
  } satisfies AppConfig;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates an installation-scoped octokit client", async () => {
    const authFn = jest.fn().mockResolvedValue({ token: "inst-token" });
    (createAppAuth as unknown as jest.Mock).mockReturnValue(authFn);
    (Octokit as unknown as jest.Mock).mockImplementation(() => ({ marker: true }));

    const client = await getInstallationClient(config, 777);

    expect(createAppAuth).toHaveBeenCalledWith({ appId: config.githubAppId, privateKey: config.githubPrivateKey });
    expect(authFn).toHaveBeenCalledWith({ type: "installation", installationId: 777 });
    expect(Octokit).toHaveBeenCalledWith({ auth: "inst-token" });
    expect(client).toEqual({ marker: true });
  });
});
