import { ReactNode } from 'react';
import { cn } from '../LayoutHelpers';

/**
 * Badge component for status indicators, tags, and labels
 * Supports size and color variants with optional dot indicator
 */

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface border-border text-text-secondary',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  success: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-300',
  warning: 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-300',
  danger: 'bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-300',
  outline: 'bg-transparent border border-border text-text-primary',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
};

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  className,
}: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'inline-block rounded-full',
            size === 'sm' && 'h-1.5 w-1.5',
            size === 'md' && 'h-2 w-2',
            size === 'lg' && 'h-2.5 w-2.5',
            variant === 'success' && 'bg-success-600',
            variant === 'danger' && 'bg-danger-600',
            variant === 'warning' && 'bg-warning-600',
            variant === 'primary' && 'bg-primary-600'
          )}
          aria-hidden="true"
        />
      )}
      {children}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
          aria-label="Remove"
        >
          <svg className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Badge;
