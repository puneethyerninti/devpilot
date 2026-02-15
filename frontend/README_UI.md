# DevPilot Frontend UI

API-backed dashboard for live PR review jobs, worker health, and streaming logs.

## Quick verification
1. Run dev server: `pnpm --dir frontend dev` then open http://localhost:5173/jobs.
2. Check the Shell sidebar/topbar renders.
3. Jobs page shows API jobs; click a row to reach `/jobs/:id`.
4. Toggle theme button; reload to confirm persistence.
5. On Job Detail, AI review markdown renders with code block copy; logs panel toggles and copy works.
6. Workers page lists live worker heartbeats/metrics; restart/log action buttons are currently read-only.
7. If markdown libs are missing, install: `pnpm --dir frontend add react-markdown rehype-highlight`.

## Data wiring
- Jobs list/detail use TanStack Query against `/api/jobs` and `/api/jobs/:id`.
- Worker list uses `/api/workers` and updates via socket `worker.status` events.
- Job detail logs/progress update through socket events (`job.log`, `job.progress`, `job.updated`, `job.completed`).
- `MarkdownRenderer` renders AI markdown returned by the backend; keep sanitization in mind if custom HTML is ever enabled.

## Notes
- Tailwind config moved to `tailwind.config.ts` and global styles live in `src/styles/globals.css`.
- System font stack, neutral palette, and light/dark themes are handled via `ThemeProvider` and CSS variables.
- For screenshots: Jobs â†’ click any row, toggle logs in Job Detail, and switch themes from the topbar.

