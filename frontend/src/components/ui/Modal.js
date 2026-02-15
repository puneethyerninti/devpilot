import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { cn } from '../LayoutHelpers';
const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
};
const Modal = ({ isOpen, onClose, title, subtitle, children, footer, size = 'md', showCloseButton = true, className, }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-md z-50 animate-fadeIn", onClick: onClose }), _jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none", children: _jsxs("div", { className: cn('glass-strong rounded-2xl shadow-2xl w-full border border-white/20 pointer-events-auto animate-scaleIn', 'flex flex-col max-h-[90vh]', sizeClasses[size], className), onClick: (e) => e.stopPropagation(), children: [(title || showCloseButton) && (_jsxs("div", { className: "flex items-start justify-between px-6 py-5 border-b border-white/10", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [title && (_jsx("h2", { className: "text-xl font-semibold text-text-primary", children: title })), subtitle && (_jsx("p", { className: "mt-1 text-sm text-text-secondary", children: subtitle }))] }), showCloseButton && (_jsx("button", { onClick: onClose, "aria-label": "Close dialog", title: "Close", className: "ml-4 p-1 rounded-lg hover:bg-elevated transition-colors", children: _jsx("svg", { className: "w-5 h-5 text-text-secondary", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }))] })), _jsx("div", { className: "px-6 py-5 overflow-y-auto flex-1 scrollbar-thin", children: children }), footer && (_jsx("div", { className: "px-6 py-4 border-t border-white/10 bg-elevated/30", children: footer }))] }) })] }));
};
export default Modal;
