import { ReactNode, useEffect, useState } from 'react';
import { cn } from '../LayoutHelpers';

/**
 * Premium Floating TopBar navigation component
 * Sticky header with scroll-based hiding, glassmorphism, breadcrumbs, search, and actions
 */

export interface TopBarProps {
  breadcrumbs?: ReactNode;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actions?: ReactNode;
  className?: string;
}

const TopBar = ({ breadcrumbs, searchPlaceholder = 'Search...', onSearch, actions, className }: TopBarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show/hide based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false); // Scrolling down
      } else {
        setIsVisible(true); // Scrolling up
      }
      
      // Add shadow/blur effect when scrolled
      setIsScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-30',
        'glass-strong relative',
        'transition-all duration-300 ease-in-out',
        isVisible ? 'translate-y-0' : '-translate-y-full',
        isScrolled ? 'shadow-2xl shadow-primary-500/5' : 'shadow-sm',
        className
      )}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-purple-500/5 to-primary-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" aria-hidden="true" />
      
      {/* content wrapper: shift inner content right on md+ to sit after the sidebar (15rem) */}
      <div className="w-full">
        <div className="flex items-center gap-2 pl-6 pr-6 py-3 md:pl-[15rem] md:pr-6 md:gap-3">
        {/* Breadcrumbs */}
        {breadcrumbs && (
          <div className="min-w-0 shrink grow animate-slideInRight">
            <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-text-secondary">{breadcrumbs}</div>
          </div>
        )}

        {/* Search Bar with premium styling */}
        {onSearch && (
          <div className="flex min-w-0 flex-1 items-center gap-2 animate-fadeIn">
            <div className="group relative w-full">
              {/* Hover glow effect */}
              <div
                className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-primary-400/10 to-primary-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-sm"
                aria-hidden="true"
              />
              
              {/* Search icon */}
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <svg className="h-4 w-4 text-text-tertiary/60 group-hover:text-primary transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Input field */}
              <input
                type="search"
                placeholder={searchPlaceholder}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSearch(searchInput.trim());
                  }
                }}
                className={cn(
                  'relative w-full rounded-lg glass border border-transparent',
                  'pl-9 pr-2 py-2 text-sm text-text-primary font-medium',
                  'placeholder:text-text-tertiary/50',
                  'outline-none transition-all duration-300',
                  'focus:border-primary/50 focus:glass-strong focus:ring-2 focus:ring-primary/20 focus:shadow-lg focus:shadow-primary-500/10',
                  'hover:border-primary/30'
                )}
                aria-label="Search"
              />
              
              {/* Keyboard shortcut hint */}
              <div className="pointer-events-none absolute inset-y-0 right-2 hidden items-center xl:flex">
                <kbd className="hidden lg:inline-flex items-center gap-1 rounded border border-transparent glass px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary/60">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
          </div>
        )}

        {/* Actions (theme toggle, notifications, user menu) */}
        {actions && (
          <div className="ml-2 flex shrink-0 items-center gap-2 animate-fadeIn md:ml-3 md:gap-3">
            {actions}
          </div>
        )}
        </div>
      </div>
      
      {/* Bottom divider (premium) */}
      <div className={cn("absolute bottom-0 left-0 right-0 h-px divider-horizontal transition-opacity duration-500", isScrolled ? "opacity-100" : "opacity-0")} aria-hidden="true" />
    </header>
  );
};

export default TopBar;
