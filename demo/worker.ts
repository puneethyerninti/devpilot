import dotenv from "dotenv";
import { Worker } from "bullmq";
import { connection, type PRJobPayload } from "./queue";
import { getGitHubClient } from "./github";
import { simpleSummarize } from "./summarizer.js";

dotenv.config();

export async function processPRJob(data: PRJobPayload) {
  const { repoFullName, prNumber, headSha, installationId } = data;
  console.log(`Processing PR ${repoFullName} #${prNumber} @${headSha}`);

  // Demo: produce a summary using summarizer stub
  const demoDiffText = `Files changed in repo ${repoFullName} at PR #${prNumber}. (diff stub)`;

  const summary = await simpleSummarize(demoDiffText);

  console.log("Summary produced:\n", summary);

  const octokit = await getGitHubClient(installationId);
  const [owner, repo] = repoFullName.split("/");

  try {
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: `**DevPilot (automated)**\n\nSummary:\n${summary}\n\n*(This is a demo comment)*`
    });
    console.log("Posted comment to PR");
  } catch (err) {
    console.error("Failed posting comment:", err);
    throw err;
  }
}

// Worker lifecycle is owned here so the queue module stays pure.
const worker = new Worker(
  "prQueue",
  async (job) => {
    console.log("Worker received job:", job.name, job.data);
    await processPRJob(job.data as PRJobPayload);
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err?.message ?? err);
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

const gracefulShutdown = async (signal: NodeJS.Signals) => {
  console.log(`${signal} received - closing worker`);
  try {
    await worker.close();
    await connection.quit();
    console.log("Worker shut down cleanly");
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exitCode = 1;
  } finally {
    process.exit(process.exitCode ?? 0);
  }
};

process.once("SIGINT", gracefulShutdown);
process.once("SIGTERM", gracefulShutdown);

console.log("PR worker started");
