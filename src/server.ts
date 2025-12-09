import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import dotenv from "dotenv";
import { prQueue, type PRJobPayload } from "./queue";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const SECRET = process.env.WEBHOOK_SECRET || "dev-secret";

// raw body needed to verify signature
app.use(bodyParser.json({
  verify: (req: any, _res, buf) => {
    (req as any).rawBody = buf.toString();
  }
}));

function safeCompare(expected: string, received: string) {
  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(received);
  if (expectedBuf.length !== receivedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

function verifySignature(rawBody: string, sig256?: string | null, sigSha1?: string | null) {
  if (sig256) {
    const hmac = crypto.createHmac("sha256", SECRET);
    hmac.update(rawBody);
    const digest = "sha256=" + hmac.digest("hex");
    return safeCompare(digest, sig256);
  }

  if (sigSha1) {
    const hmac = crypto.createHmac("sha1", SECRET);
    hmac.update(rawBody);
    const digest = "sha1=" + hmac.digest("hex");
    return safeCompare(digest, sigSha1);
  }

  return false;
}

async function enqueuePRJob(payload: PRJobPayload) {
  await prQueue.add("processPR", payload, {
    attempts: 3,
    removeOnComplete: true,
    removeOnFail: false,
  });

  console.log("Enqueued PR job:", payload.repoFullName, payload.prNumber);
}

app.post("/webhook", async (req, res) => {
  const sig256 = req.get("x-hub-signature-256");
  const sigSha1 = req.get("x-hub-signature");
  const raw = (req as any).rawBody || JSON.stringify(req.body);
  if (!verifySignature(raw, sig256, sigSha1)) {
    console.warn("Invalid signature for incoming webhook", {
      has256: Boolean(sig256),
      hasSha1: Boolean(sigSha1)
    });
    return res.status(401).send("invalid signature");
  }

  const event = req.get("x-github-event");
  const payload = req.body;

  console.log("Received GitHub event:", event);

  if (event === "pull_request" && payload.pull_request) {
    const pr = payload.pull_request;
    const repo = payload.repository;
    const installationId = payload.installation?.id;

    if (!installationId) {
      console.warn("Pull request payload missing installation id");
      return res.status(400).send("missing installation id");
    }

    await enqueuePRJob({
      repoFullName: repo.full_name,
      prNumber: pr.number,
      prTitle: pr.title,
      headSha: pr.head.sha,
      installationId,
    });
  }

  res.status(200).send("ok");
});

app.get("/", (_req, res) => res.send("DevPilot running"));

app.listen(PORT, () => {
  console.log(`DevPilot server listening on ${PORT}`);
});
