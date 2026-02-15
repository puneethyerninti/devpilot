import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { cn } from '../LayoutHelpers';
const AnimatedCounter = ({ value, duration = 1000, format, className }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const counterRef = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
            }
        }, { threshold: 0.1 });
        if (counterRef.current) {
            observer.observe(counterRef.current);
        }
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        if (!isVisible)
            return;
        let startTime = null;
        let animationFrame;
        const animate = (currentTime) => {
            if (!startTime)
                startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * value));
            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
            else {
                setCount(value);
            }
        };
        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration, isVisible]);
    return (_jsx("span", { ref: counterRef, className: cn('tabular-nums', className), children: format ? format(count) : count }));
};
export default AnimatedCounter;
/**
 * Helper function to format numbers
 */
export const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};
export const formatCurrency = (num, currency = '$') => {
    return currency + num.toLocaleString();
};
export const formatPercentage = (num) => {
    return num.toFixed(1) + '%';
};
