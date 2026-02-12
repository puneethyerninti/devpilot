import { ReactNode } from 'react';
import { cn } from '../LayoutHelpers';

/**
 * Premium Animated Stat Card Component
 * With icons, trends, and glassmorphism effects
 */

interface AnimatedStatCardProps {
  title: string;
  value: string | number | ReactNode;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  variant?: 'default' | 'gradient' | 'glass';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'blue';
  className?: string;
}

const colorClasses = {
  primary: {
    bg: 'bg-primary/10',
    icon: 'text-primary',
    iconBg: 'bg-primary/20',
  },
  success: {
    bg: 'bg-success/10',
    icon: 'text-success',
    iconBg: 'bg-success/20',
  },
  warning: {
    bg: 'bg-warning/10',
    icon: 'text-warning',
    iconBg: 'bg-warning/20',
  },
  danger: {
    bg: 'bg-danger/10',
    icon: 'text-danger',
    iconBg: 'bg-danger/20',
  },
  purple: {
    bg: 'bg-purple-500/10',
    icon: 'text-purple-500',
    iconBg: 'bg-purple-500/20',
  },
  blue: {
    bg: 'bg-blue-500/10',
    icon: 'text-blue-500',
    iconBg: 'bg-blue-500/20',
  },
};

const AnimatedStatCard = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  variant = 'default',
  color = 'primary',
  className,
}: AnimatedStatCardProps) => {
  const colors = colorClasses[color];

  return (
    <div
      className={cn(
        'rounded-xl p-6 transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-1',
        'animate-fadeInUp',
        variant === 'gradient' && 'gradient-primary text-white',
        variant === 'glass' && 'glass-card',
        variant === 'default' && 'bg-elevated border border-border shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn(
            'text-sm font-medium',
            variant === 'gradient' ? 'text-white/80' : 'text-text-secondary'
          )}>
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className={cn(
              'text-3xl font-bold',
              variant === 'gradient' ? 'text-white' : 'text-text-primary'
            )}>
              {value}
            </h3>
            {trend && (
              <span
                className={cn(
                  'flex items-center text-sm font-semibold',
                  trend.isPositive ? 'text-success' : 'text-danger'
                )}
              >
                {trend.isPositive ? (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className={cn(
              'text-xs mt-1',
              variant === 'gradient' ? 'text-white/70' : 'text-text-tertiary'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              variant === 'gradient' ? 'bg-white/20' : colors.iconBg,
              variant === 'gradient' ? 'text-white' : colors.icon
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedStatCard;
