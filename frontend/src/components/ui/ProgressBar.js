import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
import { cn } from '../LayoutHelpers';
const variantClasses = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    gradient: 'gradient-animated',
};
const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
};
const ProgressBar = ({ value, variant = 'primary', size = 'md', showLabel = false, label, animated = true, className, }) => {
    const [displayValue, setDisplayValue] = useState(0);
    useEffect(() => {
        if (animated) {
            const timer = setTimeout(() => {
                setDisplayValue(value);
            }, 100);
            return () => clearTimeout(timer);
        }
        else {
            setDisplayValue(value);
        }
    }, [value, animated]);
    const barRef = useRef(null);
    useEffect(() => {
        if (barRef.current) {
            // update width via DOM to avoid inline style prop in JSX
            barRef.current.style.width = `${displayValue}%`;
        }
    }, [displayValue]);
    return (_jsxs("div", { className: cn('w-full', className), children: [(showLabel || label) && (_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-text-secondary", children: label || 'Progress' }), _jsxs("span", { className: "text-sm font-semibold text-text-primary", children: [Math.round(displayValue), "%"] })] })), _jsx("div", { className: cn('w-full bg-elevated rounded-full overflow-hidden', sizeClasses[size]), children: _jsx("div", { className: cn('h-full rounded-full transition-all duration-1000 ease-out', variantClasses[variant], animated && 'shadow-lg'), ref: barRef }) })] }));
};
export default ProgressBar;
export const CircularProgress = ({ value, size = 120, strokeWidth = 8, variant = 'primary', showLabel = true, className, }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    const colorClasses = {
        primary: 'text-primary',
        success: 'text-success',
        warning: 'text-warning',
        danger: 'text-danger',
    };
    return (_jsxs("div", { className: cn('relative inline-flex items-center justify-center', className), children: [_jsxs("svg", { width: size, height: size, className: "transform -rotate-90", children: [_jsx("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", stroke: "currentColor", strokeWidth: strokeWidth, className: "text-elevated" }), _jsx("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", stroke: "currentColor", strokeWidth: strokeWidth, strokeDasharray: circumference, strokeDashoffset: offset, strokeLinecap: "round", className: cn('transition-all duration-1000 ease-out', colorClasses[variant]) })] }), showLabel && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsxs("span", { className: "text-2xl font-bold text-text-primary", children: [Math.round(value), "%"] }) }))] }));
};
