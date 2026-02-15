import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../LayoutHelpers';
const FeatureCard = ({ icon, title, description, action, variant = 'default', size = 'md', className, }) => {
    const sizeClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };
    const iconSizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };
    return (_jsxs("div", { className: cn('rounded-xl transition-all duration-300 group', 'hover:shadow-xl hover:-translate-y-1', sizeClasses[size], variant === 'default' && 'bg-elevated border border-border shadow-md', variant === 'gradient' && 'gradient-primary text-white', variant === 'glass' && 'glass-strong', variant === 'bordered' && 'bg-base border-2 border-border hover:border-primary', className), children: [_jsx("div", { className: cn('rounded-xl mb-4 flex items-center justify-center', 'transition-transform duration-300 group-hover:scale-110', iconSizeClasses[size], variant === 'gradient' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'), children: icon }), _jsx("h3", { className: cn('font-semibold mb-2', size === 'sm' && 'text-base', size === 'md' && 'text-lg', size === 'lg' && 'text-xl', variant === 'gradient' ? 'text-white' : 'text-text-primary'), children: title }), _jsx("p", { className: cn('mb-4', size === 'sm' && 'text-xs', size === 'md' && 'text-sm', size === 'lg' && 'text-base', variant === 'gradient' ? 'text-white/80' : 'text-text-secondary'), children: description }), action && (_jsxs("button", { onClick: action.onClick, className: cn('flex items-center gap-2 text-sm font-medium transition-all duration-200', 'group-hover:gap-3', variant === 'gradient' ? 'text-white hover:text-white/80' : 'text-primary hover:text-primary-600'), children: [action.label, _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] }))] }));
};
export default FeatureCard;
export const FeatureGrid = ({ children, columns = 3, className }) => {
    const columnClasses = {
        1: 'grid-cols-1',
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-2 lg:grid-cols-3',
        4: 'md:grid-cols-2 lg:grid-cols-4',
    };
    return (_jsx("div", { className: cn('grid gap-6', columnClasses[columns], className), children: children }));
};
