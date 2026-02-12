import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../LayoutHelpers';
import Button from './Button';
const EmptyState = ({ icon, title, description, actionLabel, onAction, className }) => {
    return (_jsxs("div", { className: cn('flex flex-col items-center justify-center py-12 px-4 text-center', className), children: [icon && _jsx("div", { className: "mb-4 text-text-tertiary", children: icon }), _jsx("h3", { className: "text-lg font-semibold text-text-primary mb-2", children: title }), description && _jsx("p", { className: "text-sm text-text-secondary mb-6 max-w-md", children: description }), actionLabel && onAction && (_jsx(Button, { variant: "primary", onClick: onAction, children: actionLabel }))] }));
};
export default EmptyState;
