import { Counter, Histogram, Registry, collectDefaultMetrics } from "prom-client";

export const metricsRegistry = new Registry();
collectDefaultMetrics({ register: metricsRegistry });

export const jobCountTotal = new Counter({
  name: "job_count_total",
  help: "Total number of PR jobs by terminal status",
  labelNames: ["status"],
  registers: [metricsRegistry]
});

export const jobDurationSeconds = new Histogram({
  name: "job_duration_seconds",
  help: "PR job processing duration in seconds",
  buckets: [1, 2, 5, 10, 30, 60, 120, 300],
  registers: [metricsRegistry]
});

export const openAiTokensConsumedTotal = new Counter({
  name: "openai_tokens_consumed_total",
  help: "Total OpenAI tokens consumed",
  registers: [metricsRegistry]
});

export const githubApiRequestsTotal = new Counter({
  name: "github_api_requests_total",
  help: "Total GitHub API requests attempted",
  labelNames: ["operation"],
  registers: [metricsRegistry]
});
