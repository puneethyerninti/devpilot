import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../LayoutHelpers';
const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
};
const statusColors = {
    online: 'bg-success',
    offline: 'bg-text-tertiary',
    away: 'bg-warning',
    busy: 'bg-danger',
};
const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
};
const Avatar = ({ src, alt = 'Avatar', fallback, size = 'md', status, showStatus = false, className, }) => {
    const initials = fallback
        ?.split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    return (_jsxs("div", { className: cn('relative inline-block', className), children: [_jsx("div", { className: cn('rounded-full overflow-hidden', 'bg-gradient-primary flex items-center justify-center', 'font-semibold text-white', sizeClasses[size]), children: src ? (_jsx("img", { src: src, alt: alt, className: "w-full h-full object-cover" })) : (_jsx("span", { children: initials || alt[0]?.toUpperCase() })) }), showStatus && status && (_jsx("div", { className: cn('absolute bottom-0 right-0 rounded-full border-2 border-base', statusColors[status], statusSizes[size]) }))] }));
};
export default Avatar;
export const AvatarGroup = ({ avatars, max = 5, size = 'md', className }) => {
    const displayAvatars = avatars.slice(0, max);
    const remaining = avatars.length - max;
    return (_jsxs("div", { className: cn('flex items-center -space-x-2', className), children: [displayAvatars.map((avatar, index) => (_jsx("div", { className: "ring-2 ring-base rounded-full transition-transform hover:scale-110 hover:z-10", children: _jsx(Avatar, { ...avatar, size: size }) }, index))), remaining > 0 && (_jsxs("div", { className: cn('rounded-full bg-elevated border-2 border-base', 'flex items-center justify-center', 'font-semibold text-text-secondary', sizeClasses[size]), children: ["+", remaining] }))] }));
};
