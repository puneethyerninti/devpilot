import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '../LayoutHelpers';
const Input = forwardRef(({ label, helperText, error, prefixIcon, suffixIcon, fullWidth = false, className, ...props }, ref) => {
    const hasError = Boolean(error);
    return (_jsxs("div", { className: cn('flex flex-col gap-1.5', fullWidth && 'w-full'), children: [label && (_jsx("label", { className: "text-sm font-medium text-text-primary", htmlFor: props.id, children: label })), _jsxs("div", { className: "relative", children: [prefixIcon && (_jsx("div", { className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-tertiary", children: prefixIcon })), _jsx("input", { ref: ref, className: cn('w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary', 'transition-colors duration-150', 'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent', 'disabled:opacity-50 disabled:cursor-not-allowed', hasError ? 'border-danger focus:ring-danger' : 'border-border hover:border-border-hover', prefixIcon ? 'pl-10' : '', suffixIcon ? 'pr-10' : '', className), ...props }), suffixIcon && (_jsx("div", { className: "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-tertiary", children: suffixIcon }))] }), (helperText || error) && (_jsx("p", { className: cn('text-xs', hasError ? 'text-danger' : 'text-text-secondary'), children: error || helperText }))] }));
});
Input.displayName = 'Input';
export default Input;
