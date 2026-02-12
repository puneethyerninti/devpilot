import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { useState } from "react";
import { useJobsQuery, useRetryJob, useMeQuery } from "@/lib/api";
import { JobRow } from "@/components/JobRow";
export const JobsList = () => {
    const [status, setStatus] = useState();
    const { data: jobs, isLoading } = useJobsQuery({ status });
    const retryMutation = useRetryJob();
    const { data: me } = useMeQuery();
    const canRetry = me?.role === "operator" || me?.role === "admin";
    const handleRetry = (jobId) => {
        retryMutation.mutate(jobId);
    };
    return (_jsxs("section", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-2xl font-semibold", children: "Job Queue" }), _jsxs("select", { "aria-label": "Filter jobs by status", className: "rounded-md border border-slate-200 px-3 py-2 text-sm", value: status ?? "", onChange: (event) => setStatus(event.target.value || undefined), children: [_jsx("option", { value: "", children: "All statuses" }), _jsx("option", { value: "queued", children: "Queued" }), _jsx("option", { value: "processing", children: "Processing" }), _jsx("option", { value: "done", children: "Done" }), _jsx("option", { value: "failed", children: "Failed" })] })] }), isLoading && _jsx("p", { children: "Loading jobs\u00E2\u20AC\u00A6" }), _jsx("div", { className: "space-y-3", children: jobs?.map((job) => (_jsx(JobRow, { job: job, onRetry: canRetry ? handleRetry : undefined }, job.id))) })] }));
};
