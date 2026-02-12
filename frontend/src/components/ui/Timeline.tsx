import { ReactNode } from 'react';
import { cn } from '../LayoutHelpers';

/**
 * Premium Timeline Component with animations
 * Perfect for showing job/deployment history like Vercel
 */

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: ReactNode;
  status?: 'success' | 'error' | 'warning' | 'pending' | 'active';
  metadata?: { label: string; value: string }[];
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const statusConfig = {
  success: {
    color: 'bg-success',
    ring: 'ring-success/20',
    icon: (
      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    color: 'bg-danger',
    ring: 'ring-danger/20',
    icon: (
      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    color: 'bg-warning',
    ring: 'ring-warning/20',
    icon: (
      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01" />
      </svg>
    ),
  },
  pending: {
    color: 'bg-text-tertiary',
    ring: 'ring-text-tertiary/20',
    icon: (
      <div className="w-2 h-2 bg-white rounded-full" />
    ),
  },
  active: {
    color: 'bg-primary animate-pulse',
    ring: 'ring-primary/20 pulse-glow',
    icon: (
      <div className="w-2 h-2 bg-white rounded-full" />
    ),
  },
};

const Timeline = ({ items, className }: TimelineProps) => {
  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => {
        const config = statusConfig[item.status || 'pending'];
        return (
          <div
            key={item.id}
            className={cn(
              'relative flex gap-4 animate-fadeInUp',
              `stagger-${(index % 5) + 1}`
            )}
          >
            {/* Timeline line */}
            {index < items.length - 1 && (
              <div className="absolute left-[15px] top-8 w-0.5 h-full bg-border" />
            )}

            {/* Status icon */}
            <div className="relative flex-shrink-0">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  'ring-4 transition-all duration-300',
                  config.color,
                  config.ring
                )}
              >
                {item.icon || config.icon}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="glass-card rounded-lg p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="text-sm font-semibold text-text-primary">
                    {item.title}
                  </h4>
                  <span className="text-xs text-text-tertiary whitespace-nowrap">
                    {item.timestamp}
                  </span>
                </div>

                {item.description && (
                  <p className="text-sm text-text-secondary mb-3">
                    {item.description}
                  </p>
                )}

                {item.metadata && item.metadata.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {item.metadata.map((meta, i) => (
                      <div key={i} className="text-xs">
                        <span className="text-text-tertiary">{meta.label}: </span>
                        <span className="text-text-primary font-medium">{meta.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
