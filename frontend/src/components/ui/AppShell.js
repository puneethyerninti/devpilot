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
    const hasTopBar = Boolean(breadcrumbs || onSearch || topBarActions);
    return (_jsxs("div", { className: cn('min-h-screen bg-base text-text-primary md:grid md:grid-cols-[15rem_minmax(0,1fr)]', className), children: [_jsx(Sidebar, { logo: logo, appName: appName, navItems: navItems, footer: sidebarFooter }), _jsxs("main", { className: "min-w-0", children: [hasTopBar && (_jsx(TopBar, { breadcrumbs: breadcrumbs, searchPlaceholder: searchPlaceholder, onSearch: onSearch, actions: topBarActions })), _jsx("div", { className: cn('mx-auto px-6 pb-8 space-y-6', hasTopBar ? 'pt-[72px]' : 'pt-6', maxWidthClasses[maxWidth]), children: children })] })] }));
};
export default AppShell;
