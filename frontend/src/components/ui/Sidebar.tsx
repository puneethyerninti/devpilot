import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../LayoutHelpers';

/**
 * Premium Floating Sidebar navigation component
 * Fixed 240px width with glassmorphism, logo, nav items, and user profile
 */

export interface NavItem {
  section?: string;
  label: string;
  to?: string;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
  soon?: boolean;
}

export interface SidebarProps {
  logo?: ReactNode;
  appName?: string;
  navItems: NavItem[];
  footer?: ReactNode;
  className?: string;
}

const Sidebar = ({ logo, appName = 'DevPilot', navItems, footer, className }: SidebarProps) => {
  const groupedItems = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const group = item.section ?? 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <aside
      className={cn(
        'hidden md:flex h-screen w-60 flex-col md:sticky md:top-0 z-20',
        'glass-strong relative',
        'shadow-2xl shadow-primary-500/5',
        'before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary-500/5 before:via-transparent before:to-purple-500/5 before:pointer-events-none',
        className
      )}
      role="navigation"
      aria-label="Primary navigation"
    >
      {/* vertical premium divider (replaces border-r) */}
      <div className="absolute right-0 top-6 bottom-6 w-px divider-vertical" aria-hidden="true" />
      {/* Logo Header with floating effect */}
      <div className="relative flex items-center gap-3 px-5 py-5 overflow-hidden animate-fadeInDown">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-primary-600/10 to-primary-700/10 animate-gradient-shift" aria-hidden="true" />
        
        {/* Floating orbs */}
        <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-primary-400/20 blur-3xl animate-float" aria-hidden="true" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-purple-400/20 blur-3xl animate-float delay-1000" aria-hidden="true" />
        
        <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-primary-500/30 hover:scale-110 transition-transform duration-300">
          <span className="absolute -inset-1 rounded-2xl border border-primary/40 animate-spin [animation-duration:8s]" aria-hidden="true" />
          <span className="relative">{logo || 'DP'}</span>
        </div>
        
        <div className="relative flex items-center gap-2 min-w-0">
          <div className="font-bold tracking-tight text-lg text-gradient truncate">
            {appName}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full glass px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" aria-hidden="true" />
            Live
          </span>
        </div>
        <div className="absolute left-5 right-5 bottom-0 h-px divider-horizontal" aria-hidden="true" />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto scrollbar-thin">
        {Object.entries(groupedItems).map(([group, items]) => (
          <div key={group} className="space-y-1.5">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">
              {group}
            </p>
            {items.map((item, idx) => {
              if (item.disabled || item.soon) {
                return (
                  <div
                    key={`${item.label}-${idx}`}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                      'text-text-tertiary/50 cursor-not-allowed'
                    )}
                    aria-label={item.soon ? `${item.label} coming soon` : item.label}
                  >
                    {item.icon && <span className="inline-flex items-center opacity-50">{item.icon}</span>}
                    <span>{item.label}</span>
                    {item.soon && (
                      <span className="ml-auto rounded-full glass px-2 py-0.5 text-[10px] uppercase tracking-wide animate-pulse">
                        Soon
                      </span>
                    )}
                    {item.badge && <span className="ml-auto badge badge-primary">{item.badge}</span>}
                  </div>
                );
              }

              if (!item.to) return null;

              return (
                <NavLink
                  key={`${item.label}-${idx}`}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                      'outline-none transition-all duration-300',
                      'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary focus-visible:ring-offset-bg-elevated',
                      isActive
                        ? 'glass bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-md shadow-primary-500/10 scale-[1.02]'
                        : 'text-text-secondary hover:glass hover:bg-gradient-to-r hover:from-bg-surface/50 hover:to-transparent hover:text-text-primary hover:scale-[1.02] hover:shadow-sm'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className="absolute left-0 h-4 w-1 rounded-r bg-gradient-to-b from-primary-400 to-primary-600 shadow-lg shadow-primary-500/50"
                          aria-hidden="true"
                        />
                      )}

                      {item.icon && (
                        <span
                          className={cn(
                            'inline-flex items-center transition-all duration-300',
                            isActive ? 'text-primary drop-shadow-glow' : 'opacity-60 group-hover:opacity-100 group-hover:scale-110'
                          )}
                        >
                          {item.icon}
                        </span>
                      )}

                      <span className="relative">{item.label}</span>

                      {item.badge && (
                        <span className={cn(
                          'ml-auto rounded-full px-2 py-0.5 text-xs font-semibold transition-all duration-300',
                          isActive
                            ? 'glass-strong text-primary shadow-sm'
                            : 'glass text-text-secondary group-hover:glass-strong group-hover:text-primary'
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer with glass effect */}
      {footer && (
        <div className="glass-card px-4 py-3 animate-fadeInUp">
          <div className="mb-3 divider-horizontal" aria-hidden="true" />
          {footer}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
