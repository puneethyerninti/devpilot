// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Job = {
  id: number;
  repoFullName: string;
  status: string;
  uiStatus?: string;
  summary?: string;
  aiReviewMd?: string;
  riskScore?: number;
  progress?: number;
  tokenCount?: number;
  costCents?: number;
  postedToGithubAt?: string;
  postedToGithubError?: string;
  workerId?: string | null;
  prNumber?: number;
  createdAt: string;
  updatedAt: string;
};

type JobDetail = Job & {
  prNumber: number;
  headSha: string;
  triggeredBy?: string | null;
  files: Array<{ id: string; path: string; comments?: { lines?: number[] } }>;
  inlineSuggestions?: Array<{ file: string; startLine: number; endLine: number; suggestion: string; severity: string }>;
  logs: Array<{ id: string; message: string; createdAt: string }>;
  timeline?: Array<{ id: string; kind: string; message: string; createdAt: string }>;
  worker?: { id: string | null; name: string | null };
};

type Envelope<T> = { ok: boolean; data: T };

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000",
  withCredentials: true
});

export const useJobsQuery = (params: { status?: string; enabled?: boolean }) =>
  useQuery({
    queryKey: ["jobs", { status: params.status }],
    queryFn: async () => {
      const queryParams = params.status ? { status: params.status } : {};
      const res = await api.get<Envelope<{ jobs: Job[] }>>("/api/jobs", { params: queryParams });
      return res.data.data.jobs;
    },
    enabled: params.enabled ?? true
  });

export const useJobQuery = (id: string) =>
  useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const res = await api.get<Envelope<JobDetail>>(`/api/jobs/${id}`);
      const job = res.data.data;
      return { ...job, logs: job.logs ?? [] };
    },
    enabled: Boolean(id)
  });

export const useRetryJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: number | string) => {
      await api.post(`/api/jobs/${jobId}/retry`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    }
  });
};

export const useRunAi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: number | string) => {
      await api.post(`/api/jobs/${jobId}/run-ai`);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", variables.toString()] });
    }
  });
};

export const useRunJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { repo: string; prNumber: number; headSha?: string; installationId?: number }) => {
      await api.post(`/api/jobs/run`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    }
  });
};

export const useWorkersQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const res = await api.get<Envelope<Array<{ workerId: string; status: string; lastHeartbeat: string; currentJobId: number | null; queueDepth: number | null }>>>("/api/workers");
      return res.data.data;
    },
    enabled: options?.enabled ?? true
  });

export const useReposQuery = () =>
  useQuery({
    queryKey: ["repos"],
    queryFn: async () => {
      const res = await api.get<Envelope<Array<{ id: string; fullName: string }>>>("/api/repos");
      return res.data.data;
    }
  });

export const useMeQuery = () =>
  useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const res = await api.get<Envelope<{ login: string; role: string }>>("/api/users/me");
        return res.data.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false
  });

export { api };

