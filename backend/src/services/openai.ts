import type { AppConfig } from "../config";
import { prisma } from "../prisma/client";
import { logger } from "../utils/logger";

export type ReviewSeverity = "low" | "medium" | "high" | "critical";

export type ReviewFinding = {
  severity: ReviewSeverity;
  file: string;
  line: number;
  suggestedFix?: string;
  explanation: string;
};

export type FinalReviewResult = {
  summary: string;
  findings: ReviewFinding[];
  model: string;
  rawText: string;
  rawJson?: unknown;
  tokenCount: number;
  costCents: number;
};

export type ReviewChunk =
  | { type: "delta"; text: string }
  | { type: "progress"; progress: number }
  | { type: "error"; message: string };

export type StreamReviewArgs = {
  prompt: string;
  metadata: {
    jobId?: number;
    repo?: string;
    prNumber?: number;
    model?: string;
  };
  onChunk?: (chunk: ReviewChunk) => void | Promise<void>;
  onFinish?: (result: FinalReviewResult) => void | Promise<void>;
  onError?: (err: Error) => void | Promise<void>;
};

export type OpenAIClient = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

const envFlag = (name: string, fallback: boolean) => {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  return raw === "1" || raw.toLowerCase() === "true" || raw.toLowerCase() === "yes";
};

export const createOpenAIClient = (config: AppConfig): OpenAIClient => {
  if (!config.openAiKey) {
    throw new Error("OPENAI_API_KEY missing");
  }

  return {
    apiKey: config.openAiKey,
    baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
    model: config.aiModel
  };
};

export const estimateTokens = (text: string) => {
  // Rough heuristic for English/code mixed input: ~4 chars/token.
  return Math.max(1, Math.ceil(text.length / 4));
};

const costCentsPer1kTokens = () => {
  const raw = process.env.OPENAI_COST_CENTS_PER_1K_TOKENS;
  if (!raw) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const recordCost = async (metadata: { jobId?: number; model: string; tokenCount: number; costCents: number; raw?: unknown }) => {
  if (!metadata.jobId) return;
  await prisma.aiUsage.create({
    data: {
      jobId: metadata.jobId,
      provider: "openai",
      model: metadata.model,
      tokenCount: metadata.tokenCount,
      costCents: metadata.costCents,
      metadata: metadata.raw as never
    }
  });
};

const mockFinalResult = (prompt: string, model: string): FinalReviewResult => {
  const tokenCount = estimateTokens(prompt) + 128;
  const costCents = Math.round((tokenCount / 1000) * costCentsPer1kTokens());
  const summary = "Mock AI review summary (AI_MODE=mock).";
  const findings: ReviewFinding[] = [
    {
      severity: "medium",
      file: "src/example.ts",
      line: 42,
      suggestedFix: "Add input validation before using the value.",
      explanation: "This is a mock finding to validate end-to-end streaming."
    }
  ];
  const rawJson = { summary, findings };
  return { summary, findings, model, rawText: JSON.stringify(rawJson), rawJson, tokenCount, costCents };
};

const tryParseJson = (text: string): unknown | null => {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
};

const coerceFinalResult = (text: string, model: string, tokenCount: number, costCents: number): FinalReviewResult => {
  const rawJson = tryParseJson(text);
  if (rawJson && typeof rawJson === "object") {
    const maybe = rawJson as { summary?: unknown; findings?: unknown };
    const summary = typeof maybe.summary === "string" ? maybe.summary : "AI review";
    const findings: ReviewFinding[] = Array.isArray(maybe.findings)
      ? (maybe.findings
          .map((f) => {
            const obj = f as Record<string, unknown>;
            const severity = obj.severity;
            const file = obj.file;
            const line = obj.line;
            const explanation = obj.explanation;
            const suggestedFix = obj.suggestedFix;
            if (typeof severity !== "string" || typeof file !== "string" || typeof line !== "number" || typeof explanation !== "string") return null;
            const sev = severity.toLowerCase();
            const normalized: ReviewSeverity = sev === "critical" || sev === "high" || sev === "medium" || sev === "low" ? (sev as ReviewSeverity) : "medium";
            return {
              severity: normalized,
              file,
              line,
              explanation,
              ...(typeof suggestedFix === "string" ? { suggestedFix } : {})
            } satisfies ReviewFinding;
          })
          .filter(Boolean) as ReviewFinding[])
      : [];

    return { summary, findings, model, rawText: text, rawJson, tokenCount, costCents };
  }

  const summary = text.trim().slice(0, 2000) || "AI response missing";
  return { summary, findings: [], model, rawText: text, tokenCount, costCents };
};

export const streamReview = async (config: AppConfig, args: StreamReviewArgs): Promise<FinalReviewResult> => {
  const mode = config.aiMode;
  const enableOpenAi = envFlag("ENABLE_OPENAI", true);
  const model = args.metadata.model ?? config.aiModel;

  if (mode === "mock" || !enableOpenAi) {
    const chunks = ["Starting mock analysis...\n", "Reviewing diffs...\n", "Generating summary...\n"];
    for (let i = 0; i < chunks.length; i++) {
      await args.onChunk?.({ type: "progress", progress: Math.round(((i + 1) / chunks.length) * 90) });
      await args.onChunk?.({ type: "delta", text: chunks[i] });
    }
    const result = mockFinalResult(args.prompt, model);
    await recordCost({ jobId: args.metadata.jobId, model, tokenCount: result.tokenCount, costCents: result.costCents, raw: result.rawJson });
    await args.onFinish?.(result);
    return result;
  }

  const client = createOpenAIClient(config);
  const system =
    "You are a senior staff code reviewer. Return STRICT JSON only (no markdown). Schema: {" +
    "\"summary\": string, \"findings\": Array<{severity: 'low'|'medium'|'high'|'critical', file: string, line: number, suggestedFix?: string, explanation: string}>}";

  const body = {
    model,
    stream: true,
    messages: [
      { role: "system", content: system },
      { role: "user", content: args.prompt }
    ]
  };

  const tokenCountEstimate = estimateTokens(system + "\n" + args.prompt);
  await args.onChunk?.({ type: "progress", progress: 5 });

  let response: Response;
  try {
    response = await fetch(`${client.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${client.apiKey}`
      },
      body: JSON.stringify(body)
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    await args.onError?.(error);
    throw error;
  }

  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => "");
    const error = new Error(`OpenAI request failed (${response.status}): ${text || response.statusText}`);
    await args.onError?.(error);
    throw error;
  }

  const decoder = new TextDecoder("utf-8");
  const reader = response.body.getReader();
  let buffer = "";
  let output = "";
  let emittedProgress = 5;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice("data:".length).trim();
        if (payload === "[DONE]") {
          emittedProgress = Math.max(emittedProgress, 95);
          await args.onChunk?.({ type: "progress", progress: emittedProgress });
          continue;
        }
        let parsed: any;
        try {
          parsed = JSON.parse(payload);
        } catch {
          continue;
        }

        const delta: string | undefined = parsed?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta.length) {
          output += delta;
          await args.onChunk?.({ type: "delta", text: delta });
          const nextProgress = Math.min(95, 5 + Math.floor(output.length / 200));
          if (nextProgress > emittedProgress) {
            emittedProgress = nextProgress;
            await args.onChunk?.({ type: "progress", progress: emittedProgress });
          }
        }
      }
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    await args.onError?.(error);
    throw error;
  }

  const tokenCount = tokenCountEstimate + estimateTokens(output);
  const costCents = Math.round((tokenCount / 1000) * costCentsPer1kTokens());
  const result = coerceFinalResult(output, model, tokenCount, costCents);

  try {
    await recordCost({ jobId: args.metadata.jobId, model, tokenCount, costCents, raw: result.rawJson });
  } catch (err) {
    logger.warn("ai.usage_record_failed", { err: (err as Error).message, jobId: args.metadata.jobId });
  }

  await args.onChunk?.({ type: "progress", progress: 100 });
  await args.onFinish?.(result);
  return result;
};
