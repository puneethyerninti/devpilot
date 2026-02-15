import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../LayoutHelpers';
const statusConfig = {
    success: {
        color: 'bg-success',
        ring: 'ring-success/20',
        icon: (_jsx("svg", { className: "w-3 h-3 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" }) })),
    },
    error: {
        color: 'bg-danger',
        ring: 'ring-danger/20',
        icon: (_jsx("svg", { className: "w-3 h-3 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" }) })),
    },
    warning: {
        color: 'bg-warning',
        ring: 'ring-warning/20',
        icon: (_jsx("svg", { className: "w-3 h-3 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M12 9v2m0 4h.01" }) })),
    },
    pending: {
        color: 'bg-text-tertiary',
        ring: 'ring-text-tertiary/20',
        icon: (_jsx("div", { className: "w-2 h-2 bg-white rounded-full" })),
    },
    active: {
        color: 'bg-primary animate-pulse',
        ring: 'ring-primary/20 pulse-glow',
        icon: (_jsx("div", { className: "w-2 h-2 bg-white rounded-full" })),
    },
};
const Timeline = ({ items, className }) => {
    return (_jsx("div", { className: cn('space-y-4', className), children: items.map((item, index) => {
            const config = statusConfig[item.status || 'pending'];
            return (_jsxs("div", { className: cn('relative flex gap-4 animate-fadeInUp', `stagger-${(index % 5) + 1}`), children: [index < items.length - 1 && (_jsx("div", { className: "absolute left-[15px] top-8 w-0.5 h-full bg-border" })), _jsx("div", { className: "relative flex-shrink-0", children: _jsx("div", { className: cn('w-8 h-8 rounded-full flex items-center justify-center', 'ring-4 transition-all duration-300', config.color, config.ring), children: item.icon || config.icon }) }), _jsx("div", { className: "flex-1 pb-8", children: _jsxs("div", { className: "glass-card rounded-lg p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5", children: [_jsxs("div", { className: "flex items-start justify-between gap-4 mb-2", children: [_jsx("h4", { className: "text-sm font-semibold text-text-primary", children: item.title }), _jsx("span", { className: "text-xs text-text-tertiary whitespace-nowrap", children: item.timestamp })] }), item.description && (_jsx("p", { className: "text-sm text-text-secondary mb-3", children: item.description })), item.metadata && item.metadata.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-3", children: item.metadata.map((meta, i) => (_jsxs("div", { className: "text-xs", children: [_jsxs("span", { className: "text-text-tertiary", children: [meta.label, ": "] }), _jsx("span", { className: "text-text-primary font-medium", children: meta.value })] }, i))) }))] }) })] }, item.id));
        }) }));
};
export default Timeline;
