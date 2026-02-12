import { ReactNode } from 'react';
import { cn } from '../LayoutHelpers';

/**
 * Premium Card component with multiple variants
 * Supports elevated, outline, hover effects, and gradient borders
 */

export type CardVariant = 'default' | 'elevated' | 'outline' | 'ghost';

export interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  footer?: ReactNode;
  variant?: CardVariant;
  hover?: boolean;
  className?: string;
  contentClassName?: string;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'border border-border bg-elevated shadow-sm',
  elevated: 'border border-border bg-elevated shadow-md',
  outline: 'border-2 border-border bg-transparent',
  ghost: 'border-0 bg-transparent',
};

const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  variant = 'default',
  hover = false,
  className,
  contentClassName,
}: CardProps) => {
  return (
    <div
      className={cn(
        'rounded-lg transition-all duration-200',
        variantStyles[variant],
        hover && 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer',
        className
      )}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0 flex-1">
            {title && <h3 className="text-base font-semibold text-text-primary">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-text-secondary">{subtitle}</p>}
          </div>
          {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
        </div>
      )}
      
      <div className={cn('p-5', contentClassName)}>{children}</div>
      
      {footer && <div className="border-t border-border px-5 py-4 bg-surface/50">{footer}</div>}
    </div>
  );
};

export default Card;
