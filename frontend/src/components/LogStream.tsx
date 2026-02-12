// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import * as ScrollArea from "@radix-ui/react-scroll-area";

export type LogStreamProps = {
  logs: Array<{ id: string; message: string; createdAt: string }>;
};

export const LogStream = ({ logs }: LogStreamProps) => {
  return (
    <ScrollArea.Root className="h-64 w-full overflow-hidden rounded-lg border border-slate-200">
      <ScrollArea.Viewport className="h-full w-full bg-slate-50 px-4 py-3 font-mono text-xs">
        {logs.length === 0 && <p className="text-slate-500">Waiting for worker output...</p>}
        {logs.map((log) => (
          <p key={log.id} className="text-slate-700">
            <span className="text-slate-400 mr-2">{new Date(log.createdAt).toLocaleTimeString()}</span>
            {log.message}
          </p>
        ))}
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical" className="flex select-none touch-none p-0.5">
        <ScrollArea.Thumb className="relative flex-1 rounded-full bg-slate-300" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
};

