import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
export const JobRow = ({ job, onRetry }) => {
    const statusLabel = job.status === "done" ? "Completed" : job.status;
    const navigate = useNavigate();
    return (_jsxs("div", { className: "flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-slate-800", children: job.repoFullName }), _jsxs("p", { className: "text-xs text-slate-500", children: ["Job #", job.id] }), _jsxs("p", { className: "text-xs text-slate-600 mt-2", children: ["Status: ", statusLabel] }), job.summary && _jsx("p", { className: "mt-2 text-sm text-slate-700", children: job.summary })] }), _jsxs("div", { className: "flex gap-3", children: [onRetry && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => onRetry(job.id), children: "Retry" })), _jsx(Button, { size: "sm", onClick: () => navigate(`/jobs/${job.id}`), children: "Details" })] })] }));
};
