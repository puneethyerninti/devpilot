# DevPilot
  
Small Express + BullMQ service that listens for GitHub pull request webhooks, enqueues them, and lets a worker summarize across downstream systems.

## Prerequisites

1. Copy `.env.example` to `.env` and set `WEBHOOK_SECRET`, `GITHUB_APP_ID`, `GITHUB_PRIVATE_KEY_PATH`, and Redis/Mongo/Qdrant URLs if needed.
2. Make sure Docker Desktop (or compatible) is running for local dependency containers.

## Common commands

```bash
docker compose up -d     # boot Redis, Mongo, Qdrant, app/worker containers
npm install              # install dependencies
npm run dev              # dev server with ts-node-dev + hot reload
npm run build            # compile TypeScript once before running the worker locally
npm run worker           # execute the compiled BullMQ worker
```

> BullMQ currently stays on `^3.0.0`. Pin to an exact version in `package.json` if newer releases introduce breaking changes for your stack.

GitHub App authentication now requires:

- `GITHUB_APP_ID` – numeric ID from your GitHub App settings.
- `GITHUB_PRIVATE_KEY_PATH` – filesystem path to the PEM key downloaded from GitHub (mounted inside Docker if needed).

## Docker

- The single `Dockerfile` builds the TypeScript project and exposes `ROLE` to switch between services.
- `docker-compose.yml` defines:
  - `app` (Express webhook API) with an HTTP healthcheck on `/`.
  - `worker` (BullMQ worker) using the same image via `ROLE=worker`.
  - Redis, MongoDB, and Qdrant dependencies with persisted volumes.

Bring the full stack up with:

```bash
docker compose up --build -d
```

## Testing webhooks manually

Use any JSON payload and sign it with your webhook secret. Example:

```bash
payload='{"action":"opened","pull_request":{"number":1,"title":"demo","head":{"sha":"abc123"}},"repository":{"full_name":"owner/repo"}}'
secret="dev-secret"
signature=$(printf "%s" "$payload" | openssl dgst -sha256 -hmac "$secret" | awk '{print $2}')

curl -X POST http://localhost:4000/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: pull_request" \
  -H "X-Hub-Signature-256: sha256=$signature" \
  -d "$payload"
```

The server logs whenever an invalid signature arrives and returns `401`.

## Scripts & tests

- `npm run dev` – Express server in watch mode.
- `npm run worker` – Executes `dist/worker.js` (run `npm run build` after TypeScript changes).
- `npm run start` – Production server from `dist/` (used by Docker `ROLE!=worker`).
- `npm run build` – TypeScript compile step.
- `npm test` – Placeholder sanity check (`noop tests`).

## Notes

- Set `ROLE=worker` in any environment (Docker, PM2, systemd, etc.) to start the BullMQ worker via `npm run worker`; omit or change the value to run the server.
- Webhook validation prefers `x-hub-signature-256` and falls back to `x-hub-signature` (sha1) if necessary.
