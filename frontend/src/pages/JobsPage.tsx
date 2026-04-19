import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Skeleton from '../components/ui/Skeleton';
import AnimatedStatCard from '../components/ui/AnimatedStatCard';
import Tabs from '../components/ui/Tabs';
import SearchBar from '../components/ui/SearchBar';
import ProgressBar from '../components/ui/ProgressBar';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { useJobsQuery, useMeQuery, useReposQuery, useRunJob } from '../lib/api';
import axios from 'axios';

const JobsPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'queued' | 'processing' | 'done' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [repoMode, setRepoMode] = useState<'connected' | 'custom'>('connected');
  const [selectedRepoId, setSelectedRepoId] = useState('');
  const [repoInput, setRepoInput] = useState('');
  const [prNumberInput, setPrNumberInput] = useState('');
  const [headShaInput, setHeadShaInput] = useState('');
  const [installationIdInput, setInstallationIdInput] = useState('');
  const [createJobError, setCreateJobError] = useState<string | null>(null);
  const { data: jobs, isLoading, isError, refetch } = useJobsQuery({ status: filter === 'all' ? undefined : filter });
  const { data: me } = useMeQuery();
  const { data: repos = [], isLoading: isReposLoading } = useReposQuery();
  const { mutate: runJob, isPending: isCreatingJob } = useRunJob();

  const resetCreateForm = () => {
    const initialRepo = repos[0];
    setRepoMode(initialRepo ? 'connected' : 'custom');
    setSelectedRepoId(initialRepo ? String(initialRepo.id) : '');
    setRepoInput(initialRepo?.fullName ?? '');
    setPrNumberInput(initialRepo?.lastPrNumber ? String(initialRepo.lastPrNumber) : '');
    setHeadShaInput(initialRepo?.lastHeadSha ?? '');
    setInstallationIdInput(initialRepo?.lastInstallationId ? String(initialRepo.lastInstallationId) : '');
    setCreateJobError(null);
  };

  const openCreateJobModal = () => {
    resetCreateForm();
    setCreateModalOpen(true);
  };

  const closeCreateJobModal = () => {
    setCreateModalOpen(false);
    setCreateJobError(null);
  };

  const submitCreateJob = () => {
    const repo = repoInput.trim();
    const headSha = headShaInput.trim();
    const prNumber = Number(prNumberInput);
    const rawInstallationId = installationIdInput.trim();
    const installationId = rawInstallationId ? Number(rawInstallationId) : undefined;

    if (!/^[^/\s]+\/[^/\s]+$/.test(repo)) {
      setCreateJobError('Repository must be in owner/repo format.');
      return;
    }

    if (!Number.isInteger(prNumber) || prNumber <= 0) {
      setCreateJobError('Pull request number must be a positive integer.');
      return;
    }

    if (headSha.length < 6) {
      setCreateJobError('Head SHA must be at least 6 characters.');
      return;
    }

    if (
      rawInstallationId &&
      (typeof installationId !== 'number' || !Number.isInteger(installationId) || installationId <= 0)
    ) {
      setCreateJobError('Installation ID must be a positive integer when provided.');
      return;
    }

    setCreateJobError(null);

    runJob(
      {
        repo,
        prNumber,
        headSha,
        installationId
      },
      {
        onSuccess: () => {
          closeCreateJobModal();
        },
        onError: (error) => {
          if (axios.isAxiosError<{ error?: string }>(error)) {
            setCreateJobError(error.response?.data?.error ?? 'Failed to create job.');
            return;
          }
          setCreateJobError('Failed to create job.');
        }
      }
    );
  };

  const normalizedJobs = useMemo(() => {
    return (jobs ?? []).map((job) => {
      const repoFullName = typeof job.repoFullName === 'string' && job.repoFullName.trim().length > 0
        ? job.repoFullName
        : 'unknown/repository';

      return {
        ...job,
        repoFullName,
      };
    });
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    let result = normalizedJobs;
    
    if (filter !== 'all') {
      result = result.filter((job) => job.status === filter);
    }
    
    if (searchQuery) {
      result = result.filter((job) =>
        job.repoFullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.prNumber?.toString().includes(searchQuery)
      );
    }
    
    return result;
  }, [jobs, normalizedJobs, filter, searchQuery]);

  const stats = useMemo(() => {
    const base = { total: normalizedJobs.length, queued: 0, processing: 0, done: 0, failed: 0, avgRisk: 0 };
    if (!normalizedJobs.length) return base;
    let riskSum = 0;
    let riskCount = 0;
    normalizedJobs.forEach((job) => {
      const key = job.status as keyof typeof base;
      if (key in base) base[key] += 1;
      if (typeof job.riskScore === 'number') {
        riskSum += job.riskScore;
        riskCount += 1;
      }
    });
    base.avgRisk = riskCount ? Number((riskSum / riskCount).toFixed(2)) : 0;
    return base;
  }, [normalizedJobs]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'queued': return 'warning';
      case 'processing': return 'primary';
      case 'done': return 'success';
      case 'failed': return 'danger';
      default: return 'default';
    }
  };

  const tabs = [
    { id: 'all', label: 'All Jobs', badge: stats.total },
    { id: 'queued', label: 'Queued', badge: stats.queued },
    { id: 'processing', label: 'Processing', badge: stats.processing },
    { id: 'done', label: 'Completed', badge: stats.done },
    { id: 'failed', label: 'Failed', badge: stats.failed },
  ];

  const completionRate = stats.total > 0 ? (stats.done / stats.total) * 100 : 0;
  const selectedRepo = useMemo(
    () => repos.find((repo) => String(repo.id) === selectedRepoId),
    [repos, selectedRepoId]
  );

  return (
    <div className="space-y-6">
      {/* Page Header with Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Job Control Room"
          subtitle="Real-time queue, risk signals, and worker handoffs"
        />
        <Button
          variant="primary"
          size="md"
          className="glass-strong shadow-lg hover:shadow-xl"
          onClick={openCreateJobModal}
          disabled={!me || (me.role !== 'admin' && me.role !== 'operator') || isCreatingJob}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {isCreatingJob ? 'Creating...' : 'New Job'}
        </Button>
      </div>

      {/* Premium Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedStatCard
          title="Total Jobs"
          value={<AnimatedCounter value={stats.total} />}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          color="blue"
          subtitle="All time jobs"
        />

        <AnimatedStatCard
          title="Processing"
          value={<AnimatedCounter value={stats.processing} />}
          icon={
            <div className="animate-spin">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          }
          color="primary"
          trend={{ value: 12, isPositive: true }}
          subtitle="Currently active"
        />

        <AnimatedStatCard
          title="Completed"
          value={<AnimatedCounter value={stats.done} />}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="success"
          trend={{ value: 8, isPositive: true }}
          subtitle={`${completionRate.toFixed(0)}% success rate`}
        />

        <AnimatedStatCard
          title="Avg Risk Score"
          value={stats.avgRisk}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          color="warning"
          subtitle="Risk assessment"
        />
      </div>

      {/* Progress Overview */}
      <Card variant="elevated" className="glass-card">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Overall Progress</h3>
          <ProgressBar
            value={completionRate}
            variant="gradient"
            size="lg"
            showLabel
            label="Completion Rate"
            animated
          />
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                <AnimatedCounter value={stats.queued} />
              </p>
              <p className="text-xs text-text-secondary">Queued</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">
                <AnimatedCounter value={stats.processing} />
              </p>
              <p className="text-xs text-text-secondary">Processing</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">
                <AnimatedCounter value={stats.done} />
              </p>
              <p className="text-xs text-text-secondary">Done</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Search Bar */}
      <SearchBar
        placeholder="Search jobs by repository or PR number..."
        onSearch={setSearchQuery}
        variant="glass"
        size="lg"
      />

      {isError && (
        <Card variant="outline">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">Couldn’t load jobs right now</p>
              <p className="text-xs text-text-secondary">Please check backend connectivity and try refreshing.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs for Filtering */}
      <Tabs
        tabs={tabs}
        defaultTab={filter}
        onChange={(tabId) => setFilter(tabId as typeof filter)}
        variant="pills"
        size="md"
      >
        {(activeTab) => (
          <Card variant="elevated" className="glass-card" contentClassName="p-4 sm:p-5">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex items-center space-x-4 p-4 animate-fadeInUp stagger-${Math.min(i+1,5)}`}>
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-12 h-12 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                title="No jobs found"
                description={searchQuery ? "No jobs match your search query." : filter === 'all' ? "No jobs have been created yet." : `No jobs with status "${filter}".`}
                actionLabel="Create First Job"
                onAction={openCreateJobModal}
              />
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((job, index) => (
                  <div
                    key={job.id}
                    className={`group flex items-center justify-between p-4 rounded-lg border border-border 
                      glass hover:glass-strong cursor-pointer transition-all duration-300 
                      hover:shadow-lg hover:-translate-y-0.5 animate-fadeInUp stagger-${(index % 5) + 1}`}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <span className="text-lg font-bold text-white">
                            {job.repoFullName.split('/')[0]?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                          {job.repoFullName}
                        </p>
                        <p className="text-xs text-text-secondary flex items-center gap-2">
                          {job.prNumber && (
                            <>
                              <span className="font-medium">PR #{job.prNumber}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {job.riskScore !== undefined && (
                        <Badge variant={job.riskScore > 7 ? 'danger' : job.riskScore > 4 ? 'warning' : 'success'}>
                          Risk: {job.riskScore}
                        </Badge>
                      )}
                      <Badge variant={getStatusBadgeVariant(job.uiStatus ?? job.status)}>
                        {job.uiStatus ?? job.status}
                      </Badge>
                      <svg className="w-5 h-5 text-text-tertiary group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </Tabs>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateJobModal}
        title="Create PR Review Job"
        subtitle="Create a live GitHub PR review job."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={closeCreateJobModal} disabled={isCreatingJob}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submitCreateJob} loading={isCreatingJob}>
              Create Job
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {repos.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">Repository source</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={repoMode === 'connected' ? 'primary' : 'secondary'}
                  onClick={() => {
                    setRepoMode('connected');
                    if (repos[0]) {
                      setSelectedRepoId(String(repos[0].id));
                      setRepoInput(repos[0].fullName);
                    }
                  }}
                  disabled={isCreatingJob}
                >
                  Connected Repo
                </Button>
                <Button
                  variant={repoMode === 'custom' ? 'primary' : 'secondary'}
                  onClick={() => {
                    setRepoMode('custom');
                    setSelectedRepoId('');
                    setRepoInput('');
                  }}
                  disabled={isCreatingJob}
                >
                  Custom Repo
                </Button>
              </div>
            </div>
          )}

          {repoMode === 'connected' && repos.length > 0 ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary" htmlFor="repo-select">Repository</label>
              <select
                id="repo-select"
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                value={selectedRepoId}
                onChange={(event) => {
                  const nextRepo = repos.find((repo) => String(repo.id) === event.target.value);
                  setSelectedRepoId(event.target.value);
                  if (!nextRepo) return;
                  setRepoInput(nextRepo.fullName);
                  setPrNumberInput(nextRepo.lastPrNumber ? String(nextRepo.lastPrNumber) : '');
                  setHeadShaInput(nextRepo.lastHeadSha ?? '');
                  setInstallationIdInput(nextRepo.lastInstallationId ? String(nextRepo.lastInstallationId) : '');
                }}
                disabled={isCreatingJob || isReposLoading}
              >
                {repos.map((repo) => (
                  <option key={repo.id} value={repo.id}>{repo.fullName}</option>
                ))}
              </select>
              {selectedRepo && (
                <p className="text-xs text-text-secondary">
                  Default branch: <span className="text-text-primary">{selectedRepo.defaultBranch}</span>
                  {selectedRepo.lastSeenAt ? ` • Last activity: ${new Date(selectedRepo.lastSeenAt).toLocaleString()}` : ''}
                </p>
              )}
            </div>
          ) : (
            <Input
              label="Repository (owner/repo)"
              placeholder="puneethyerninti/devpilot"
              value={repoInput}
              onChange={(event) => setRepoInput(event.target.value)}
              disabled={isCreatingJob}
              fullWidth
            />
          )}

          <Input
            label="Pull request number"
            type="number"
            min={1}
            placeholder="1"
            value={prNumberInput}
            onChange={(event) => setPrNumberInput(event.target.value)}
            disabled={isCreatingJob}
            fullWidth
          />

          <Input
            label="Head SHA (commit hash)"
            placeholder="a1b2c3d"
            value={headShaInput}
            onChange={(event) => setHeadShaInput(event.target.value)}
            helperText="Use the PR head commit SHA (min 6 chars)."
            disabled={isCreatingJob}
            fullWidth
          />

          <Input
            label="GitHub installation ID (optional)"
            placeholder="12345678"
            value={installationIdInput}
            onChange={(event) => setInstallationIdInput(event.target.value)}
            helperText="If empty, backend uses the latest known installation for this repository."
            disabled={isCreatingJob}
            fullWidth
          />

          {createJobError && (
            <p className="text-sm text-danger">{createJobError}</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default JobsPage;

