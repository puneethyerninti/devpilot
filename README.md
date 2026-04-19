// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
# DevPilot Phase 3 MVP Scaffold

DevPilot Phase 3 delivers an end-to-end dashboard for monitoring AI pull-request reviews. It ships a real-time job feed, worker status view, and a retry API backed by BullMQ, Prisma, Socket.IO, and Vite React.

## Architecture Snapshot
- **Backend** (`/backend`): Express + Socket.IO API, BullMQ queues, GitHub OAuth skeleton, Prisma ORM, Redis adapter, Jest tests, and seed tooling.
- **Worker** (`/worker`): Dedicated BullMQ worker process emitting lifecycle events.
- **Frontend** (`/frontend`): Vite + React + Tailwind + shadcn/ui with TanStack Query and Socket.IO client hooks.
- **Infra** (`/docker-compose.yml`, `/ci/.github/workflows/ci.yml`, optional `/infra`): Postgres, Redis, GitHub Actions CI pipeline, and sample env manifests.
- **Demo** (`/demo`): Legacy standalone webhook/worker sample retained for reference; production code lives under `/backend` and `/worker`.

## Portfolio Docs
- `docs/ARCHITECTURE.md` - technical architecture and service boundaries
- `ops/RUNBOOK.md` - production operations and incident runbook
- `docs/DEMO_SCRIPT.md` - end-to-end demo narrative for interviews

## Quickstart
1. **Clone & install**
   ```bash
   pnpm install
   ```
2. **Configure backend env**
   ```bash
   cp backend/.env.example backend/.env
   ```
3. **Run preflight checks (Phase 1)**
   ```bash
   pnpm preflight
   ```
4. **Start infrastructure services**
   ```bash
   docker compose up -d postgres redis
   ```
5. **Apply migrations and seed data**
   ```bash
   pnpm prisma:setup
   ```
6. **Run all services locally**
   ```bash
   pnpm dev:all
   ```
   This runs backend, frontend, and worker concurrently.

7. **Start services manually (optional)**
   ```bash
   cd backend && pnpm dev
   cd frontend && pnpm dev
   cd worker && pnpm dev
   ```

8. **Quick smoke (Windows PowerShell)**
   ```powershell
   $env:API_TOKEN="<signed_jwt_token>"
   ./scripts/smoke-phase1.ps1
   ```

9. **Quick smoke (bash)**
   ```bash
   API_TOKEN=<signed_jwt_token> ./scripts/smoke-phase1.sh
   ```

## Local dev modes
- **Real OpenAI mode (required)**
   - Set `AI_MODE=live`, `ENABLE_OPENAI=true`, and `OPENAI_API_KEY`.
   - `retry`, `run-ai`, and webhook-triggered jobs now force live processing.
   - Optional: set `OPENAI_COST_CENTS_PER_1K_TOKENS` to track estimated cost.

## Manual Setup Checklist
- **GitHub OAuth App**
  - Homepage: `http://localhost:5173`
  - Callback: `http://localhost:4000/auth/github/callback`
  - Scopes: `read:user`, `user:email`, `repo` (optional for private repos)
  - Copy `Client ID/Secret` into `backend/.env` as `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.
- **Postgres & Redis**: `docker compose up -d postgres redis` provisions both. Expose externally only behind VPN/tunnel.
- **JWT secret**: Generate a long random string (`openssl rand -hex 32`) for `SESSION_SECRET`.
- **Sentry**: Optional `SENTRY_DSN`; backend/worker auto-initialize when present.
- **OpenAI**: set `OPENAI_API_KEY` and keep `AI_MODE=live`.

## Environment Variables (backend/.env)
```
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://devpilot:devpilot@localhost:5432/devpilotdb
REDIS_URL=redis://localhost:6379
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=
GITHUB_APP_ID=
GITHUB_PRIVATE_KEY_FILE=
GITHUB_PRIVATE_KEY_BASE64=
GITHUB_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
JWT_SECRET=
SESSION_SECRET=
JWT_ISSUER=devpilot
OPENAI_API_KEY=
AI_MODE=live
SENTRY_DSN=
QUEUE_NAME=pr-jobs
SOCKET_REDIS_HOST=localhost
SOCKET_REDIS_PORT=6379
AI_MODEL=gpt-4.1-mini
```

### Webhook consolidation - how to run locally
1. Set `GITHUB_WEBHOOK_SECRET`, `GITHUB_APP_ID`, and `GITHUB_PRIVATE_KEY` in `backend/.env` (private key must preserve `\n`).
2. Run deps: `docker compose up -d postgres redis` (or use your own Postgres/Redis).
3. Apply migrations: `cd backend && pnpm prisma migrate dev` (or `--create-only` if offline) and `pnpm prisma generate`.
4. Start backend + worker: `pnpm --filter @devpilot/backend dev` and `pnpm --filter @devpilot/worker dev`.
5. Send a signed webhook: POST to `http://localhost:4000/api/webhooks/github` with `X-GitHub-Delivery`, `X-GitHub-Event: pull_request`, `X-Hub-Signature-256`, and a PR payload. Successful runs enqueue a job and emit Socket.IO events.

## Running Tests
- Backend unit tests: `cd backend && pnpm test`
- Worker smoke test: `cd worker && pnpm test`
- Frontend unit + lint: `cd frontend && pnpm test && pnpm lint`
- E2E (Playwright): `cd frontend && pnpm exec playwright test`

## API Overview
All REST responses follow `{ ok: boolean, data?: any, error?: string }`.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/jobs?status=&repo=&page=&perPage=` | Paginated filterable jobs |
| GET | `/api/jobs/dlq` | List failed queue jobs (operator+) |
| POST | `/api/jobs/dlq/:queueJobId/retry` | Retry a failed queue job (operator+) |
| GET | `/api/jobs/:id` | Job detail + files + logs |
| POST | `/api/jobs/:id/retry` | Retry a job (operator+ roles) |
| POST | `/api/jobs/run` | Run new analysis (admin only) |
| GET | `/api/workers` | Worker heartbeat list |
| GET | `/api/users/me` | Authenticated user info |
| GET | `/api/repos` | Enabled repos |

### Example curl commands
```bash
AUTH="Authorization: Bearer ${API_TOKEN}"
curl -H "$AUTH" http://localhost:4000/api/jobs
curl -H "$AUTH" http://localhost:4000/api/jobs/1
curl -X POST -H "$AUTH" http://localhost:4000/api/jobs/1/retry
curl -X POST http://localhost:4000/api/jobs/run \
  -H "Content-Type: application/json" \
   -H "$AUTH" \
   -d '{"repo":"devpilot/repo","prNumber":42,"headSha":"abc123","installationId":12345678}'
```

### PowerShell API commands
Use `curl.exe` (not PowerShell `curl` alias) or `Invoke-RestMethod`.

```powershell
$TOKEN = "<YOUR_BEARER_TOKEN>"
$AUTH = "Bearer $TOKEN"

curl.exe -H "Authorization: $AUTH" http://localhost:4000/api/jobs

Invoke-RestMethod -Method Post -Uri "http://localhost:4000/api/jobs/run" -Headers @{ Authorization = $AUTH } -ContentType "application/json" -Body '{"repo":"owner/repo","prNumber":42,"headSha":"abc123","installationId":12345678}'
```

## Socket.IO Events
Messages shape: `{ type: string; payload: unknown }`.
- `job.created`
- `job.updated`
- `job.log`
- `job.completed`
- `worker.status`

The frontend subscribes globally for list updates and per-job channels (`job:{id}`) for streaming logs.

## Project Scripts (`package.json` root)
- `pnpm preflight` – validates local prerequisites (Node/pnpm/env/docker)
- `pnpm dev:setup` – runs preflight, starts Postgres/Redis, applies migrations + seed
- `pnpm dev:all` – backend + frontend + worker via `concurrently`
- `pnpm prisma:setup` – apply migrations + seed backend DB
- `pnpm lint`, `pnpm test`, `pnpm build` – delegate to packages

## CI/CD
`/ci/.github/workflows/ci.yml` builds Docker images, runs lint/test/build with coverage, executes Playwright tests, and can trigger Render staging deploy on `main`.

To enable staging deploy, set GitHub secret:
- `RENDER_DEPLOY_HOOK_STAGING` - Render deploy hook URL for the staging service

## Troubleshooting
- Redis adapter issues → ensure `redis-cli ping` responds `PONG`.
- Prisma migration errors → drop DB `docker exec devpilot-postgres psql -c 'DROP DATABASE devpilot;'` and rerun migrate.
- OAuth callback mismatch → double-check GitHub app URLs.

Happy shipping!
