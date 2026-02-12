// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
const isProd = process.env.NODE_ENV !== "development";
const base = isProd ? "../../backend/dist" : "../../backend/src";
const extension = isProd ? ".js" : ".ts";
const workerEntry = new URL(`${base}/workers/prWorker${extension}`, import.meta.url);

await import(workerEntry.pathname);
