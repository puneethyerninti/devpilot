// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { io, Socket } from "socket.io-client";
import type { QueryClient } from "@tanstack/react-query";

export type SocketMessage =
  | { type: "job.created"; payload: { id: number } }
  | { type: "job.updated"; payload: { id: number; status: string; startedAt?: string; finishedAt?: string; error?: string } }
  | { type: "job.progress"; payload: { id: number; progress: number } }
  | { type: "job.log"; payload: { id: number; line: string; ts: string } }
  | { type: "job.completed"; payload: { id: number; summary?: string; tokenCount?: number; costCents?: number } }
  | { type: "job.failed"; payload: { id: number; error?: string } }
  | { type: "worker.status"; payload: { workerId: string; status: string; updatedAt: string; queueDepth?: number; currentJobId?: number | null } };

let socket: Socket | null = null;

const applyJobListPatch = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({ queryKey: ["jobs"] });
};

const updateJobDetailStatus = (
  queryClient: QueryClient,
  payload: { id: number; status: string; startedAt?: string; finishedAt?: string; error?: string }
) => {
  const key = payload.id.toString();
  queryClient.setQueryData<Record<string, unknown> | undefined>(["job", key], (data) => {
    if (!data) return data;
    return {
      ...data,
      status: payload.status,
      error: payload.error ?? (data as Record<string, unknown>).error,
      startedAt: payload.startedAt ?? (data as Record<string, unknown>).startedAt,
      finishedAt: payload.finishedAt ?? (data as Record<string, unknown>).finishedAt
    };
  });
};

const updateJobProgress = (queryClient: QueryClient, payload: { id: number; progress: number }) => {
  const key = payload.id.toString();
  queryClient.setQueryData<Record<string, unknown> | undefined>(["job", key], (data) => {
    if (!data) return data;
    return {
      ...data,
      progress: payload.progress,
      status: payload.progress >= 100 ? (data.status as string) : "processing",
      uiStatus: payload.progress >= 100 ? (data.uiStatus as string) : "running"
    };
  });
};

const appendJobLog = (queryClient: QueryClient, payload: { id: number; line: string; ts: string }) => {
  const jobKey = payload.id.toString();
  queryClient.setQueryData<
    | undefined
    | {
        logs: Array<{ id: string; message: string; createdAt: string }>;
        summary?: string;
      }
  >(["job", jobKey], (data) => {
    if (!data) return data;
    const existingLogs = data.logs ?? [];
    return {
      ...data,
      logs: [...existingLogs, { id: `${payload.ts}-${existingLogs.length}`, message: payload.line, createdAt: payload.ts }]
    };
  });
};

const updateWorkerCache = (
  queryClient: QueryClient,
  payload: { workerId: string; status: string; updatedAt: string; queueDepth?: number; currentJobId?: number | null }
) => {
  queryClient.setQueryData<
    Array<{ workerId: string; status: string; lastHeartbeat: string; currentJobId: number | null; queueDepth: number | null }> | undefined
  >(["workers"], (data) => {
    if (!data) return data;
    return data.map((worker) =>
      worker.workerId === payload.workerId
        ? {
            ...worker,
            status: payload.status,
            lastHeartbeat: payload.updatedAt,
            currentJobId: payload.currentJobId ?? worker.currentJobId ?? null,
            queueDepth: typeof payload.queueDepth === "number" ? payload.queueDepth : worker.queueDepth
          }
        : worker
    );
  });
};

export const initRealtime = (queryClient: QueryClient) => {
  if (socket) return socket;
  socket = io(import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_URL ?? "http://localhost:4000", {
    withCredentials: true
  });

  socket.on("event", (message: SocketMessage) => {
    switch (message.type) {
      case "job.created":
      case "job.updated":
      case "job.completed":
      case "job.failed":
        applyJobListPatch(queryClient);
        if (message.type === "job.updated") updateJobDetailStatus(queryClient, message.payload);
        if (message.type === "job.completed") {
          const id = message.payload.id.toString();
          queryClient.setQueryData<Record<string, unknown> | undefined>(["job", id], (data) => {
            if (!data) return data;
            return {
              ...data,
              progress: 100,
              summary: message.payload.summary ?? data.summary,
              tokenCount: message.payload.tokenCount ?? data.tokenCount,
              costCents: message.payload.costCents ?? data.costCents,
              uiStatus: "reviewed"
            };
          });
        }
        break;
      case "job.progress":
        updateJobProgress(queryClient, message.payload);
        break;
      case "job.log":
        appendJobLog(queryClient, message.payload);
        break;
      case "worker.status":
        updateWorkerCache(queryClient, message.payload);
        break;
      default:
        break;
    }
  });

  return socket;
};

export const joinJobChannel = (jobId: string | number) => {
  socket?.emit("subscribe", `job:${jobId}`);
};

