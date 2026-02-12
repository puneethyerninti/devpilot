import { PropsWithChildren, ReactNode } from 'react';
import { cn } from '../LayoutHelpers';

type StatCardProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  gradient?: 'blue' | 'green' | 'purple' | 'orange';
}>;

const gradients = {
  blue: 'from-blue-500/10 via-sky-500/5 to-transparent',
  green: 'from-emerald-500/10 via-green-500/5 to-transparent',
  purple: 'from-purple-500/10 via-indigo-500/5 to-transparent',
  orange: 'from-orange-500/10 via-amber-500/5 to-transparent',
};

const StatCard = ({ 
  title, 
  subtitle, 
  icon, 
  trend, 
  trendValue, 
  children, 
  className,
  gradient = 'blue' 
}: StatCardProps): JSX.Element => {
  return (
    <div 
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-panel/80 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl',
        className
      )}
    >
      <div className={cn(
        'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-70',
        gradients[gradient]
      )} aria-hidden />
      
      <div className="relative space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
            {subtitle && <p className="text-[10px] text-muted-foreground/70">{subtitle}</p>}
          </div>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              {icon}
            </div>
          )}
        </div>
        
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold text-foreground">{children}</div>
          {trend && trendValue && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend === 'up' && 'text-green-500',
              trend === 'down' && 'text-red-500',
              trend === 'neutral' && 'text-muted-foreground'
            )}>
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {trend === 'neutral' && '→'}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
