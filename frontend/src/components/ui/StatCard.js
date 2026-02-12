import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../LayoutHelpers';
const gradients = {
    blue: 'from-blue-500/10 via-sky-500/5 to-transparent',
    green: 'from-emerald-500/10 via-green-500/5 to-transparent',
    purple: 'from-purple-500/10 via-indigo-500/5 to-transparent',
    orange: 'from-orange-500/10 via-amber-500/5 to-transparent',
};
const StatCard = ({ title, subtitle, icon, trend, trendValue, children, className, gradient = 'blue' }) => {
    return (_jsxs("div", { className: cn('group relative overflow-hidden rounded-xl border border-border bg-panel/80 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl', className), children: [_jsx("div", { className: cn('pointer-events-none absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-70', gradients[gradient]), "aria-hidden": true }), _jsxs("div", { className: "relative space-y-3", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-xs font-medium uppercase tracking-wider text-muted-foreground", children: title }), subtitle && _jsx("p", { className: "text-[10px] text-muted-foreground/70", children: subtitle })] }), icon && (_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent", children: icon }))] }), _jsxs("div", { className: "flex items-end justify-between", children: [_jsx("div", { className: "text-3xl font-bold text-foreground", children: children }), trend && trendValue && (_jsxs("div", { className: cn('flex items-center gap-1 text-xs font-medium', trend === 'up' && 'text-green-500', trend === 'down' && 'text-red-500', trend === 'neutral' && 'text-muted-foreground'), children: [trend === 'up' && '↑', trend === 'down' && '↓', trend === 'neutral' && '→', _jsx("span", { children: trendValue })] }))] })] })] }));
};
export default StatCard;
