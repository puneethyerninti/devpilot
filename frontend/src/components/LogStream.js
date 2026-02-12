import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import * as ScrollArea from "@radix-ui/react-scroll-area";
export const LogStream = ({ logs }) => {
    return (_jsxs(ScrollArea.Root, { className: "h-64 w-full overflow-hidden rounded-lg border border-slate-200", children: [_jsxs(ScrollArea.Viewport, { className: "h-full w-full bg-slate-50 px-4 py-3 font-mono text-xs", children: [logs.length === 0 && _jsx("p", { className: "text-slate-500", children: "Waiting for worker output..." }), logs.map((log) => (_jsxs("p", { className: "text-slate-700", children: [_jsx("span", { className: "text-slate-400 mr-2", children: new Date(log.createdAt).toLocaleTimeString() }), log.message] }, log.id)))] }), _jsx(ScrollArea.Scrollbar, { orientation: "vertical", className: "flex select-none touch-none p-0.5", children: _jsx(ScrollArea.Thumb, { className: "relative flex-1 rounded-full bg-slate-300" }) })] }));
};
