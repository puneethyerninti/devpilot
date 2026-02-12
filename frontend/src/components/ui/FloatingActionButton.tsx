import { ReactNode, useState } from 'react';
import { cn } from '../LayoutHelpers';

/**
 * Premium Floating Action Button (FAB) with expandable menu
 * Inspired by modern cloud platforms
 */

interface FABAction {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'success' | 'danger' | 'warning';
}

interface FloatingActionButtonProps {
  actions?: FABAction[];
  mainIcon?: ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

const positionClasses = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
};

const variantClasses = {
  primary: 'bg-primary hover:bg-primary-600 text-white',
  success: 'bg-success hover:bg-success-600 text-white',
  danger: 'bg-danger hover:bg-danger-600 text-white',
  warning: 'bg-warning hover:bg-warning-600 text-white',
};

const FloatingActionButton = ({
  actions = [],
  mainIcon,
  position = 'bottom-right',
  className,
}: FloatingActionButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const defaultIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );

  return (
    <div className={cn('fixed z-50', positionClasses[position], className)}>
      {/* Action Menu */}
      {isExpanded && actions.length > 0 && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2 animate-fadeInUp">
          {actions.map((action, index) => (
            <div
              key={index}
              className={cn('flex items-center gap-3 stagger-' + ((index % 5) + 1))}
            >
              <span className="glass-strong text-text-primary text-sm font-medium px-3 py-1 rounded-lg whitespace-nowrap shadow-lg">
                {action.label}
              </span>
              <button
                onClick={() => {
                  action.onClick();
                  setIsExpanded(false);
                }}
                className={cn(
                  'w-12 h-12 rounded-full shadow-lg',
                  'flex items-center justify-center',
                  'transition-all duration-300',
                  'hover:scale-110 hover:shadow-xl',
                  'active:scale-95',
                  variantClasses[action.variant || 'primary']
                )}
              >
                {action.icon}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-14 h-14 rounded-full shadow-xl',
          'flex items-center justify-center',
          'transition-all duration-300',
          'hover:scale-110 hover:shadow-2xl',
          'active:scale-95',
          'bg-gradient-primary text-white',
          'glow-primary',
          isExpanded && 'rotate-45'
        )}
      >
        {mainIcon || defaultIcon}
      </button>
    </div>
  );
};

export default FloatingActionButton;
