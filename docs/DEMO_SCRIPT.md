# DevPilot Demo Script (10-12 min)

## 1) Setup (1 min)
- Show repository structure (backend, worker, frontend).
- Mention objective: automated PR review with realtime ops visibility.

## 2) Boot (1 min)
1. `pnpm preflight`
2. `docker compose up -d postgres redis`
3. `pnpm prisma:setup`
4. `pnpm dev:all`

## 3) Product Walkthrough (3 min)
- Open frontend dashboard.
- Explain Jobs page: queue state, status badges, logs.
- Explain Workers page: heartbeat, queue depth, filtering.

## 4) Trigger and Observe Flow (3 min)
- Trigger a manual job from UI/API.
- Show realtime transition: queued -> processing -> done/failed.
- Open Job Detail and point to markdown review + findings + timeline.

## 5) Reliability Story (2 min)
- Show `/health` and `/metrics` endpoints.
- Show DLQ ops endpoints (`/api/jobs/dlq`, retry endpoint).
- Explain retries/backoff and worker heartbeat model.

## 6) Engineering Story (1-2 min)
- Monorepo with backend/worker/frontend separation.
- Queue-based architecture and websocket updates.
- CI with lint/test/build/coverage/e2e and staging deploy hook.

## Resume Bullet Ideas
- Built an AI PR review platform using Express, BullMQ, Redis, Prisma, and React with realtime websocket telemetry.
- Added operational reliability features including DLQ inspection/retry APIs, health/metrics endpoints, and coverage-gated CI.
- Reduced local onboarding friction with preflight validation and deterministic one-command environment setup.
