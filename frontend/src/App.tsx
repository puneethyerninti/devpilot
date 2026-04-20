import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import JobDetail from './pages/JobDetail';
import JobsPage from './pages/JobsPage';
import WorkersPage from './pages/WorkersPage';
import { useJobsQuery, useMeQuery, useWorkersQuery } from './lib/api';
import { initRealtime } from './lib/socket';

const isLiveStatus = (status?: string) => {
  const value = (status ?? '').toLowerCase();
  return value === 'queued' || value === 'processing' || value === 'running';
};

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith('/jobs/') && pathname.length > '/jobs/'.length) {
    return 'Review Job Detail';
  }
  if (pathname.startsWith('/workers')) {
    return 'Worker Fleet';
  }
  return 'Live Review Queue';
};

const stripProtocol = (url: string) => url.replace(/^https?:\/\//, '');

const App = (): JSX.Element => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data: me, isLoading: isMeLoading } = useMeQuery();
  const { data: jobs = [] } = useJobsQuery({ enabled: Boolean(me) });
  const { data: workers = [] } = useWorkersQuery({ enabled: Boolean(me) });

  useEffect(() => {
    if (!me) return;
    initRealtime(queryClient);
  }, [me, queryClient]);

  const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
  const loginUrl = new URL('/auth/github', apiBase).toString();
  const callbackUrl = new URL('/auth/github/callback', apiBase).toString();
  const pageTitle = getPageTitle(location.pathname);

  const navItems = useMemo(
    () => [
      { label: 'Jobs', to: '/jobs', count: jobs.length },
      { label: 'Workers', to: '/workers', count: workers.length },
    ],
    [jobs.length, workers.length],
  );

  const activeJobs = useMemo(
    () => jobs.filter((job) => isLiveStatus(job.uiStatus ?? job.status)).length,
    [jobs],
  );

  const onlineWorkers = useMemo(
    () => workers.filter((worker) => worker.status === 'online').length,
    [workers],
  );

  if (isMeLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-sm text-slate-300">Checking session...</div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/30">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">DevPilot Control Center</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Simple realtime PR review dashboard</h1>
          <p className="mt-3 text-sm text-slate-300">
            Connect GitHub once. Then watch queue status, logs, and worker health update live without refresh.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-xs text-slate-400">Queue</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">Live status flow</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-xs text-slate-400">Workers</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">Heartbeat + load</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-xs text-slate-400">Details</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">Streaming logs</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-300">
            <p className="font-semibold text-slate-100">OAuth callback must match exactly</p>
            <p className="mt-1 break-all text-cyan-300">{callbackUrl}</p>
          </div>

          <a
            href={loginUrl}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Connect GitHub
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="md:grid md:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden md:flex md:h-screen md:flex-col md:sticky md:top-0 border-r border-slate-800 bg-slate-900/70 backdrop-blur">
          <div className="border-b border-slate-800 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">DevPilot</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Review Ops</h2>
            <p className="mt-1 text-xs text-slate-400">Realtime queue control</p>
          </div>

          <nav className="px-3 py-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition',
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent',
                  ].join(' ')
                }
              >
                <span>{item.label}</span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-200">{item.count}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto border-t border-slate-800 px-4 py-4 space-y-3 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-slate-400">Live jobs</p>
              <p className="mt-1 text-base font-semibold text-cyan-300">{activeJobs}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-slate-400">Workers online</p>
              <p className="mt-1 text-base font-semibold text-emerald-300">{onlineWorkers} / {workers.length}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-slate-300">
              <p className="font-semibold text-slate-100">{me.login}</p>
              <p className="uppercase tracking-[0.12em] text-[10px] text-slate-400">{me.role}</p>
              <p className="mt-1 break-all text-[10px] text-slate-500">{stripProtocol(apiBase)}</p>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
            <div className="px-4 py-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Realtime Dashboard</p>
                <h1 className="text-xl font-semibold text-white">{pageTitle}</h1>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                  Stream active
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-300">
                  API {stripProtocol(apiBase)}
                </span>
              </div>
            </div>
          </header>

          <main className="px-4 py-5 sm:px-6 lg:px-8 space-y-4">
            <nav className="md:hidden flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'rounded-lg px-3 py-1.5 text-xs font-medium border',
                      isActive
                        ? 'border-cyan-400/50 bg-cyan-500/20 text-cyan-200'
                        : 'border-slate-700 bg-slate-900 text-slate-300',
                    ].join(' ')
                  }
                >
                  {item.label} ({item.count})
                </NavLink>
              ))}
            </nav>

            <Routes>
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/workers" element={<WorkersPage />} />
              <Route path="*" element={<Navigate replace to="/jobs" />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;

