import { useEffect, useMemo } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import AppShell from "./components/ui/AppShell";
import JobsPage from "./pages/JobsPage";
import JobDetail from "./pages/JobDetail";
import WorkersPage from "./pages/WorkersPage";
import { navItems } from "./config/navigation";
import ParticleBackground from "./components/ui/ParticleBackground";
import Badge from './components/ui/Badge';
import { ToastProvider, useToast } from "./components/ui/Toast";
import CommandPalette, { useCommandPalette } from "./components/ui/CommandPalette";
import FloatingActionButton from "./components/ui/FloatingActionButton";
import { useJobsQuery, useMeQuery, useWorkersQuery } from './lib/api';
import { initRealtime } from './lib/socket';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const AppContent = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { isOpen, setIsOpen } = useCommandPalette();
  const { data: me, isLoading: isMeLoading } = useMeQuery();
  const { data: jobs } = useJobsQuery({ enabled: Boolean(me) });
  const { data: workers } = useWorkersQuery({ enabled: Boolean(me) });

  useEffect(() => {
    if (!me) return;
    initRealtime(queryClient);
  }, [me, queryClient]);

  const jobsCount = jobs?.length ?? 0;
  const workersCount = workers?.length ?? 0;

  const navItemsWithBadges = useMemo(
    () => navItems.map((item) => {
      if (item.label === 'Jobs') return { ...item, badge: jobsCount };
      if (item.label === 'Workers') return { ...item, badge: workersCount };
      return item;
    }),
    [jobsCount, workersCount]
  );

  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      return <span>Dashboard</span>;
    }

    return (
      <>
        <span className="text-text-secondary/70">DevPilot</span>
        {segments.map((segment, index) => (
          <span key={`${segment}-${index}`} className="inline-flex items-center gap-2">
            <span className="text-text-tertiary">/</span>
            <span className={index === segments.length - 1 ? 'text-text-primary' : 'text-text-secondary'}>
              {segment === 'jobs' ? 'Jobs' : segment === 'workers' ? 'Workers' : `#${segment}`}
            </span>
          </span>
        ))}
      </>
    );
  }, [location.pathname]);

  const handleGlobalSearch = (query: string) => {
    const value = query.trim().toLowerCase();
    if (!value) return;

    const numericId = value.match(/\d+/)?.[0];
    if (value.startsWith('job') && numericId) {
      navigate(`/jobs/${numericId}`);
      return;
    }

    if (value.includes('worker') || value.includes('agent')) {
      navigate('/workers');
      return;
    }

    navigate('/jobs');
  };

  const initials = me?.login?.slice(0, 2).toUpperCase() ?? '';

  const topBarActions = me ? (
    <>
      {me.role && (
        <Badge variant={me.role === 'admin' ? 'primary' : 'default'} size="sm">
          {me.role.toUpperCase()}
        </Badge>
      )}
      <div className="flex items-center gap-2 rounded-lg glass px-2.5 py-1.5">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-[11px] font-semibold text-white">
          {initials}
        </span>
        <div className="leading-tight">
          <p className="text-xs font-semibold text-text-primary">{me.login}</p>
          <p className="text-[10px] text-text-secondary">Account</p>
        </div>
      </div>
    </>
  ) : null;

  const sidebarFooter = me ? (
    <div className="space-y-2 text-xs">
      <p className="font-semibold text-text-primary">Auth Session</p>
      <div className="flex items-center justify-between text-text-secondary">
        <span>User</span>
        <span className="truncate pl-2 text-text-primary">{me.login}</span>
      </div>
      <div className="flex items-center justify-between text-text-secondary">
        <span>Role</span>
        <span className="text-text-primary uppercase">{me.role}</span>
      </div>
      <div className="flex items-center justify-between text-text-secondary">
        <span>Endpoint</span>
        <span className="text-text-primary">{(import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/^https?:\/\//, "")}</span>
      </div>
    </div>
  ) : null;

  if (isMeLoading) {
    return (
      <div className="min-h-screen bg-base text-text-primary flex items-center justify-center">
        <div className="text-sm text-text-secondary">Checking session…</div>
      </div>
    );
  }

  if (!me) {
    const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
    const loginUrl = new URL("/auth/github", apiBase).toString();

    return (
      <div className="min-h-screen bg-base text-text-primary flex items-center justify-center p-6">
        <div className="max-w-2xl w-full rounded-2xl border border-border bg-elevated p-8 space-y-6 shadow-2xl">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">DevPilot Realtime Review</p>
            <h1 className="text-2xl font-semibold">Connect GitHub to see live PR reviews</h1>
            <p className="text-sm text-text-secondary">
              Sign in once to unlock real-time job streaming, worker status, and detailed PR review context.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-text-secondary">Jobs</p>
              <p className="text-sm font-medium">Live queue updates</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-text-secondary">Workers</p>
              <p className="text-sm font-medium">Heartbeat + assignment</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-text-secondary">Review Detail</p>
              <p className="text-sm font-medium">Summary, findings, logs</p>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-2 bg-base/40">
            <p className="text-sm font-medium">Auth endpoint</p>
            <p className="text-xs text-text-secondary break-all">{loginUrl}</p>
            <p className="text-xs text-text-secondary">If sign-in fails, confirm your GitHub OAuth callback URL is exactly <span className="text-text-primary">http://localhost:4001/auth/github/callback</span>.</p>
          </div>

          <a
            href={loginUrl}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-600"
          >
            Sign in with GitHub
          </a>
        </div>
      </div>
    );
  }

  // Command palette commands
  const commands = [
    {
      id: 'jobs',
      label: 'View Jobs',
      description: 'Navigate to jobs dashboard',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      onSelect: () => navigate('/jobs'),
      keywords: ['dashboard', 'queue', 'tasks'],
    },
    {
      id: 'workers',
      label: 'View Workers',
      description: 'Navigate to workers page',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      onSelect: () => navigate('/workers'),
      keywords: ['agents', 'processors'],
    },
    {
      id: 'theme',
      label: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      onSelect: () => {
        document.body.classList.toggle('theme-dark');
        showToast('success', 'Theme updated successfully');
      },
      keywords: ['dark', 'light', 'appearance'],
    },
  ];

  // Floating action button actions
  const fabActions = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      label: 'New Job',
      onClick: () => navigate('/jobs'),
      variant: 'primary' as const,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      label: 'Search',
      onClick: () => setIsOpen(true),
      variant: 'success' as const,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Settings',
      onClick: () => navigate('/workers'),
      variant: 'warning' as const,
    },
  ];

  return (
    <>
      <ParticleBackground />
      <AppShell
        appName="DevPilot"
        navItems={navItemsWithBadges}
        sidebarFooter={sidebarFooter}
        breadcrumbs={breadcrumbs}
        searchPlaceholder="Search jobs, workers, or type: job 42"
        onSearch={handleGlobalSearch}
        topBarActions={topBarActions}
        maxWidth="full"
      >
        <Routes>
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/workers" element={<WorkersPage />} />
          <Route path="*" element={<Navigate replace to="/jobs" />} />
        </Routes>
      </AppShell>
      <FloatingActionButton actions={fabActions} />
      <CommandPalette commands={commands} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

const App = (): JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;

