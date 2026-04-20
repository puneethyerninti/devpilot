import { useEffect, useMemo, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/ui/Button';
import { useWorkersQuery } from '../lib/api';

const secondsSince = (isoDate: string, nowMs: number) => {
  return Math.max(0, Math.floor((nowMs - new Date(isoDate).getTime()) / 1000));
};

const relativeHeartbeat = (isoDate: string, nowMs: number) => {
  const seconds = secondsSince(isoDate, nowMs);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
};

const freshnessLabel = (ageSeconds: number) => {
  if (ageSeconds <= 20) return { label: 'Healthy', style: 'text-emerald-300' };
  if (ageSeconds <= 60) return { label: 'Lagging', style: 'text-amber-300' };
  return { label: 'Stale', style: 'text-rose-300' };
};

const WorkersPage = (): JSX.Element => {
  const { data: workers = [], isLoading, isRefetching, refetch } = useWorkersQuery();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredWorkers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return workers
      .filter((worker) => {
        if (statusFilter !== 'all' && worker.status !== statusFilter) return false;
        if (!query) return true;
        return worker.workerId.toLowerCase().includes(query);
      })
      .sort((a, b) => new Date(b.lastHeartbeat).getTime() - new Date(a.lastHeartbeat).getTime());
  }, [workers, search, statusFilter]);

  const stats = useMemo(() => {
    const result = {
      total: workers.length,
      online: 0,
      offline: 0,
      queueDepth: 0,
    };

    workers.forEach((worker) => {
      if (worker.status === 'online') result.online += 1;
      else result.offline += 1;
      result.queueDepth += worker.queueDepth ?? 0;
    });

    return result;
  }, [workers]);

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Fleet Control</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Worker Fleet</h2>
            <p className="mt-1 text-sm text-slate-300">
              Heartbeat freshness, queue pressure, and current assignments in realtime.
            </p>
          </div>
          <Button variant="secondary" disabled={isLoading || isRefetching} onClick={() => refetch()}>
            {isRefetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Total Workers</p>
          <p className="mt-1 text-2xl font-semibold text-white">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Online</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-300">{stats.online}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Offline</p>
          <p className="mt-1 text-2xl font-semibold text-slate-300">{stats.offline}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Queue Depth</p>
          <p className="mt-1 text-2xl font-semibold text-cyan-300">{stats.queueDepth}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="border-b border-slate-800 px-4 py-3 sm:px-5 sm:py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={[
                'rounded-lg border px-2.5 py-1 text-xs font-medium transition',
                statusFilter === 'all'
                  ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-200'
                  : 'border-slate-700 bg-slate-900 text-slate-300',
              ].join(' ')}
            >
              all
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('online')}
              className={[
                'rounded-lg border px-2.5 py-1 text-xs font-medium transition',
                statusFilter === 'online'
                  ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-200'
                  : 'border-slate-700 bg-slate-900 text-slate-300',
              ].join(' ')}
            >
              online
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('offline')}
              className={[
                'rounded-lg border px-2.5 py-1 text-xs font-medium transition',
                statusFilter === 'offline'
                  ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-200'
                  : 'border-slate-700 bg-slate-900 text-slate-300',
              ].join(' ')}
            >
              offline
            </button>
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search worker id"
            className="w-full lg:w-72 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-950/70 text-xs uppercase tracking-[0.12em] text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Worker</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Heartbeat</th>
                <th className="px-4 py-3 text-left">Queue Depth</th>
                <th className="px-4 py-3 text-left">Current Job</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Loading worker fleet...
                  </td>
                </tr>
              )}

              {!isLoading && filteredWorkers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No workers match the current filters.
                  </td>
                </tr>
              )}

              {!isLoading && filteredWorkers.map((worker) => {
                const ageSeconds = secondsSince(worker.lastHeartbeat, now);
                const freshness = freshnessLabel(ageSeconds);

                return (
                  <tr key={worker.workerId} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-semibold text-slate-100">{worker.workerId}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={worker.status} />
                    </td>
                    <td className="px-4 py-3">
                      <p className={freshness.style}>{freshness.label}</p>
                      <p className="text-xs text-slate-400">
                        {relativeHeartbeat(worker.lastHeartbeat, now)} ({new Date(worker.lastHeartbeat).toLocaleTimeString()})
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-200">{worker.queueDepth ?? 0}</td>
                    <td className="px-4 py-3 text-slate-200">
                      {worker.currentJobId ? `#${worker.currentJobId}` : 'idle'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default WorkersPage;

