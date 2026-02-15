import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { cn } from '../LayoutHelpers';
const CommandPalette = ({ commands, isOpen, onClose }) => {
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const filteredCommands = commands.filter((cmd) => {
        const searchLower = search.toLowerCase();
        const matchLabel = cmd.label.toLowerCase().includes(searchLower);
        const matchDesc = cmd.description?.toLowerCase().includes(searchLower);
        const matchKeywords = cmd.keywords?.some((kw) => kw.toLowerCase().includes(searchLower));
        return matchLabel || matchDesc || matchKeywords;
    });
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setSearch('');
            setSelectedIndex(0);
        }
    }, [isOpen]);
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen)
                return;
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (filteredCommands[selectedIndex]) {
                        filteredCommands[selectedIndex].onSelect();
                        onClose();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, filteredCommands, onClose]);
    if (!isOpen)
        return null;
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn", onClick: onClose }), _jsx("div", { className: "fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4 animate-scaleIn", children: _jsxs("div", { className: "glass-strong rounded-xl shadow-2xl overflow-hidden border border-white/20", children: [_jsxs("div", { className: "flex items-center gap-3 px-4 py-3 border-b border-white/10", children: [_jsx("svg", { className: "w-5 h-5 text-text-secondary", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), _jsx("input", { ref: inputRef, type: "text", value: search, onChange: (e) => {
                                        setSearch(e.target.value);
                                        setSelectedIndex(0);
                                    }, placeholder: "Search for commands...", className: "flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-tertiary" }), _jsx("kbd", { className: "hidden sm:inline-block px-2 py-1 text-xs font-semibold text-text-tertiary bg-elevated rounded border border-border", children: "ESC" })] }), _jsx("div", { className: "max-h-[60vh] overflow-y-auto scrollbar-thin py-2", children: filteredCommands.length === 0 ? (_jsx("div", { className: "px-4 py-8 text-center text-text-secondary", children: "No commands found" })) : (filteredCommands.map((cmd, index) => (_jsxs("button", { onClick: () => {
                                    cmd.onSelect();
                                    onClose();
                                }, onMouseEnter: () => setSelectedIndex(index), className: cn('w-full flex items-center gap-3 px-4 py-3 text-left transition-colors', index === selectedIndex
                                    ? 'bg-primary/20 text-primary'
                                    : 'text-text-primary hover:bg-elevated'), children: [cmd.icon && (_jsx("div", { className: "flex-shrink-0 w-5 h-5 text-text-secondary", children: cmd.icon })), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-sm font-medium", children: cmd.label }), cmd.description && (_jsx("div", { className: "text-xs text-text-tertiary truncate", children: cmd.description }))] })] }, cmd.id)))) })] }) })] }));
};
export default CommandPalette;
// Hook to trigger command palette with Ctrl+K / Cmd+K
export const useCommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    return { isOpen, setIsOpen };
};
