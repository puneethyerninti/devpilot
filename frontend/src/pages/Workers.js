import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { useWorkersQuery } from "@/lib/api";
export const Workers = () => {
    const { data, isLoading } = useWorkersQuery();
    const workers = data ?? [];
    if (isLoading)
        return _jsx("p", { children: "Loading worker status\u2026" });
    return (_jsxs("section", { className: "space-y-4", children: [_jsx("h2", { className: "text-2xl font-semibold", children: "Workers" }), _jsx("div", { className: "grid gap-3 md:grid-cols-2", children: workers.map((worker) => (_jsxs("div", { className: "rounded-xl border border-slate-200 bg-white/80 p-4", children: [_jsx("p", { className: "text-sm font-semibold text-slate-700", children: worker.workerId }), _jsxs("p", { className: "text-xs text-slate-500", children: ["Last heartbeat: ", new Date(worker.lastHeartbeat).toLocaleTimeString()] }), _jsxs("p", { className: "mt-2 text-slate-700", children: ["State: ", worker.status] }), worker.currentJobId && _jsxs("p", { className: "text-xs text-slate-500", children: ["Current job: ", worker.currentJobId] }), typeof worker.queueDepth === "number" && _jsxs("p", { className: "text-xs text-slate-500", children: ["Queue depth: ", worker.queueDepth] })] }, worker.workerId))) })] }));
};
