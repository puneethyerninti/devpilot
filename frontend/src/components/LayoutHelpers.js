import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const cn = (...classes) => classes.filter(Boolean).join(' ');
export const Section = ({ title, description, action, children }) => (_jsxs("section", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-base font-semibold text-foreground", children: title }), description && _jsx("p", { className: "text-sm text-muted-foreground", children: description })] }), action] }), children] }));
export default Section;
