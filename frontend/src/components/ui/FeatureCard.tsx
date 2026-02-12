import { ReactNode } from 'react';
import { cn } from '../LayoutHelpers';

/**
 * Premium Feature Card Component
 * Perfect for showcasing features with icons and animations
 */

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'gradient' | 'glass' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FeatureCard = ({
  icon,
  title,
  description,
  action,
  variant = 'default',
  size = 'md',
  className,
}: FeatureCardProps) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const iconSizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-300 group',
        'hover:shadow-xl hover:-translate-y-1',
        sizeClasses[size],
        
        variant === 'default' && 'bg-elevated border border-border shadow-md',
        variant === 'gradient' && 'gradient-primary text-white',
        variant === 'glass' && 'glass-strong',
        variant === 'bordered' && 'bg-base border-2 border-border hover:border-primary',
        
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'rounded-xl mb-4 flex items-center justify-center',
          'transition-transform duration-300 group-hover:scale-110',
          iconSizeClasses[size],
          variant === 'gradient' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
        )}
      >
        {icon}
      </div>

      {/* Content */}
      <h3
        className={cn(
          'font-semibold mb-2',
          size === 'sm' && 'text-base',
          size === 'md' && 'text-lg',
          size === 'lg' && 'text-xl',
          variant === 'gradient' ? 'text-white' : 'text-text-primary'
        )}
      >
        {title}
      </h3>

      <p
        className={cn(
          'mb-4',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base',
          variant === 'gradient' ? 'text-white/80' : 'text-text-secondary'
        )}
      >
        {description}
      </p>

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'flex items-center gap-2 text-sm font-medium transition-all duration-200',
            'group-hover:gap-3',
            variant === 'gradient' ? 'text-white hover:text-white/80' : 'text-primary hover:text-primary-600'
          )}
        >
          {action.label}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default FeatureCard;

/**
 * Feature Grid Component
 * For displaying multiple feature cards in a responsive grid
 */

interface FeatureGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const FeatureGrid = ({ children, columns = 3, className }: FeatureGridProps) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', columnClasses[columns], className)}>
      {children}
    </div>
  );
};
