import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../LayoutHelpers';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
const maxWidthClasses = {
    full: 'max-w-full',
    '7xl': 'max-w-7xl',
    '6xl': 'max-w-6xl',
    '5xl': 'max-w-5xl',
};
const AppShell = ({ children, logo, appName, navItems, sidebarFooter, breadcrumbs, searchPlaceholder, onSearch, topBarActions, maxWidth = '6xl', className, }) => {
    return (_jsx("div", { className: cn('min-h-screen bg-base text-text-primary', className), children: _jsxs("div", { className: "flex", children: [_jsx(Sidebar, { logo: logo, appName: appName, navItems: navItems, footer: sidebarFooter }), _jsxs("main", { className: "flex-1 min-w-0", children: [_jsx(TopBar, { breadcrumbs: breadcrumbs, searchPlaceholder: searchPlaceholder, onSearch: onSearch, actions: topBarActions }), _jsx("div", { className: cn('mx-auto px-6 py-8 space-y-6', maxWidthClasses[maxWidth]), children: children })] })] }) }));
};
export default AppShell;
