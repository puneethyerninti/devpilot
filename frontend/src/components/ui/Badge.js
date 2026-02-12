import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../LayoutHelpers';
const variantStyles = {
    default: 'bg-surface border-border text-text-secondary',
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    success: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-300',
    warning: 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-300',
    danger: 'bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-300',
    outline: 'bg-transparent border border-border text-text-primary',
};
const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
};
const Badge = ({ children, variant = 'default', size = 'md', dot = false, removable = false, onRemove, className, }) => {
    return (_jsxs("span", { className: cn('inline-flex items-center font-medium rounded-full transition-colors', variantStyles[variant], sizeStyles[size], className), children: [dot && (_jsx("span", { className: cn('inline-block rounded-full', size === 'sm' && 'h-1.5 w-1.5', size === 'md' && 'h-2 w-2', size === 'lg' && 'h-2.5 w-2.5', variant === 'success' && 'bg-success-600', variant === 'danger' && 'bg-danger-600', variant === 'warning' && 'bg-warning-600', variant === 'primary' && 'bg-primary-600'), "aria-hidden": "true" })), children, removable && onRemove && (_jsx("button", { type: "button", onClick: onRemove, className: "inline-flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors", "aria-label": "Remove", children: _jsx("svg", { className: cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'), fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }) }))] }));
};
export default Badge;
