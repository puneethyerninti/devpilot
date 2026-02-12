# DevPilot Backend Skeleton

Node + TypeScript + BullMQ boilerplate for local job processing.

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment template and update secrets:
   ```bash
   cp .env.example .env
   ```
3. Start Redis locally:
   ```bash
   docker compose up -d
   ```
4. Run the dev server + worker:
   ```bash
   npm run dev
   ```

The API exposes:

- `POST /enqueue` – queues a sample job `{ type: 'test', payload: { msg: 'hello' } }` and returns the job id.
- `GET /health` – simple heartbeat endpoint.

Build for production with `npm run build` then start with `npm start`.

## Webhook smoke test

Run the local GitHub webhook smoke to ensure real PR payloads are stored instead of mocks:

```powershell
pwsh -File ../scripts/smoke-webhook.ps1 -RepoFullName "owner/repo" -PrNumber 1 -HeadSha "<commit-sha>" -InstallationId <installation-id> -Secret $env:GITHUB_WEBHOOK_SECRET
```

The response should include `jobId` and `/api/jobs/{id}` will show the real `repoFullName`, `prNumber`, `headSha`, and action logs.
