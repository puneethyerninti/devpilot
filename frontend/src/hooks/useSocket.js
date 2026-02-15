import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { initRealtime, joinJobChannel } from "../lib/socket";
export const useSocket = (jobId) => {
    const queryClient = useQueryClient();
    useEffect(() => {
        const socket = initRealtime(queryClient);
        const handleReconnect = async () => {
            if (!jobId)
                return;
            const id = jobId.toString();
            try {
                const res = await api.get(`/api/jobs/${id}`);
                const payload = res.data?.data;
                queryClient.setQueryData(["job", id], payload);
            }
            catch {
                // best-effort rehydrate
            }
            joinJobChannel(id);
        };
        socket.on("connect", handleReconnect);
        if (jobId) {
            joinJobChannel(jobId);
        }
        return () => {
            socket.off("connect", handleReconnect);
        };
    }, [jobId, queryClient]);
};
