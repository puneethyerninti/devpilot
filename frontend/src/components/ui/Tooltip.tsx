import { ReactNode, useState } from 'react';
import { cn } from '../LayoutHelpers';

/**
 * Premium Tooltip Component
 * With smooth animations and multiple positions
 */

interface TooltipProps {
  children: ReactNode;
  content: string | ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowClasses = {
  top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
};

const Tooltip = ({ children, content, position = 'top', delay = 200, className }: TooltipProps) => {
  const [show, setShow] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  const handleMouseEnter = () => {
    const id = window.setTimeout(() => setShow(true), delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) window.clearTimeout(timeoutId);
    setShow(false);
  };

  return (
    <div className={cn('relative inline-block', className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {show && (
        <div
          className={cn(
            'absolute z-50 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg',
            'whitespace-nowrap animate-fadeIn pointer-events-none',
            positionClasses[position]
          )}
        >
          {content}
          <div className={cn('absolute w-0 h-0 border-4 border-gray-900', arrowClasses[position])} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
