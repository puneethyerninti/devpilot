import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { cn } from '../LayoutHelpers';
const CodeBlock = ({ code, language = 'typescript', title, showLineNumbers = true, highlightLines = [], className, }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const lines = code.split('\n');
    return (_jsxs("div", { className: cn('rounded-xl overflow-hidden bg-elevated border border-border shadow-lg', className), children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-2 border-b border-border bg-surface/50", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "flex gap-1.5", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-danger" }), _jsx("div", { className: "w-3 h-3 rounded-full bg-warning" }), _jsx("div", { className: "w-3 h-3 rounded-full bg-success" })] }), title && (_jsx("span", { className: "ml-2 text-xs font-medium text-text-secondary", children: title }))] }), _jsx("button", { onClick: handleCopy, className: "flex items-center gap-2 px-2 py-1 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors rounded hover:bg-elevated", children: copied ? (_jsxs(_Fragment, { children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }), "Copied!"] })) : (_jsxs(_Fragment, { children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" }) }), "Copy"] })) })] }), _jsx("div", { className: "relative", children: _jsx("pre", { className: "p-4 overflow-x-auto scrollbar-thin text-sm", children: _jsx("code", { className: "font-mono", children: lines.map((line, index) => {
                            const lineNumber = index + 1;
                            const isHighlighted = highlightLines.includes(lineNumber);
                            return (_jsxs("div", { className: cn('flex', isHighlighted && 'bg-primary/10 -mx-4 px-4 border-l-2 border-primary'), children: [showLineNumbers && (_jsx("span", { className: "inline-block w-8 text-right mr-4 text-text-tertiary select-none", children: lineNumber })), _jsx("span", { className: "text-text-primary", children: line || ' ' })] }, index));
                        }) }) }) })] }));
};
export default CodeBlock;
