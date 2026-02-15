import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { cn } from '../LayoutHelpers';
const SearchBar = ({ placeholder = 'Search...', onSearch, suggestions = [], showShortcut = true, size = 'md', variant = 'default', autoFocus = false, className, }) => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const filteredSuggestions = suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase()));
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query) {
                onSearch(query);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query, onSearch]);
    const sizeClasses = {
        sm: 'h-9 text-sm',
        md: 'h-11 text-base',
        lg: 'h-12 text-lg',
    };
    return (_jsxs("div", { className: cn('relative', className), children: [_jsxs("div", { className: cn('flex items-center gap-3 rounded-lg transition-all duration-200', 'border focus-within:ring-2 focus-within:ring-primary/50', sizeClasses[size], variant === 'glass' && 'glass-strong', variant === 'default' && 'bg-elevated border-border', isFocused && 'shadow-lg'), children: [_jsx("svg", { className: cn('w-5 h-5 transition-colors ml-3', isFocused ? 'text-primary' : 'text-text-tertiary'), fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), _jsx("input", { type: "text", value: query, onChange: (e) => setQuery(e.target.value), onFocus: () => {
                            setIsFocused(true);
                            setShowSuggestions(true);
                        }, onBlur: () => {
                            setIsFocused(false);
                            setTimeout(() => setShowSuggestions(false), 200);
                        }, placeholder: placeholder, autoFocus: autoFocus, className: "flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-tertiary" }), showShortcut && !query && (_jsxs("kbd", { className: "hidden sm:flex items-center gap-1 px-2 py-1 mr-2 text-xs font-semibold text-text-tertiary bg-elevated rounded border border-border", children: [_jsx("span", { children: "\u2318" }), _jsx("span", { children: "K" })] })), query && (_jsx("button", { onClick: () => setQuery(''), "aria-label": "Clear search", title: "Clear search", className: "p-1 mr-2 text-text-tertiary hover:text-text-primary transition-colors rounded hover:bg-surface", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }))] }), showSuggestions && filteredSuggestions.length > 0 && query && (_jsx("div", { className: "absolute top-full left-0 right-0 mt-2 glass-strong rounded-lg border border-white/20 shadow-xl overflow-hidden z-10 animate-fadeInDown", children: filteredSuggestions.map((suggestion, index) => (_jsx("button", { onClick: () => {
                        setQuery(suggestion);
                        onSearch(suggestion);
                        setShowSuggestions(false);
                    }, className: "w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-primary/10 transition-colors", children: suggestion }, index))) }))] }));
};
export default SearchBar;
