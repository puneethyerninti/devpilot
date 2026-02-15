// API-backed job detail page with premium UI
import { useParams } from "react-router-dom";
import MarkdownRenderer from "../components/MarkdownRenderer";
import '../components/ui/ui-delays.css';
import StatusBadge from "../components/StatusBadge";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { LogStream } from "../components/LogStream";
import { useJobQuery, useMeQuery, useRetryJob, useRunAi } from "../lib/api";
import StatCard from "../components/ui/StatCard";
import AnimatedStatCard from "../components/ui/AnimatedStatCard";
import Timeline from "../components/ui/Timeline";
import CodeBlock from "../components/ui/CodeBlock";
import Tabs from "../components/ui/Tabs";
import { CircularProgress } from "../components/ui/ProgressBar";
import Avatar from "../components/ui/Avatar";
import Tooltip from "../components/ui/Tooltip";
import Badge from "../components/ui/Badge";
import { useSocket } from "../hooks/useSocket";

export const JobDetail = () => {
  const { id } = useParams();
  const { data, isLoading } = useJobQuery(id ?? "");
  const { mutate: rerunAi, isPending: isRerunning } = useRunAi();
  const { mutate: retryJob, isPending: isRetrying } = useRetryJob();
  const { data: me } = useMeQuery();
  useSocket(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-text-secondary">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <svg className="w-16 h-16 text-text-tertiary mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 3v3m6.364-.636l-2.121 2.121M21 12h-3M18.364 18.364l-2.121-2.121M12 21v-3m-6.364.364l2.121-2.121M3 12h3m2.636 6.364l2.121-2.121" />
          </svg>
          <p className="text-xl font-semibold text-text-primary">Job not found</p>
          <p className="text-text-secondary">The requested job could not be found.</p>
        </div>
      </div>
    );
  }

  const canonicalStatus = (data.uiStatus ?? data.status) as string;
  const statusLabel = canonicalStatus === "done" ? "reviewed" : canonicalStatus;
  const canRunAi = me?.role === "operator" || me?.role === "admin";

  // Timeline data
  const timelineItems = [
    {
      id: '1',
      title: 'Job Created',
      timestamp: new Date(data.createdAt).toLocaleString(),
      status: 'success' as const,
      description: `Triggered by ${data.triggeredBy ?? 'Unknown'}`,
    },
    ...(data.status === 'processing' ? [{
      id: '2',
      title: 'Processing',
      timestamp: 'Now',
      status: 'active' as const,
      description: 'AI review in progress',
    }] : []),
    ...(data.status === 'done' ? [{
      id: '3',
      title: 'Completed',
      timestamp: new Date(data.updatedAt).toLocaleString(),
      status: 'success' as const,
      description: 'Review completed successfully',
    }] : []),
    ...(data.status === 'failed' ? [{
      id: '4',
      title: 'Failed',
      timestamp: new Date(data.updatedAt).toLocaleString(),
      status: 'error' as const,
      description: 'Job execution failed',
    }] : []),
  ];

  const riskScore = typeof data.riskScore === "number" ? data.riskScore : 0;
  const riskPercentage = riskScore * 10; // Convert 0-10 scale to 0-100

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl glass-strong border border-white/20 p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary blur-3xl animate-float" />
          <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-purple-500 blur-3xl animate-float delay-1000" />
        </div>
        
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <Badge variant="default" className="text-xs">
                Job #{data.id}
              </Badge>
              <StatusBadge status={data.status} />
            </div>
            <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
              {data.repoFullName}
              <Tooltip content="GitHub Repository" position="right">
                <svg className="w-6 h-6 text-text-tertiary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </Tooltip>
            </h1>
            <p className="text-sm text-text-secondary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Updated {new Date(data.updatedAt).toLocaleString()}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {canRunAi && (
              <Button 
                size="md" 
                variant="primary" 
                disabled={!id || isRerunning} 
                onClick={() => id && rerunAi(id)}
                className="glass-strong shadow-lg"
              >
                {isRerunning ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Re-running...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Re-run AI
                  </>
                )}
              </Button>
            )}
            {canRunAi && (canonicalStatus === "failed" || data.status === "failed") && (
              <Button
                size="md"
                variant="secondary"
                disabled={!id || isRetrying}
                onClick={() => id && retryJob(id)}
              >
                {isRetrying ? "Retrying..." : "Retry Failed Job"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatedStatCard
          title="Status"
          value={statusLabel}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant="glass"
          color="blue"
        />
        
        <AnimatedStatCard
          title="Risk Score"
          value={riskScore.toFixed(2)}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          variant="glass"
          color={riskScore > 7 ? 'danger' : riskScore > 4 ? 'warning' : 'success'}
          subtitle={riskScore > 7 ? 'High Risk' : riskScore > 4 ? 'Medium Risk' : 'Low Risk'}
        />
        
        <AnimatedStatCard
          title="Tokens"
          value={typeof data.tokenCount === "number" ? data.tokenCount : 0}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h8m-8 4h6" />
            </svg>
          }
          variant="glass"
          color="primary"
          subtitle="OpenAI tokens"
        />

        <AnimatedStatCard
          title="Estimated Cost"
          value={typeof data.costCents === "number" ? `$${(data.costCents / 100).toFixed(2)}` : "$0.00"}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.12-4 2.5S9.79 13 12 13s4 1.12 4 2.5S14.21 18 12 18m0-10v10" />
            </svg>
          }
          variant="glass"
          color="success"
          subtitle="Usage cost"
        />

        <AnimatedStatCard
          title="Pull Request"
          value={`#${data.prNumber}`}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          }
          variant="glass"
          color="purple"
          subtitle={`${data.headSha.slice(0, 8)}...`}
        />
        
        <AnimatedStatCard
          title="Triggered By"
          value={data.triggeredBy ?? "Unknown"}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          variant="glass"
          color="primary"
        />
      </div>

      {/* Main Content with Tabs */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Tabs
            tabs={[
              { id: 'review', label: 'AI Review', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )},
              { id: 'logs', label: 'Logs', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )},
              { id: 'timeline', label: 'Timeline', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )},
            ]}
            variant="pills"
          >
            {(activeTab) => (
              <Card variant="elevated" className="glass-card">
                {activeTab === 'review' && (
                  <div className="space-y-6">
                    {data.summary && (
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-3">Summary</h3>
                        <p className="text-sm text-text-secondary leading-relaxed">{data.summary}</p>
                      </div>
                    )}

                    {data.aiReviewMd && (
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-3">AI Analysis</h3>
                        <MarkdownRenderer content={data.aiReviewMd} />
                      </div>
                    )}

                    {data.inlineSuggestions && data.inlineSuggestions.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-3">Inline Suggestions</h3>
                        <div className="space-y-3">
                          {data.inlineSuggestions.map((s, idx) => (
                            <div key={`${s.file}-${s.startLine}-${idx}`} className="glass-card rounded-lg p-4 hover:glass-strong transition-all">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1">
                                  <p className="font-medium text-text-primary text-sm">{s.file}</p>
                                  <p className="text-xs text-text-tertiary">Lines {s.startLine}-{s.endLine}</p>
                                </div>
                                <Badge variant={s.severity === 'high' ? 'danger' : s.severity === 'medium' ? 'warning' : 'default'}>
                                  {s.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-text-secondary">{s.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'logs' && (
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Worker Output</h3>
                    <LogStream logs={data.logs ?? []} />
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Job Timeline</h3>
                    <Timeline items={timelineItems} />
                  </div>
                )}
              </Card>
            )}
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Risk Score Circular Progress */}
          <Card variant="elevated" className="glass-card">
            <div className="text-center space-y-4">
              <h3 className="text-sm font-semibold text-text-primary">Risk Analysis</h3>
              <CircularProgress
                value={riskPercentage}
                size={140}
                strokeWidth={10}
                variant={riskScore > 7 ? 'danger' : riskScore > 4 ? 'warning' : 'success'}
                className="mx-auto"
              />
              <p className="text-xs text-text-secondary">
                {riskScore > 7 ? 'Requires immediate attention' : riskScore > 4 ? 'Review recommended' : 'Looks good'}
              </p>
            </div>
          </Card>

          {/* Worker Info */}
          <Card variant="elevated" className="glass-card">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Assigned Worker</h3>
            <div className="flex items-center gap-3">
              <Avatar
                fallback={data.worker?.name ?? data.worker?.id ?? "?"}
                size="lg"
                showStatus
                status="online"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">
                  {data.worker?.name ?? data.worker?.id ?? "Unassigned"}
                </p>
                <p className="text-xs text-text-tertiary">Job #{data.id}</p>
              </div>
            </div>
          </Card>

          {/* Files */}
          <Card variant="elevated" className="glass-card">
            <h3 className="text-sm font-semibold text-text-primary mb-4">
              Files ({data.files?.length ?? 0})
            </h3>
            {data.files && data.files.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
                {data.files.map((file) => (
                  <div
                    key={file.id}
                    className="group glass rounded-lg p-3 hover:glass-strong transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                          {file.path}
                        </p>
                        {file.comments?.lines && file.comments.lines.length > 0 && (
                          <p className="text-xs text-text-tertiary mt-0.5">
                            Lines: {file.comments.lines.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-tertiary text-center py-4">No files recorded</p>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};

export default JobDetail;

