import { ReactNode } from 'react';
import { cn } from '../LayoutHelpers';

/**
 * PageHeader component for page titles, descriptions, and action buttons
 * Supports optional tab navigation
 */

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  tabs?: ReactNode;
  breadcrumbs?: ReactNode;
  className?: string;
}

const PageHeader = ({ title, subtitle, icon, actions, tabs, breadcrumbs, className }: PageHeaderProps) => {
  return (
    <div className={cn('space-y-4', className)}>
      {breadcrumbs && <div className="flex items-center gap-2 text-sm text-text-secondary">{breadcrumbs}</div>}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {icon && <div className="flex-shrink-0 mt-1 text-text-secondary">{icon}</div>}
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-semibold tracking-tight text-text-primary truncate">{title}</h1>
            {subtitle && <p className="mt-1 text-base text-text-secondary">{subtitle}</p>}
          </div>
        </div>

        {actions && <div className="flex-shrink-0 flex items-center gap-2">{actions}</div>}
      </div>

      {tabs && <div className="border-b border-border">{tabs}</div>}
    </div>
  );
};

export default PageHeader;
