// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { z } from "zod";

const configSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  port: z.coerce.number().default(4000),
  frontendUrl: z.string().url(),
  databaseUrl: z.string().url(),
  redisUrl: z.string().url(),
  queueName: z.string().default("pr-jobs"),
  githubClientId: z.string(),
  githubClientSecret: z.string(),
  githubWebhookSecret: z.string().optional(),
  githubOAuthCallback: z.string().url().optional(),
  githubAppId: z.coerce.number(),
  githubPrivateKey: z.string().optional(),
  sessionSecret: z.string(),
  jwtIssuer: z.string().default("devpilot"),
  aiMode: z.enum(["live", "mock"]).default("live"),
  enableOpenAi: z.coerce.boolean().default(true),
  openAiKey: z.string().optional(),
  aiModel: z.string().default("gpt-4.1-mini"),
  sentryDsn: z.string().optional(),
  socketRedisHost: z.string().default("localhost"),
  socketRedisPort: z.coerce.number().default(6379),
  apiRateLimitWindowMs: z.coerce.number().default(60_000),
  apiRateLimitMax: z.coerce.number().default(120)
});

export type AppConfig = z.infer<typeof configSchema>;

export const loadConfig = (): AppConfig => {
  const result = configSchema.safeParse({
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    frontendUrl: process.env.FRONTEND_URL,
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    queueName: process.env.QUEUE_NAME,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    githubWebhookSecret: process.env.GITHUB_WEBHOOK_SECRET ?? process.env.GITHUB_APP_WEBHOOK_SECRET,
    githubOAuthCallback: process.env.GITHUB_OAUTH_CALLBACK,
    githubAppId: process.env.GITHUB_APP_ID,
    githubPrivateKey: process.env.GITHUB_PRIVATE_KEY,
    sessionSecret: process.env.JWT_SECRET ?? process.env.SESSION_SECRET,
    jwtIssuer: process.env.JWT_ISSUER,
    aiMode: process.env.AI_MODE,
    enableOpenAi: process.env.ENABLE_OPENAI,
    openAiKey: process.env.OPENAI_API_KEY,
    aiModel: process.env.AI_MODEL,
    sentryDsn: process.env.SENTRY_DSN,
    socketRedisHost: process.env.SOCKET_REDIS_HOST,
    socketRedisPort: process.env.SOCKET_REDIS_PORT,
    apiRateLimitWindowMs: process.env.API_RATE_LIMIT_WINDOW_MS,
    apiRateLimitMax: process.env.API_RATE_LIMIT_MAX
  });

  if (!result.success) {
    throw new Error(`Invalid configuration: ${result.error.message}`);
  }

  const hasInlineKey = Boolean(result.data.githubPrivateKey?.trim());
  const hasFileKey = Boolean(process.env.GITHUB_PRIVATE_KEY_FILE?.trim());
  const hasBase64Key = Boolean(process.env.GITHUB_PRIVATE_KEY_BASE64?.trim());
  if (!hasInlineKey && !hasFileKey && !hasBase64Key) {
    throw new Error("Invalid configuration: provide one of GITHUB_PRIVATE_KEY, GITHUB_PRIVATE_KEY_FILE, or GITHUB_PRIVATE_KEY_BASE64");
  }

  return {
    ...result.data,
    githubPrivateKey: result.data.githubPrivateKey ?? ""
  };
};
