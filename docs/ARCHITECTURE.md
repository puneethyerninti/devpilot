# DevPilot Architecture

## Goal
DevPilot automates pull request review workflows and exposes realtime operational visibility.

## Services
- Backend (`backend`): HTTP API, webhook ingest, auth, queue producer, metrics, Socket.IO.
- Worker (`worker`): BullMQ consumer that fetches PR diffs, runs AI review, persists results, and posts GitHub comments.
- Frontend (`frontend`): Realtime dashboard for jobs and worker health.
- Data services: Postgres (state), Redis (queue/pubsub).

## Runtime Flow
1. GitHub sends `pull_request` webhook to backend.
2. Backend validates signature and deduplicates by delivery id.
3. Backend enqueues job into BullMQ and records `PRJob` + `ActionLog`.
4. Worker consumes job, fetches PR files/hunks via GitHub App credentials.
5. Worker streams AI output and updates progress/log events.
6. Backend/worker publish Socket.IO events for UI updates.
7. Final findings are stored in Postgres; optional summary/inline comments are posted to GitHub.

## Key Data Entities
- `PRJob`: job lifecycle, summary, markdown review, risk, token/cost metadata.
- `PRFile`: per-file metadata and comment line hints.
- `ActionLog`: timeline and operational events for jobs/workers.
- `AiUsage`: model, token and cost accounting.
- `WebhookEvent`: dedupe and processing trace for webhook deliveries.

## Reliability Controls
- BullMQ retries: exponential backoff, 3 attempts.
- DLQ tooling: failed queue jobs can be inspected and retried via API.
- Health endpoint: checks DB and Redis reachability.
- Metrics endpoint: Prometheus-compatible counters/histograms.

## Security Controls
- GitHub webhook signature verification.
- OAuth-based login with role-gated endpoints.
- API rate limiting and secure headers (`helmet`).
- Secret-safe logging patterns.

## Local Startup
1. `pnpm install`
2. `cp backend/.env.example backend/.env`
3. `pnpm preflight`
4. `docker compose up -d postgres redis`
5. `pnpm prisma:setup`
6. `pnpm dev:all`
