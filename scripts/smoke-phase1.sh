#!/usr/bin/env bash
set -euo pipefail

API_URL=${API_URL:-http://localhost:4000}
DEMO_TOKEN=${DEMO_TOKEN:-demo-token}
AUTH_HEADER="Authorization: Bearer ${DEMO_TOKEN}"

fail() { echo "[smoke] $1" >&2; exit 1; }

curl -sf -H "${AUTH_HEADER}" "${API_URL}/health" >/dev/null || fail "health failed"

JOBS_RESPONSE=$(curl -sf -H "${AUTH_HEADER}" "${API_URL}/api/jobs") || fail "GET /api/jobs failed"
JOB_ID=$(echo "$JOBS_RESPONSE" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); const first=d.data?.jobs?.[0]?.id; if(first){console.log(first);}else process.exit(1);") || fail "no job id"

curl -sf -H "${AUTH_HEADER}" "${API_URL}/api/jobs/${JOB_ID}" >/dev/null || fail "GET /api/jobs/:id failed"
curl -sf -H "${AUTH_HEADER}" "${API_URL}/api/workers" >/dev/null || fail "GET /api/workers failed"

echo "[smoke] phase1 ok"
