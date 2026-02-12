import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../LayoutHelpers';
const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
};
const LoadingSpinner = ({ size = 'md', className }) => {
    return (_jsx("div", { className: cn('inline-block animate-spin rounded-full border-2 border-primary border-t-transparent', sizeStyles[size], className), role: "status", "aria-label": "Loading", children: _jsx("span", { className: "sr-only", children: "Loading..." }) }));
};
export default LoadingSpinner;
