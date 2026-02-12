import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '../LayoutHelpers';
import LoadingSpinner from './LoadingSpinner';
const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-600 shadow-sm active:scale-[0.98]',
    secondary: 'bg-elevated border border-border text-text-primary hover:bg-surface active:scale-[0.98]',
    ghost: 'bg-transparent text-text-primary hover:bg-elevated active:scale-[0.98]',
    danger: 'bg-danger text-white hover:bg-danger-600 shadow-sm active:scale-[0.98]',
    outline: 'border-2 border-border bg-transparent text-text-primary hover:bg-bg-elevated active:scale-[0.98]',
    link: 'bg-transparent text-primary hover:underline',
};
const sizeClasses = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2.5',
    icon: 'h-10 w-10 p-0',
};
const Button = forwardRef(({ variant = 'primary', size = 'md', leftIcon, rightIcon, loading = false, fullWidth = false, className, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;
    return (_jsx("button", { ref: ref, className: cn('inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base', 'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100', variantClasses[variant], sizeClasses[size], fullWidth && 'w-full', className), disabled: isDisabled, ...props, children: loading ? (_jsxs(_Fragment, { children: [_jsx(LoadingSpinner, { size: size === 'sm' ? 'sm' : 'sm' }), children] })) : (_jsxs(_Fragment, { children: [leftIcon && _jsx("span", { className: "inline-flex items-center", children: leftIcon }), children, rightIcon && _jsx("span", { className: "inline-flex items-center", children: rightIcon })] })) }));
});
Button.displayName = 'Button';
export default Button;
