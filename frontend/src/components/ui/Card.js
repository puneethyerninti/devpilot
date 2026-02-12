import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../LayoutHelpers';
const variantStyles = {
    default: 'border border-border bg-elevated shadow-sm',
    elevated: 'border border-border bg-elevated shadow-md',
    outline: 'border-2 border-border bg-transparent',
    ghost: 'border-0 bg-transparent',
};
const Card = ({ children, title, subtitle, headerAction, footer, variant = 'default', hover = false, className, contentClassName, }) => {
    return (_jsxs("div", { className: cn('rounded-lg transition-all duration-200', variantStyles[variant], hover && 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer', className), children: [(title || subtitle || headerAction) && (_jsxs("div", { className: "flex items-start justify-between gap-4 border-b border-border px-5 py-4", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [title && _jsx("h3", { className: "text-base font-semibold text-text-primary", children: title }), subtitle && _jsx("p", { className: "mt-0.5 text-xs text-text-secondary", children: subtitle })] }), headerAction && _jsx("div", { className: "flex-shrink-0", children: headerAction })] })), _jsx("div", { className: cn('p-5', contentClassName), children: children }), footer && _jsx("div", { className: "border-t border-border px-5 py-4 bg-surface/50", children: footer })] }));
};
export default Card;
