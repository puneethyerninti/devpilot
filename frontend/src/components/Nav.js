import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { Link, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { useMeQuery } from "@/lib/api";
import { RoleBadge } from "./RoleBadge";
const links = [
    { to: "/jobs", label: "Jobs" },
    { to: "/workers", label: "Workers" }
];
export const Nav = () => {
    const location = useLocation();
    const { data: me } = useMeQuery();
    return (_jsxs("nav", { className: "flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white/60 backdrop-blur", children: [_jsxs("div", { className: "flex items-center gap-6", children: [_jsx("span", { className: "text-xl font-semibold tracking-tight", children: "DevPilot" }), _jsx("div", { className: "flex gap-4 text-sm text-slate-600", children: links.map((link) => (_jsx(Link, { to: link.to, className: clsx(location.pathname.startsWith(link.to) && "text-brand font-semibold"), children: link.label }, link.to))) })] }), me && (_jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsx("span", { className: "text-slate-700", children: me.login }), _jsx(RoleBadge, { role: me.role })] }))] }));
};
