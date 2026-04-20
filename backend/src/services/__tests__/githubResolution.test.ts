import type { AppConfig } from "../../config";
import { resolveLivePullRequestContext } from "../githubResolution";
import { getInstallationClient, getRepoInstallationId } from "../../github/githubAppClient";

jest.mock("../../github/githubAppClient", () => ({
  getInstallationClient: jest.fn(),
  getRepoInstallationId: jest.fn()
}));

describe("resolveLivePullRequestContext", () => {
  const config = {
    githubAppId: 123,
    githubPrivateKey: "fake",
    githubWebhookSecret: "secret",
    githubClientId: "",
    githubClientSecret: "",
    sessionSecret: "session",
    jwtIssuer: "devpilot",
    nodeEnv: "test",
    port: 4000,
    frontendUrl: "http://localhost:5173",
    databaseUrl: "http://db.local",
    redisUrl: "http://redis.local",
    queueName: "q",
    aiMode: "mock",
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

  it("keeps provided installation id and head sha", async () => {
    const result = await resolveLivePullRequestContext(config, {
      repo: "acme/platform",
      prNumber: 42,
      headSha: "abc123def",
      installationId: 777
    });

    expect(result).toEqual({
      owner: "acme",
      repoName: "platform",
      headSha: "abc123def",
      installationId: 777
    });

    expect(getRepoInstallationId).not.toHaveBeenCalled();
    expect(getInstallationClient).not.toHaveBeenCalled();
  });

  it("resolves missing installation and head sha from GitHub", async () => {
    (getRepoInstallationId as unknown as jest.Mock).mockResolvedValue(999);
    (getInstallationClient as unknown as jest.Mock).mockResolvedValue({
      pulls: {
        get: jest.fn().mockResolvedValue({ data: { head: { sha: "resolvedsha" } } })
      }
    });

    const result = await resolveLivePullRequestContext(config, {
      repo: "octo/project",
      prNumber: 9
    });

    expect(getRepoInstallationId).toHaveBeenCalledWith(config, "octo", "project");
    expect(getInstallationClient).toHaveBeenCalledWith(config, 999);
    expect(result).toEqual({
      owner: "octo",
      repoName: "project",
      headSha: "resolvedsha",
      installationId: 999
    });
  });
});
