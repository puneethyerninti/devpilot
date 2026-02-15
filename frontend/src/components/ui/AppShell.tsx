import { ReactNode } from 'react';
import { cn } from '../LayoutHelpers';
import Sidebar, { NavItem } from './Sidebar';
import TopBar from './TopBar';

/**
 * Premium AppShell layout component
 * Combines Sidebar (240px fixed) + TopBar (64px) + main content area
 * Production-grade layout with responsive design
 */

export interface AppShellProps {
  children: ReactNode;
  
  // Sidebar props
  logo?: ReactNode;
  appName?: string;
  navItems: NavItem[];
  sidebarFooter?: ReactNode;
  
  // TopBar props
  breadcrumbs?: ReactNode;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  topBarActions?: ReactNode;
  
  // Layout props
  maxWidth?: 'full' | '7xl' | '6xl' | '5xl';
  className?: string;
}

const maxWidthClasses = {
  full: 'max-w-full',
  '7xl': 'max-w-7xl',
  '6xl': 'max-w-6xl',
  '5xl': 'max-w-5xl',
};

const AppShell = ({
  children,
  logo,
  appName,
  navItems,
  sidebarFooter,
  breadcrumbs,
  searchPlaceholder,
  onSearch,
  topBarActions,
  maxWidth = '6xl',
  className,
}: AppShellProps) => {
  const hasTopBar = Boolean(breadcrumbs || onSearch || topBarActions);

  return (
    <div className={cn('min-h-screen bg-base text-text-primary md:grid md:grid-cols-[15rem_minmax(0,1fr)]', className)}>
      {/* Fixed Sidebar Navigation */}
      <Sidebar logo={logo} appName={appName} navItems={navItems} footer={sidebarFooter} />

      {/* Main Content Area */}
      <main className="min-w-0">
        {/* Fixed Top Navigation Bar */}
        {hasTopBar && (
          <TopBar
            breadcrumbs={breadcrumbs}
            searchPlaceholder={searchPlaceholder}
            onSearch={onSearch}
            actions={topBarActions}
          />
        )}

        {/* Page Content with top padding for fixed topbar */}
        <div className={cn('mx-auto px-6 pb-8 space-y-6', hasTopBar ? 'pt-[72px]' : 'pt-6', maxWidthClasses[maxWidth])}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppShell;
