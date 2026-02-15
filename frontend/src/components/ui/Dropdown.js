import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { cn } from '../LayoutHelpers';
const Dropdown = ({ trigger, items, position = 'right', className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);
    return (_jsxs("div", { ref: dropdownRef, className: cn('relative inline-block', className), children: [_jsx("div", { onClick: () => setIsOpen(!isOpen), children: trigger }), isOpen && (_jsx("div", { className: cn('absolute top-full mt-2 min-w-[200px] z-50', 'glass-strong rounded-lg border border-white/20 shadow-xl overflow-hidden', 'animate-fadeInDown', position === 'right' ? 'right-0' : 'left-0'), children: items.map((item, index) => (_jsxs("div", { children: [item.divider && index > 0 && _jsx("div", { className: "h-px bg-border my-1" }), _jsxs("button", { onClick: () => {
                                if (!item.disabled) {
                                    item.onClick();
                                    setIsOpen(false);
                                }
                            }, disabled: item.disabled, className: cn('w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors', item.disabled && 'opacity-50 cursor-not-allowed', !item.disabled && item.variant === 'danger' && 'text-danger hover:bg-danger/10', !item.disabled && item.variant !== 'danger' && 'text-text-primary hover:bg-elevated'), children: [item.icon && _jsx("span", { className: "flex-shrink-0 w-4 h-4", children: item.icon }), _jsx("span", { className: "flex-1", children: item.label })] })] }, item.id))) }))] }));
};
export default Dropdown;
