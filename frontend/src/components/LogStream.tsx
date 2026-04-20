// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import * as ScrollArea from "@radix-ui/react-scroll-area";

export type LogStreamProps = {
  logs: Array<{ id: string; message: string; createdAt: string }>;
};

export const LogStream = ({ logs }: LogStreamProps) => {
  return (
    <ScrollArea.Root className="h-72 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70">
      <ScrollArea.Viewport className="h-full w-full px-4 py-3 font-mono text-xs">
        {logs.length === 0 && <p className="text-slate-500">Waiting for worker output...</p>}
        {logs.map((log) => (
          <p key={log.id} className="text-slate-200 leading-5">
            <span className="text-cyan-400 mr-2">{new Date(log.createdAt).toLocaleTimeString()}</span>
            {log.message}
          </p>
        ))}
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical" className="flex select-none touch-none p-0.5">
        <ScrollArea.Thumb className="relative flex-1 rounded-full bg-slate-700" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
};

