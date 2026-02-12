// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000",
    withCredentials: true
});
const demoToken = import.meta.env.VITE_DEMO_TOKEN;
if (demoToken) {
    api.defaults.headers.common.Authorization = `Bearer ${demoToken}`;
}
export const useJobsQuery = (params) => useQuery({
    queryKey: ["jobs", params],
    queryFn: async () => {
        const res = await api.get("/api/jobs", { params });
        return res.data.data.jobs;
    }
});
export const useJobQuery = (id) => useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
        const res = await api.get(`/api/jobs/${id}`);
        const job = res.data.data;
        return { ...job, logs: job.logs ?? [] };
    },
    enabled: Boolean(id)
});
export const useRetryJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (jobId) => {
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
        mutationFn: async (jobId) => {
            await api.post(`/api/jobs/${jobId}/run-ai`);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
            queryClient.invalidateQueries({ queryKey: ["job", variables.toString()] });
        }
    });
};
export const useWorkersQuery = () => useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
        const res = await api.get("/api/workers");
        return res.data.data;
    }
});
export const useReposQuery = () => useQuery({
    queryKey: ["repos"],
    queryFn: async () => {
        const res = await api.get("/api/repos");
        return res.data.data;
    }
});
export const useMeQuery = () => useQuery({
    queryKey: ["me"],
    queryFn: async () => {
        try {
            const res = await api.get("/api/users/me");
            return res.data.data;
        }
        catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                return undefined;
            }
            throw error;
        }
    },
    retry: false
});
