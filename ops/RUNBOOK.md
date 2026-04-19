# DevPilot Operations Runbook

## Quick Checks
- API health: `GET /health`
- Metrics: `GET /metrics`
- Jobs list: `GET /api/jobs`
- Worker state: `GET /api/workers`

## Local Recovery Steps
1. Verify Docker daemon is running.
2. Start core infra: `docker compose up -d postgres redis`.
3. Run migrations/seed: `pnpm prisma:setup`.
4. Start apps: `pnpm dev:all`.

## Incident: Jobs Stuck in Queued
1. Check worker process logs.
2. Confirm Redis reachable from backend and worker.
3. Check `/api/workers` heartbeat timestamps.
4. Retry failed jobs from DLQ:
   - List failed queue jobs: `GET /api/jobs/dlq`
   - Retry one: `POST /api/jobs/dlq/:queueJobId/retry`

## Incident: Webhook Not Creating Jobs
1. Verify GitHub webhook secret matches `GITHUB_WEBHOOK_SECRET`.
2. Confirm webhook event is `pull_request` and action is supported.
3. Check duplicate delivery ids in logs (`WebhookEvent`).
4. Validate GitHub App credentials (`GITHUB_APP_ID` + private key var).

## Incident: OAuth Login Fails
1. Verify backend URL and frontend URL are correct.
2. Ensure OAuth callback URL exactly matches backend callback endpoint.
3. Validate `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.

## Incident: AI Review Failures
1. Verify `OPENAI_API_KEY` exists and `ENABLE_OPENAI=true`.
2. Check provider response and token/cost logs.
3. Retry affected job from UI or `/api/jobs/:id/run-ai`.

## Deploy Notes
- CI staging deploy trigger uses secret `RENDER_DEPLOY_HOOK_STAGING`.
- If secret is missing, CI build still passes and deploy step is skipped.

## Useful Commands
- Full test: `pnpm test`
- Build all: `pnpm build`
- Lint all: `pnpm lint`
- Frontend e2e: `pnpm --dir frontend test:e2e`
