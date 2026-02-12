// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { useState } from "react";
import { useJobsQuery, useRetryJob, useMeQuery } from "@/lib/api";
import { JobRow } from "@/components/JobRow";

export const JobsList = () => {
  const [status, setStatus] = useState<string | undefined>();
  const { data: jobs, isLoading } = useJobsQuery({ status });
  const retryMutation = useRetryJob();
  const { data: me } = useMeQuery();
  const canRetry = me?.role === "operator" || me?.role === "admin";

  const handleRetry = (jobId: number) => {
    retryMutation.mutate(jobId);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Job Queue</h2>
        <select
          aria-label="Filter jobs by status"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={status ?? ""}
          onChange={(event) => setStatus(event.target.value || undefined)}
        >
          <option value="">All statuses</option>
          <option value="queued">Queued</option>
          <option value="processing">Processing</option>
          <option value="done">Done</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      {isLoading && <p>Loading jobsâ€¦</p>}
      <div className="space-y-3">
        {jobs?.map((job) => (
          <JobRow key={job.id} job={job} onRetry={canRetry ? handleRetry : undefined} />
        ))}
      </div>
    </section>
  );
};

