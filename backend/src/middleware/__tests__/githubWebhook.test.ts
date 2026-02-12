import crypto from "node:crypto";
import express from "express";
import request from "supertest";
import { verifyGitHubWebhook } from "../githubWebhook";

describe("middleware/githubWebhook", () => {
  const secret = "unit-secret";

  const buildApp = () => {
    const app = express();
    app.use(
      express.json({
        verify: (req, _res, buf) => {
          (req as express.Request & { rawBody?: Buffer }).rawBody = Buffer.from(buf);
        }
      })
    );
    app.post("/hook", verifyGitHubWebhook({ githubWebhookSecret: secret }), (_req, res) => res.json({ ok: true }));
    return app;
  };

  it("accepts a valid X-Hub-Signature-256", async () => {
    const payload = { hello: "world" };
    const raw = JSON.stringify(payload);
    const signature = "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");

    const res = await request(buildApp())
      .post("/hook")
      .set("X-GitHub-Delivery", "delivery-1")
      .set("X-Hub-Signature-256", signature)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("rejects an invalid signature", async () => {
    const payload = { hello: "world" };

    const res = await request(buildApp())
      .post("/hook")
      .set("X-GitHub-Delivery", "delivery-1")
      .set("X-Hub-Signature-256", "sha256=deadbeef")
      .send(payload);

    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });
});
