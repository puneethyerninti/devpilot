// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { io } from "socket.io-client";
let socket = null;
const applyJobListPatch = (queryClient) => {
    void queryClient.invalidateQueries({ queryKey: ["jobs"] });
};
const updateJobDetailStatus = (queryClient, payload) => {
    const key = payload.id.toString();
    queryClient.setQueryData(["job", key], (data) => {
        if (!data)
            return data;
        return {
            ...data,
            status: payload.status,
            error: payload.error ?? data.error,
            startedAt: payload.startedAt ?? data.startedAt,
            finishedAt: payload.finishedAt ?? data.finishedAt
        };
    });
};
const updateJobProgress = (queryClient, payload) => {
    const key = payload.id.toString();
    queryClient.setQueryData(["job", key], (data) => {
        if (!data)
            return data;
        return {
            ...data,
            progress: payload.progress,
            status: payload.progress >= 100 ? data.status : "processing",
            uiStatus: payload.progress >= 100 ? data.uiStatus : "running"
        };
    });
};
const appendJobLog = (queryClient, payload) => {
    const jobKey = payload.id.toString();
    queryClient.setQueryData(["job", jobKey], (data) => {
        if (!data)
            return data;
        const existingLogs = data.logs ?? [];
        return {
            ...data,
            logs: [...existingLogs, { id: `${payload.ts}-${existingLogs.length}`, message: payload.line, createdAt: payload.ts }]
        };
    });
};
const updateWorkerCache = (queryClient, payload) => {
    queryClient.setQueryData(["workers"], (data) => {
        if (!data)
            return data;
        return data.map((worker) => worker.workerId === payload.workerId
            ? {
                ...worker,
                status: payload.status,
                lastHeartbeat: payload.updatedAt,
                currentJobId: payload.currentJobId ?? worker.currentJobId ?? null,
                queueDepth: typeof payload.queueDepth === "number" ? payload.queueDepth : worker.queueDepth
            }
            : worker);
    });
};
export const initRealtime = (queryClient) => {
    if (socket)
        return socket;
    socket = io(import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_URL ?? "http://localhost:4000", {
        withCredentials: true
    });
    socket.on("event", (message) => {
        switch (message.type) {
            case "job.created":
            case "job.updated":
            case "job.completed":
            case "job.failed":
                applyJobListPatch(queryClient);
                if (message.type === "job.updated")
                    updateJobDetailStatus(queryClient, message.payload);
                if (message.type === "job.completed") {
                    const id = message.payload.id.toString();
                    queryClient.setQueryData(["job", id], (data) => {
                        if (!data)
                            return data;
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
export const joinJobChannel = (jobId) => {
    socket?.emit("subscribe", `job:${jobId}`);
};
