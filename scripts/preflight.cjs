#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const rootDir = process.cwd();
const envPath = path.join(rootDir, "backend", ".env");

const errors = [];
const warnings = [];

const runCommand = (command) => {
  try {
    const output = execSync(command, {
      stdio: ["ignore", "pipe", "pipe"],
      cwd: rootDir,
      encoding: "utf8"
    });
    return { ok: true, output: output.trim() };
  } catch (error) {
    const stderr = typeof error?.stderr === "string" ? error.stderr.trim() : "";
    const stdout = typeof error?.stdout === "string" ? error.stdout.trim() : "";
    const message = stderr || stdout || (error instanceof Error ? error.message : String(error));
    return { ok: false, output: message };
  }
};

const parseEnvFile = (content) => {
  const env = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
};

const isPopulated = (value) => typeof value === "string" && value.trim().length > 0;

const nodeVersion = process.versions.node;
const nodeMajor = Number(nodeVersion.split(".")[0]);
if (Number.isNaN(nodeMajor) || nodeMajor < 20) {
  errors.push(`Node.js 20+ is required. Detected ${nodeVersion}.`);
} else if (nodeMajor !== 20) {
  warnings.push(`Detected Node ${nodeVersion}. CI uses Node 20; use Node 20 for parity.`);
}

const pnpmVersion = runCommand("pnpm --version");
if (!pnpmVersion.ok) {
  errors.push("pnpm is not available in PATH.");
}

if (!fs.existsSync(envPath)) {
  errors.push("backend/.env is missing. Copy backend/.env.example to backend/.env first.");
}

let env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  env = parseEnvFile(envContent);

  const requiredKeys = [
    "FRONTEND_URL",
    "DATABASE_URL",
    "REDIS_URL",
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "GITHUB_APP_ID"
  ];

  for (const key of requiredKeys) {
    if (!isPopulated(env[key])) {
      errors.push(`backend/.env is missing required value: ${key}`);
    }
  }

  const hasAuthSecret = isPopulated(env.JWT_SECRET) || isPopulated(env.SESSION_SECRET);
  if (!hasAuthSecret) {
    errors.push("backend/.env requires one of JWT_SECRET or SESSION_SECRET.");
  }

  const hasGithubPrivateKey =
    isPopulated(env.GITHUB_PRIVATE_KEY) ||
    isPopulated(env.GITHUB_PRIVATE_KEY_FILE) ||
    isPopulated(env.GITHUB_PRIVATE_KEY_BASE64);
  if (!hasGithubPrivateKey) {
    errors.push(
      "backend/.env requires one of GITHUB_PRIVATE_KEY, GITHUB_PRIVATE_KEY_FILE, or GITHUB_PRIVATE_KEY_BASE64."
    );
  }

  if (!isPopulated(env.OPENAI_API_KEY)) {
    warnings.push("OPENAI_API_KEY is empty. Live AI reviews will fail until it is set.");
  }
}

const dockerInfo = runCommand("docker info");
if (!dockerInfo.ok) {
  errors.push("Docker daemon is not running or Docker CLI is unavailable.");
}

const dockerComposeVersion = runCommand("docker compose version");
if (!dockerComposeVersion.ok) {
  errors.push("docker compose is unavailable. Install Docker Compose v2.");
}

if (dockerInfo.ok && dockerComposeVersion.ok) {
  const runningServices = runCommand("docker compose ps --services --filter status=running");
  if (runningServices.ok) {
    const running = new Set(runningServices.output.split(/\r?\n/).map((s) => s.trim()).filter(Boolean));
    if (!running.has("postgres") || !running.has("redis")) {
      warnings.push("Postgres and Redis are not both running. Start them with: docker compose up -d postgres redis");
    }
  } else {
    warnings.push("Could not inspect running compose services. Run docker compose ps to inspect manually.");
  }
}

console.log("[preflight] DevPilot environment checks");
console.log(`[preflight] Node: ${nodeVersion}`);
if (pnpmVersion.ok) {
  console.log(`[preflight] pnpm: ${pnpmVersion.output}`);
}

if (warnings.length > 0) {
  console.log("[preflight] Warnings:");
  for (const warning of warnings) {
    console.log(`  - ${warning}`);
  }
}

if (errors.length > 0) {
  console.error("[preflight] Errors:");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log("[preflight] OK");
