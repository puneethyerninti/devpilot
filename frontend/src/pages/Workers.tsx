// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { useWorkersQuery } from "@/lib/api";

type WorkerStatus = { workerId: string; status: string; lastHeartbeat: string; currentJobId: number | null; queueDepth: number | null };

export const Workers = () => {
  const { data, isLoading } = useWorkersQuery();
  const workers: WorkerStatus[] = data ?? [];
  if (isLoading) return <p>Loading worker status…</p>;
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Workers</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {workers.map((worker) => (
          <div key={worker.workerId} className="rounded-xl border border-slate-200 bg-white/80 p-4">
            <p className="text-sm font-semibold text-slate-700">{worker.workerId}</p>
            <p className="text-xs text-slate-500">Last heartbeat: {new Date(worker.lastHeartbeat).toLocaleTimeString()}</p>
            <p className="mt-2 text-slate-700">State: {worker.status}</p>
            {worker.currentJobId && <p className="text-xs text-slate-500">Current job: {worker.currentJobId}</p>}
            {typeof worker.queueDepth === "number" && <p className="text-xs text-slate-500">Queue depth: {worker.queueDepth}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};

