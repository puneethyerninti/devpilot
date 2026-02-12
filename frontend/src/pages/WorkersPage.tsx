import { useMemo } from 'react';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { useWorkersQuery } from '../lib/api';

const WorkersPage = (): JSX.Element => {
  const { data: workers, isLoading, isRefetching, refetch } = useWorkersQuery();

  const counts = useMemo(() => {
    const stats = { online: 0, offline: 0 };
    (workers ?? []).forEach((w) => {
      if (w.status === 'online') stats.online += 1;
      else stats.offline += 1;
    });
    return stats;
  }, [workers]);

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-800 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Worker grid</p>
            <h2 className="text-2xl font-semibold">Realtime agents</h2>
            <p className="text-sm text-emerald-100/80">Heartbeats, assignments, and queue depth at a glance.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" disabled={isLoading || isRefetching} onClick={() => refetch()}>
              {isRefetching ? 'Refreshing…' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Workers" 
          subtitle="Fleet size" 
          gradient="blue"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>}
        >
          {workers?.length ?? 0}
        </StatCard>
        <StatCard 
          title="Online" 
          subtitle="Active now" 
          gradient="green"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" /></svg>}
        >
          {counts.online}
        </StatCard>
        <StatCard 
          title="Offline" 
          subtitle="Attention needed" 
          gradient="orange"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        >
          {counts.offline}
        </StatCard>
        <StatCard 
          title="Queue Depth" 
          subtitle="Jobs waiting" 
          gradient="purple"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
        >
          {typeof workers?.[0]?.queueDepth === 'number' ? workers[0].queueDepth : 0}
        </StatCard>
      </div>

      <Card title="Fleet" subtitle="Health, assignment, and heartbeats">
        <div className="grid gap-4 p-1 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && (
            <div className="col-span-full rounded-xl border border-border bg-panel/50 p-8 text-center text-sm text-muted-foreground backdrop-blur-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="mt-3">Loading workers…</p>
            </div>
          )}
          {!isLoading && (workers ?? []).length === 0 && (
            <div className="col-span-full rounded-xl border border-border bg-panel/50 p-12 text-center backdrop-blur-sm">
              <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-sm font-medium text-foreground">No workers reported yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Workers will appear here once they start sending heartbeats</p>
            </div>
          )}
          {(workers ?? []).map((worker) => {
            const isOnline = worker.status === 'online';
            const heartbeatTime = new Date(worker.lastHeartbeat);
            const timeSinceHeartbeat = Math.floor((Date.now() - heartbeatTime.getTime()) / 1000);
            const heartbeatStatus = timeSinceHeartbeat < 30 ? 'recent' : timeSinceHeartbeat < 120 ? 'stale' : 'old';
            
            return (
              <div
                key={worker.workerId}
                className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-border/50 bg-panel/60 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-accent/30 hover:shadow-xl"
              >
                {/* Glow effect */}
                <div className={`pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-20 ${
                  isOnline ? 'from-green-500/20 to-emerald-500/20' : 'from-slate-500/10 to-slate-500/10'
                }`} aria-hidden />
                
                {/* Header */}
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br font-semibold text-white shadow-lg ${
                        isOnline ? 'from-green-500 to-emerald-600' : 'from-slate-500 to-slate-600'
                      }`}>
                        {worker.workerId.slice(-2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{worker.workerId}</p>
                        <p className="text-xs text-muted-foreground">
                          {heartbeatStatus === 'recent' && '🟢 Just now'}
                          {heartbeatStatus === 'stale' && '🟡 ' + heartbeatTime.toLocaleTimeString()}
                          {heartbeatStatus === 'old' && '🔴 ' + heartbeatTime.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={worker.status} />
                </div>

                {/* Metrics */}
                <div className="relative grid grid-cols-2 gap-3 rounded-lg bg-muted/30 p-3 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Queue Depth</p>
                    <p className="text-lg font-bold text-foreground">{worker.queueDepth ?? 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Current Job</p>
                    <p className="truncate text-sm font-semibold text-foreground">
                      {worker.currentJobId ? `#${worker.currentJobId}` : '—'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="relative flex items-center justify-between gap-2">
                  <Button variant="outline" size="sm" disabled className="flex-1">
                    Restart
                  </Button>
                  <Button variant="ghost" size="sm" disabled>
                    Logs
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default WorkersPage;

