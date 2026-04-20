import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/ui/Button';
import { LogStream } from '../components/LogStream';
import { useSocket } from '../hooks/useSocket';
import { useJobQuery, useMeQuery, useRetryJob, useRunAi } from '../lib/api';

const FINAL_STATUSES = new Set(['done', 'reviewed', 'posted', 'completed']);

const canonicalStatus = (status?: string) => (status ?? 'queued').toLowerCase();

const progressFor = (status: string, explicit?: number) => {
  if (typeof explicit === 'number') return Math.max(0, Math.min(100, explicit));
  if (FINAL_STATUSES.has(status)) return 100;
  if (status === 'failed') return 100;
  if (status === 'queued') return 8;
  if (status === 'processing' || status === 'running') return 60;
  return 0;
};

const JobDetail = (): JSX.Element => {
  const { id } = useParams();
  const { data, isLoading } = useJobQuery(id ?? '');
  const { data: me } = useMeQuery();
  const { mutate: rerunAi, isPending: isRerunning } = useRunAi();
  const { mutate: retryJob, isPending: isRetrying } = useRetryJob();

  useSocket(id);

  const canOperate = me?.role === 'operator' || me?.role === 'admin';

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center text-slate-300">
        Loading realtime job view...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center">
        <p className="text-lg font-semibold text-white">Job not found</p>
        <p className="mt-1 text-sm text-slate-400">The job might have been removed or is not yet available.</p>
      </div>
    );
  }

  const status = canonicalStatus(data.uiStatus ?? data.status);
  const isLive = status === 'queued' || status === 'processing' || status === 'running';
  const progress = progressFor(status, data.progress);

  const files = data.files ?? [];
  const logs = data.logs ?? [];

  const groupedSuggestions = useMemo(() => {
    const suggestions = data.inlineSuggestions ?? [];
    return suggestions.slice(0, 20);
  }, [data.inlineSuggestions]);

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Job Detail</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">#{data.id} {data.repoFullName}</h2>
            <p className="mt-1 text-sm text-slate-300">PR #{data.prNumber} • SHA {data.headSha.slice(0, 10)}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            {isLive && (
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-cyan-200">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
                Streaming
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <p className="text-xs text-slate-400">Progress</p>
            <p className="mt-1 text-xl font-semibold text-cyan-300">{progress}%</p>
            <progress
              max={100}
              value={progress}
              className="mt-2 h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-slate-800 [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-cyan-500 [&::-webkit-progress-value]:to-emerald-400 [&::-moz-progress-bar]:bg-cyan-500"
            />
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <p className="text-xs text-slate-400">Risk Score</p>
            <p className="mt-1 text-xl font-semibold text-amber-300">{typeof data.riskScore === 'number' ? data.riskScore.toFixed(2) : 'n/a'}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <p className="text-xs text-slate-400">Tokens</p>
            <p className="mt-1 text-xl font-semibold text-slate-100">{typeof data.tokenCount === 'number' ? data.tokenCount : 0}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <p className="text-xs text-slate-400">Estimated Cost</p>
            <p className="mt-1 text-xl font-semibold text-emerald-300">
              {typeof data.costCents === 'number' ? `$${(data.costCents / 100).toFixed(2)}` : '$0.00'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <p className="text-xs text-slate-400">Updated</p>
            <p className="mt-1 text-sm font-semibold text-slate-100">{new Date(data.updatedAt).toLocaleTimeString()}</p>
            <p className="text-xs text-slate-500">{new Date(data.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>

        {canOperate && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              disabled={!id || isRerunning}
              onClick={() => id && rerunAi(id)}
              loading={isRerunning}
            >
              Re-run AI
            </Button>
            {status === 'failed' && (
              <Button
                variant="secondary"
                disabled={!id || isRetrying}
                onClick={() => id && retryJob(id)}
                loading={isRetrying}
              >
                Retry Failed Job
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="text-lg font-semibold text-white">Live Worker Output</h3>
            <p className="mt-1 text-xs text-slate-400">This stream should update in realtime while job is running.</p>
            <div className="mt-4">
              <LogStream logs={logs} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="text-lg font-semibold text-white">AI Summary</h3>
            {data.summary ? (
              <p className="mt-3 text-sm text-slate-200 leading-relaxed">{data.summary}</p>
            ) : (
              <p className="mt-3 text-sm text-slate-400">No summary generated yet.</p>
            )}

            {data.aiReviewMd && (
              <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <MarkdownRenderer content={data.aiReviewMd} />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="text-base font-semibold text-white">Worker</h3>
            <p className="mt-3 text-sm text-slate-200">{data.worker?.name ?? data.worker?.id ?? 'Unassigned'}</p>
            <p className="text-xs text-slate-500">Triggered by {data.triggeredBy ?? 'unknown'}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="text-base font-semibold text-white">Files ({files.length})</h3>
            {files.length === 0 && <p className="mt-3 text-sm text-slate-400">No files recorded.</p>}
            {files.length > 0 && (
              <ul className="mt-3 space-y-2 max-h-64 overflow-auto">
                {files.map((file) => (
                  <li key={file.id} className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                    <p className="text-xs font-semibold text-slate-100 break-all">{file.path}</p>
                    {file.comments?.lines && file.comments.lines.length > 0 && (
                      <p className="mt-1 text-[11px] text-slate-400">Lines: {file.comments.lines.join(', ')}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="text-base font-semibold text-white">Inline Suggestions ({groupedSuggestions.length})</h3>
            {groupedSuggestions.length === 0 && <p className="mt-3 text-sm text-slate-400">No inline suggestions.</p>}
            {groupedSuggestions.length > 0 && (
              <ul className="mt-3 space-y-2 max-h-72 overflow-auto">
                {groupedSuggestions.map((suggestion, index) => (
                  <li
                    key={`${suggestion.file}-${suggestion.startLine}-${index}`}
                    className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
                  >
                    <p className="text-xs font-semibold text-slate-100">
                      {suggestion.file} ({suggestion.startLine}-{suggestion.endLine})
                    </p>
                    <p className="mt-1 text-xs text-slate-300">{suggestion.suggestion}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JobDetail;

