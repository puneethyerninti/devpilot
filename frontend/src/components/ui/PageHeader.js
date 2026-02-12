import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../LayoutHelpers';
const PageHeader = ({ title, subtitle, icon, actions, tabs, breadcrumbs, className }) => {
    return (_jsxs("div", { className: cn('space-y-4', className), children: [breadcrumbs && _jsx("div", { className: "flex items-center gap-2 text-sm text-text-secondary", children: breadcrumbs }), _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "flex items-start gap-3 min-w-0 flex-1", children: [icon && _jsx("div", { className: "flex-shrink-0 mt-1 text-text-secondary", children: icon }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("h1", { className: "text-3xl font-semibold tracking-tight text-text-primary truncate", children: title }), subtitle && _jsx("p", { className: "mt-1 text-base text-text-secondary", children: subtitle })] })] }), actions && _jsx("div", { className: "flex-shrink-0 flex items-center gap-2", children: actions })] }), tabs && _jsx("div", { className: "border-b border-border", children: tabs })] }));
};
export default PageHeader;
