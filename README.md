# DevPilot

AI-powered pull request reviewer with real-time job tracking, worker telemetry, and GitHub integration.

DevPilot ingests PR events (or manual runs), fetches changed hunks from GitHub, runs AI review, stores findings in Postgres, pushes live updates through Socket.IO, and can post summary + inline comments back to the PR.

## Table of Contents

- [What It Does](#what-it-does)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Quick Start (Local)](#quick-start-local)
- [Environment Variables](#environment-variables)
- [GitHub Setup](#github-setup)
- [Runbook](#runbook)
- [API Reference](#api-reference)
- [Realtime Events](#realtime-events)
- [Data Model](#data-model)
- [Testing](#testing)
- [Docker](#docker)
- [CI](#ci)
- [Troubleshooting](#troubleshooting)

## What It Does

- Accepts GitHub `pull_request` webhooks (`opened`, `synchronize`, `reopened`).
- Queues jobs with BullMQ and processes them in a dedicated worker.
- Fetches PR files/hunks with GitHub App installation auth.
- Runs AI review (live OpenAI), streams progress/logs, stores results.
- Exposes jobs, workers, repos, and user profile APIs.
- Powers a React dashboard with live Jobs and Workers pages.
- Supports role-gated actions (`viewer`, `operator`, `admin`) like retry and run-ai.

## Architecture

```text
GitHub PR Webhook / Manual Run
               |
               v
    backend (Express + Prisma + BullMQ enqueue)
               |
               v
         Redis queue (pr-jobs)
               |
               v
    worker (BullMQ processor + OpenAI + GitHub comments)
               |
               +--> Postgres (jobs, logs, files, usage)
               +--> Socket.IO events (job/worker realtime)
               +--> GitHub PR comments/review summary
```

## Tech Stack

- **Backend:** Node 20, TypeScript, Express, Prisma, BullMQ, Socket.IO, Zod, JWT
- **Worker:** TypeScript worker entry that reuses backend worker pipeline
- **Frontend:** Vite, React 18, TypeScript, Tailwind, TanStack Query, Socket.IO client
- **Infra:** Postgres, Redis, Docker Compose
- **Observability/Safety:** Sentry (optional), Prometheus metrics endpoint, API rate limiting

## Repository Layout

```text
.
├─ backend/      # API server, queue producer, worker implementation, Prisma schema/migrations
├─ worker/       # thin process wrapper that starts backend worker module
├─ frontend/     # dashboard UI (jobs, job detail, workers)
├─ scripts/      # smoke test scripts (PowerShell + bash)
├─ ci/           # GitHub Actions workflow
├─ docker-compose.yml
└─ README.md
```

## Prerequisites

- Node.js **20+**
- pnpm **9.x**
- Docker + Docker Compose
- GitHub OAuth App credentials
- GitHub App installation credentials (for live PR diff/comment flow)
- OpenAI API key (for live AI mode)

## Quick Start (Local)

### 1) Install dependencies

```bash
pnpm install
```

### 2) Configure backend env

```bash
cp backend/.env.example backend/.env
```

Fill required values in `backend/.env` (see [Environment Variables](#environment-variables)).

### 3) Start data services

```bash
docker-compose up -d postgres redis
```

### 4) Apply DB migration + seed

```bash
pnpm --dir backend prisma migrate deploy
pnpm --dir backend prisma db seed
```

### 5) Run app

```bash
pnpm dev:all
```

This starts:
- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`
- Worker process: from `worker/src/index.ts`

### 6) Sign in and verify

- Open `http://localhost:5173`
- Click **Sign in with GitHub**
- Visit Jobs and Workers pages

## Environment Variables

DevPilot reads config from `backend/.env`. Core keys:

```dotenv
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173

DATABASE_URL=postgresql://devpilot:devpilot@localhost:5432/devpilotdb
REDIS_URL=redis://localhost:6379
QUEUE_NAME=pr-jobs

JWT_ISSUER=devpilot
JWT_SECRET=
SESSION_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=
GITHUB_APP_ID=
GITHUB_PRIVATE_KEY_FILE=
GITHUB_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
# alternatively: GITHUB_PRIVATE_KEY_BASE64=

OPENAI_API_KEY=
ENABLE_OPENAI=true
AI_MODE=live
AI_MODEL=gpt-4.1-mini

SENTRY_DSN=
SOCKET_REDIS_HOST=localhost
SOCKET_REDIS_PORT=6379
API_RATE_LIMIT_WINDOW_MS=60000
API_RATE_LIMIT_MAX=120
```

### Important config rules

- At least one of the following must be set:
   - `GITHUB_PRIVATE_KEY`
   - `GITHUB_PRIVATE_KEY_FILE`
   - `GITHUB_PRIVATE_KEY_BASE64`
- `FRONTEND_URL` must match your frontend origin for CORS and cookie auth.
- `JWT_SECRET` or `SESSION_SECRET` is required (used to sign auth/session JWT).
- For real reviews, use `AI_MODE=live`, `ENABLE_OPENAI=true`, and `OPENAI_API_KEY`.

## GitHub Setup

### OAuth App (user login)

- Homepage URL: `http://localhost:5173`
- Callback URL: `http://localhost:4000/auth/github/callback`
- Scopes requested by app: `read:user user:email repo`

### GitHub App (PR data + comments)

- Configure app + installation and set:
   - `GITHUB_APP_ID`
   - one private key variable (`GITHUB_PRIVATE_KEY*`)
   - `GITHUB_WEBHOOK_SECRET`
- For local webhook delivery, point GitHub webhook to:
   - `http://localhost:4000/api/webhooks/github`
   - (or tunnel URL if needed)

## Runbook

### Manual job run (admin)

Use dashboard **New Job** action or call:

```bash
curl -X POST http://localhost:4000/api/jobs/run \
   -H "Authorization: Bearer <API_TOKEN>" \
   -H "Content-Type: application/json" \
   -d '{"repo":"owner/repo","prNumber":42,"headSha":"abc123","installationId":123456}'
```

### Retry / run-ai (operator or admin)

```bash
curl -X POST -H "Authorization: Bearer <API_TOKEN>" http://localhost:4000/api/jobs/1/retry
curl -X POST -H "Authorization: Bearer <API_TOKEN>" http://localhost:4000/api/jobs/1/run-ai
```

### Webhook smoke test (PowerShell)

```powershell
pwsh -File ./scripts/smoke-webhook.ps1 -RepoFullName "owner/repo" -PrNumber 1 -HeadSha "<sha>" -InstallationId <id>
```

### API smoke test

PowerShell:
```powershell
$env:API_TOKEN="<signed_jwt>"
./scripts/smoke-phase1.ps1
```

bash:
```bash
API_TOKEN=<signed_jwt> ./scripts/smoke-phase1.sh
```

## API Reference

Response envelope:

```json
{ "ok": true, "data": {} }
```

Common endpoints:

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | optional | health check (DB + Redis) |
| GET | `/metrics` | optional | Prometheus metrics |
| GET | `/api/users/me` | optional | current user profile/null |
| GET | `/api/jobs` | required | list jobs (`status`, `repo`, `page`, `perPage`) |
| GET | `/api/jobs/:id` | required | job details, logs, files, timeline |
| POST | `/api/jobs/:id/retry` | operator+ | enqueue retry |
| POST | `/api/jobs/:id/run-ai` | operator+ | force live rerun |
| POST | `/api/jobs/run` | admin | enqueue manual run |
| GET | `/api/repos` | required | list repos |
| GET | `/api/workers` | operator+ | latest worker heartbeats |
| POST | `/api/webhooks/github` | signature | GitHub PR webhook ingest |

Auth routes:

- `GET /auth/github`
- `GET /auth/github/callback`
- `POST /auth/logout`

## Realtime Events

Socket.IO emits `event` messages with these types:

- `job.created`
- `job.updated`
- `job.progress`
- `job.log`
- `job.completed`
- `job.failed`
- `worker.status`

Clients can subscribe to job-specific room: `job:<id>`.

## Data Model

Prisma entities (high-level):

- `User`, `Repo`, `RepoUser`
- `PRJob` (status, summary, markdown, inline suggestions, token/cost, meta)
- `PRFile` (paths + comment line hints)
- `ActionLog` (job and worker events)
- `AiUsage` (usage/accounting)
- `WebhookEvent` (delivery id dedupe + processing status)

## Testing

From repo root:

```bash
pnpm lint
pnpm test
pnpm build
```

More targeted:

```bash
pnpm --dir backend test
pnpm --dir frontend test
pnpm --dir frontend test:e2e
pnpm --dir worker build
```

## Docker

Base services only:

```bash
docker-compose up -d postgres redis
```

Full app profile (backend/worker/frontend containers):

```bash
docker-compose --profile app up --build
```

## CI

Pipeline file: `ci/.github/workflows/ci.yml`

Main stages:

- lint + unit tests
- package builds
- Prisma migrate + seed
- optional Playwright E2E (when secrets present)
- Docker image artifact build

## Troubleshooting

- **Invalid configuration (GitHub private key):** ensure one of `GITHUB_PRIVATE_KEY`, `GITHUB_PRIVATE_KEY_FILE`, or `GITHUB_PRIVATE_KEY_BASE64` is set.
- **401 / no session in frontend:** verify `FRONTEND_URL`, OAuth callback URL, and browser cookies.
- **Webhook rejected:** confirm `X-Hub-Signature-256` uses `GITHUB_WEBHOOK_SECRET` and delivery id is unique.
- **Jobs stuck queued:** ensure worker process is running and Redis is reachable.
- **No worker cards:** worker heartbeat writes every ~15s; check `/api/workers` and worker logs.
- **No GitHub comments:** verify installation id, app permissions, and repository access.

---

If you want, I can also generate a production deployment section (Render/Railway/Fly/Kubernetes) tailored to your target platform.
