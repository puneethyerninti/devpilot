import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { cn } from '../LayoutHelpers';
const Tabs = ({ tabs, defaultTab, onChange, variant = 'default', size = 'md', className, children, }) => {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        onChange?.(tabId);
    };
    const sizeClasses = {
        sm: 'text-xs px-3 py-1.5',
        md: 'text-sm px-4 py-2',
        lg: 'text-base px-5 py-2.5',
    };
    return (_jsxs("div", { className: cn('space-y-4', className), children: [_jsx("div", { className: cn('flex items-center', variant === 'default' && 'gap-1 p-1 bg-elevated rounded-lg border border-border', variant === 'pills' && 'gap-2', variant === 'underline' && 'gap-4 border-b border-border'), children: tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (_jsxs("button", { onClick: () => !tab.disabled && handleTabChange(tab.id), disabled: tab.disabled, className: cn('relative flex items-center gap-2 font-medium transition-all duration-200', sizeClasses[size], tab.disabled && 'opacity-50 cursor-not-allowed', 
                        // Default variant
                        variant === 'default' && 'rounded-md flex-1', variant === 'default' && isActive && 'bg-base shadow-sm text-primary', variant === 'default' && !isActive && 'text-text-secondary hover:text-text-primary', 
                        // Pills variant
                        variant === 'pills' && 'rounded-full', variant === 'pills' && isActive && 'bg-primary text-white shadow-lg', variant === 'pills' && !isActive && 'bg-elevated text-text-secondary hover:bg-surface', 
                        // Underline variant
                        variant === 'underline' && 'pb-3', variant === 'underline' && isActive && 'text-primary border-b-2 border-primary', variant === 'underline' && !isActive && 'text-text-secondary hover:text-text-primary'), children: [tab.icon && _jsx("span", { className: "flex-shrink-0", children: tab.icon }), _jsx("span", { children: tab.label }), tab.badge !== undefined && (_jsx("span", { className: cn('px-1.5 py-0.5 text-xs font-semibold rounded-full', isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'), children: tab.badge }))] }, tab.id));
                }) }), _jsx("div", { className: "animate-fadeIn", children: children(activeTab) })] }));
};
export default Tabs;
