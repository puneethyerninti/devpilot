import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { cn } from '../LayoutHelpers';
const TopBar = ({ breadcrumbs, searchPlaceholder = 'Search...', onSearch, actions, className }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            // Show/hide based on scroll direction
            if (currentScrollY > lastScrollY && currentScrollY > 80) {
                setIsVisible(false); // Scrolling down
            }
            else {
                setIsVisible(true); // Scrolling up
            }
            // Add shadow/blur effect when scrolled
            setIsScrolled(currentScrollY > 20);
            setLastScrollY(currentScrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);
    return (_jsxs("header", { className: cn('fixed top-0 left-0 md:left-60 right-0 z-30', 'glass-strong relative', 'transition-all duration-300 ease-in-out', isVisible ? 'translate-y-0' : '-translate-y-full', isScrolled
            ? 'shadow-2xl shadow-primary-500/5'
            : 'shadow-sm', className), children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-primary-500/5 via-purple-500/5 to-primary-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none", "aria-hidden": "true" }), _jsxs("div", { className: "relative mx-auto flex max-w-7xl items-center gap-4 px-6 py-3.5", children: [breadcrumbs && (_jsx("div", { className: "flex-1 min-w-0 animate-slideInRight", children: _jsx("div", { className: "flex items-center gap-2 text-sm text-text-secondary font-medium", children: breadcrumbs }) })), onSearch && (_jsx("div", { className: "hidden sm:flex items-center gap-2 flex-1 max-w-md animate-fadeIn", children: _jsxs("div", { className: "group relative w-full", children: [_jsx("div", { className: "pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-primary-400/10 to-primary-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-sm", "aria-hidden": "true" }), _jsx("div", { className: "pointer-events-none absolute inset-y-0 left-3 flex items-center", children: _jsx("svg", { className: "h-4 w-4 text-text-tertiary/60 group-hover:text-primary transition-colors duration-300", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) }), _jsx("input", { type: "search", placeholder: searchPlaceholder, value: searchInput, onChange: (e) => setSearchInput(e.target.value), onKeyDown: (e) => {
                                        if (e.key === 'Enter') {
                                            onSearch(searchInput.trim());
                                        }
                                    }, className: cn('relative w-full rounded-lg glass border border-transparent', 'pl-9 pr-3 py-2 text-sm text-text-primary font-medium', 'placeholder:text-text-tertiary/50', 'outline-none transition-all duration-300', 'focus:border-primary/50 focus:glass-strong focus:ring-2 focus:ring-primary/20 focus:shadow-lg focus:shadow-primary-500/10', 'hover:border-primary/30'), "aria-label": "Search" }), _jsx("div", { className: "pointer-events-none absolute inset-y-0 right-3 flex items-center", children: _jsxs("kbd", { className: "hidden lg:inline-flex items-center gap-1 rounded border border-transparent glass px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary/60", children: [_jsx("span", { className: "text-xs", children: "\u2318" }), "K"] }) })] }) })), actions && (_jsx("div", { className: "flex items-center gap-3 animate-fadeIn", children: actions }))] }), _jsx("div", { className: cn("absolute bottom-0 left-0 right-0 h-px divider-horizontal transition-opacity duration-500", isScrolled ? "opacity-100" : "opacity-0"), "aria-hidden": "true" })] }));
};
export default TopBar;
