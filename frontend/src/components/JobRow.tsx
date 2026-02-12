// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";

export type JobRowProps = {
  job: {
    id: number;
    repoFullName: string;
    status: string;
    summary?: string;
    createdAt: string;
  };
  onRetry?: (jobId: number) => void;
};

export const JobRow = ({ job, onRetry }: JobRowProps) => {
  const statusLabel = job.status === "done" ? "Completed" : job.status;
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-slate-800">{job.repoFullName}</p>
        <p className="text-xs text-slate-500">Job #{job.id}</p>
        <p className="text-xs text-slate-600 mt-2">Status: {statusLabel}</p>
        {job.summary && <p className="mt-2 text-sm text-slate-700">{job.summary}</p>}
      </div>
      <div className="flex gap-3">
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={() => onRetry(job.id)}>
            Retry
          </Button>
        )}
        <Button size="sm" onClick={() => navigate(`/jobs/${job.id}`)}>
          Details
        </Button>
      </div>
    </div>
  );
};

