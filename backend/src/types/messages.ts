// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
export type JobLifecycleStatus = "queued" | "processing" | "done" | "failed";

export type OutboundSocketMessage =
  | { type: "job.created"; payload: { id: number; repo: string; status: JobLifecycleStatus } }
  | { type: "job.updated"; payload: { id: number; status: JobLifecycleStatus; startedAt?: string; finishedAt?: string; error?: string } }
  | { type: "job.log"; payload: { id: number; line: string; ts: string } }
  | { type: "job.completed"; payload: { id: number; summary: string; tokenCount: number; costCents: number } }
  | { type: "job.failed"; payload: { id: number; error?: string } }
  | { type: "worker.status"; payload: { workerId: string; status: "online" | "offline"; queueDepth: number; updatedAt: string } };
