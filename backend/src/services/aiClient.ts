// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { logger } from "../utils/logger";
import type { AppConfig } from "../config";

type AnalysisInput = {
  repo: string;
  prNumber: number;
  chunks: Array<{ file: string; hunk: string; startLine: number; endLine: number }>;
};

export type AiResult = {
  summary: string;
  aiResponseRaw: Record<string, unknown>;
  tokenCount: number;
  costCents: number;
  inlineSuggestions: Array<{ file: string; startLine: number; endLine: number; suggestion: string; severity: string }>;
  riskScore: { level: "low" | "medium" | "high"; reason: string };
};

export class AiClient {
  constructor(private readonly config: AppConfig) {}

  async summarize(input: AnalysisInput, opts?: { forceLive?: boolean }): Promise<AiResult> {
    const mode: "live" | "mock" = opts?.forceLive ? "live" : this.config.aiMode;

    if (mode === "mock") {
      logger.info("ai.mock", { repo: input.repo, prNumber: input.prNumber });
      return {
        summary: `Mock summary for ${input.repo}#${input.prNumber} covering ${input.chunks.length} hunks`,
        aiResponseRaw: { provider: "mock", chunks: input.chunks.slice(0, 2) },
        tokenCount: 256,
        costCents: 0,
        inlineSuggestions: input.chunks.slice(0, 2).map((c, idx) => ({
          file: c.file,
          startLine: c.startLine,
          endLine: c.endLine,
          suggestion: `Mock suggestion ${idx + 1} on ${c.file}`,
          severity: "medium"
        })),
        riskScore: { level: "medium", reason: "mock-mode placeholder" }
      };
    }

    if (!this.config.openAiKey) {
      throw new Error("OPENAI_API_KEY missing while AI_MODE=live");
    }

    const prompt = `You are an expert code reviewer. Given PR hunks, produce: \n1) summary (3 bullet points max)\n2) inline suggestions array as JSON: [{file,startLine,endLine,suggestion,severity}]\n3) riskScore: one of low|medium|high with reason. Respond as JSON with keys summary, inlineSuggestions, riskScore.`;

    const userContent = input.chunks
      .map((c, i) => `Hunk ${i + 1}: ${c.file}:${c.startLine}-${c.endLine}\n${c.hunk}`)
      .join("\n\n");

    const body = {
      model: this.config.aiModel,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userContent.slice(0, 6000) }
      ]
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.openAiKey}`
      },
      body: JSON.stringify(body)
    }).then((r) => r.json() as Promise<{ choices: Array<{ message: { content: string } }>; usage?: { total_tokens?: number } }>);

    const rawContent = response.choices[0]?.message?.content ?? "";
    let parsed: { summary?: string; inlineSuggestions?: AiResult["inlineSuggestions"]; riskScore?: AiResult["riskScore"] } = {};
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      parsed.summary = rawContent || "AI response missing";
    }

    const summary = parsed.summary ?? rawContent ?? "AI response missing";
    const inlineSuggestions = parsed.inlineSuggestions ?? [];
    const riskScore = parsed.riskScore ?? { level: "medium", reason: "not provided" };
    const tokenCount = response.usage?.total_tokens ?? summary.length / 4;
    const costCents = Math.round(tokenCount * 0.0025); // placeholder pricing

    return {
      summary,
      aiResponseRaw: response as Record<string, unknown>,
      tokenCount,
      costCents,
      inlineSuggestions,
      riskScore
    };
  }
}
