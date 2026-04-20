import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/ui/Button';
import { useJobsQuery, useMeQuery, useRunJob } from '../lib/api';

type StatusFilter = 'all' | 'queued' | 'processing' | 'running' | 'reviewed' | 'done' | 'failed';

const FINAL_STATUSES = new Set(['done', 'reviewed', 'posted', 'completed']);
const LIVE_STATUSES = new Set(['queued', 'processing', 'running']);

const toCanonicalStatus = (status?: string) => (status ?? 'queued').toLowerCase();

const progressFor = (status: string, explicit?: number) => {
  if (typeof explicit === 'number') return Math.max(0, Math.min(100, explicit));
  if (FINAL_STATUSES.has(status)) return 100;
  if (status === 'failed') return 100;
  if (status === 'queued') return 8;
  if (status === 'processing' || status === 'running') return 58;
  return 0;
};

const formatRelativeTime = (isoDate: string, nowMs: number) => {
  const diffSeconds = Math.max(0, Math.floor((nowMs - new Date(isoDate).getTime()) / 1000));
  if (diffSeconds < 10) return 'just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
};

const JobsPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { data: me } = useMeQuery();
  const { data: jobs = [], isLoading, isError, isFetching, refetch } = useJobsQuery({});
  const { mutate: runJob, isPending: isCreatingJob } = useRunJob();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [form, setForm] = useState({
    repo: '',
    prNumber: '',
    installationId: '',
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const normalizedJobs = useMemo(() => {
    return [...jobs]
      .map((job) => ({
        ...job,
        canonicalStatus: toCanonicalStatus(job.uiStatus ?? job.status),
        repoFullName:
          typeof job.repoFullName === 'string' && job.repoFullName.trim().length > 0
            ? job.repoFullName
            : 'unknown/repository',
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return normalizedJobs.filter((job) => {
      if (statusFilter !== 'all' && job.canonicalStatus !== statusFilter) return false;
      if (!query) return true;
      return (
        job.repoFullName.toLowerCase().includes(query) ||
        String(job.id).includes(query) ||
        String(job.prNumber ?? '').includes(query)
      );
    });
  }, [normalizedJobs, search, statusFilter]);

  const stats = useMemo(() => {
    const result = {
      total: normalizedJobs.length,
      live: 0,
      done: 0,
      failed: 0,
      avgRisk: 0,
    };
    let riskSum = 0;
    let riskCount = 0;

    normalizedJobs.forEach((job) => {
      if (LIVE_STATUSES.has(job.canonicalStatus)) result.live += 1;
      if (FINAL_STATUSES.has(job.canonicalStatus)) result.done += 1;
      if (job.canonicalStatus === 'failed') result.failed += 1;
      if (typeof job.riskScore === 'number') {
        riskSum += job.riskScore;
        riskCount += 1;
      }
    });

    result.avgRisk = riskCount > 0 ? Number((riskSum / riskCount).toFixed(2)) : 0;
    return result;
  }, [normalizedJobs]);

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const repo = form.repo.trim();
    const prNumber = Number(form.prNumber);
    const installationId = form.installationId ? Number(form.installationId) : undefined;

    if (!/^.+\/.+$/.test(repo)) {
      window.alert('Repository must be in owner/repo format.');
      return;
    }
    if (!Number.isInteger(prNumber) || prNumber <= 0) {
      window.alert('Pull request number must be a positive integer.');
      return;
    }
    if (form.installationId && (!Number.isInteger(installationId) || (installationId ?? 0) <= 0)) {
      window.alert('Installation ID must be a positive integer.');
      return;
    }

    runJob(
      { repo, prNumber, installationId },
      {
        onSuccess: () => {
          setShowCreate(false);
          setForm({ repo: '', prNumber: '', installationId: '' });
        },
        onError: (error) => {
          const responseError = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
          window.alert(responseError ?? 'Could not start review job. Check permissions and payload values.');
        },
      },
    );
  };

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Queue Operations</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Live Review Queue</h2>
            <p className="mt-1 text-sm text-slate-300">
              Realtime status flow from queued to reviewed with progress and risk visibility.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowCreate((prev) => !prev)}
              disabled={me?.role !== 'admin'}
            >
              {showCreate ? 'Close Form' : 'New Review Job'}
            </Button>
          </div>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="space-y-1 text-xs text-slate-300">
              Repository (owner/repo)
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
                value={form.repo}
                onChange={(event) => setForm((prev) => ({ ...prev, repo: event.target.value }))}
                placeholder="acme/platform"
                required
              />
            </label>
            <label className="space-y-1 text-xs text-slate-300">
              Pull Request Number
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
                value={form.prNumber}
                onChange={(event) => setForm((prev) => ({ ...prev, prNumber: event.target.value }))}
                placeholder="42"
                required
              />
            </label>
            <label className="space-y-1 text-xs text-slate-300">
              Installation ID (optional)
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
                value={form.installationId}
                onChange={(event) => setForm((prev) => ({ ...prev, installationId: event.target.value }))}
                placeholder="12345678"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button type="submit" variant="primary" loading={isCreatingJob}>
              Start Review Job
            </Button>
            <p className="text-xs text-slate-400">Head SHA is auto-resolved from the selected PR. Only admin users can trigger jobs from UI.</p>
          </div>
        </form>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Total</p>
          <p className="mt-1 text-2xl font-semibold text-white">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Live</p>
          <p className="mt-1 text-2xl font-semibold text-cyan-300">{stats.live}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Reviewed</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-300">{stats.done}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Avg Risk</p>
          <p className="mt-1 text-2xl font-semibold text-amber-300">{stats.avgRisk}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="border-b border-slate-800 px-4 py-3 sm:px-5 sm:py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'queued', 'processing', 'running', 'reviewed', 'done', 'failed'] as StatusFilter[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={[
                  'rounded-lg border px-2.5 py-1 text-xs font-medium transition',
                  statusFilter === value
                    ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-200'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500',
                ].join(' ')}
              >
                {value}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by repo, job id, or PR"
            className="w-full lg:w-72 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
          />
        </div>

        {isError && (
          <div className="mx-4 my-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 sm:mx-5">
            Unable to load jobs right now. Check backend connectivity, then refresh.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-950/70 text-xs uppercase tracking-[0.12em] text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Job</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Progress</th>
                <th className="px-4 py-3 text-left">Risk</th>
                <th className="px-4 py-3 text-left">Updated</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Loading queue state...
                  </td>
                </tr>
              )}

              {!isLoading && filteredJobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No jobs match the current filters.
                  </td>
                </tr>
              )}

              {!isLoading && filteredJobs.map((job) => {
                const progress = progressFor(job.canonicalStatus, job.progress);
                const isLive = LIVE_STATUSES.has(job.canonicalStatus);
                const riskColor =
                  typeof job.riskScore !== 'number'
                    ? 'text-slate-300'
                    : job.riskScore > 7
                      ? 'text-rose-300'
                      : job.riskScore > 4
                        ? 'text-amber-300'
                        : 'text-emerald-300';

                return (
                  <tr key={job.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-100">#{job.id} {job.repoFullName}</p>
                      <p className="text-xs text-slate-400">PR #{job.prNumber ?? 'n/a'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={job.canonicalStatus} />
                        {isLive && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-cyan-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
                            Live
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <progress
                          max={100}
                          value={progress}
                          className="h-2 w-28 overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-slate-800 [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-cyan-500 [&::-webkit-progress-value]:to-emerald-400 [&::-moz-progress-bar]:bg-cyan-500"
                        />
                        <span className="text-xs text-slate-300">{progress}%</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-semibold ${riskColor}`}>
                      {typeof job.riskScore === 'number' ? job.riskScore.toFixed(2) : 'n/a'}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-200">{formatRelativeTime(job.updatedAt, now)}</p>
                      <p className="text-xs text-slate-500">{new Date(job.updatedAt).toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/jobs/${job.id}`)}>
                        View
                      </Button>
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

export default JobsPage;

