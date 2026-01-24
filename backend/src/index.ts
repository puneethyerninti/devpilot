import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prQueue } from "./queues/prQueue";
import { logger } from "./utils/logger";
import "./workers/prWorker";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/enqueue", async (_req, res) => {
  try {
    const job = await prQueue.add(
      "test-job",
      { type: "test", payload: { msg: "hello" } },
      { removeOnComplete: true, removeOnFail: false }
    );

    logger.info(`Enqueued job ${job.id}`);
    res.status(202).json({ jobId: job.id });
  } catch (error) {
    logger.error(`Failed to enqueue job: ${(error as Error).message}`);
    res.status(500).json({ error: "Failed to enqueue job" });
  }
});

app.listen(PORT, () => {
  logger.info(`API listening on http://localhost:${PORT}`);
});
