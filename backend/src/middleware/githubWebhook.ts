import type express from "express";
import { verifyGitHubSignature } from "../utils/webhook";
import type { AppConfig } from "../config";

export const verifyGitHubWebhook = (config: Pick<AppConfig, "githubWebhookSecret">) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const deliveryId = req.get("x-github-delivery");
    const signature256 = req.get("x-hub-signature-256");
    const signatureSha1 = req.get("x-hub-signature");
    const rawBody = (req as express.Request & { rawBody?: Buffer }).rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));

    if (!config.githubWebhookSecret) {
      return res.status(401).json({ ok: false, error: "Signature required" });
    }

    if (!deliveryId) {
      return res.status(400).json({ ok: false, error: "Missing delivery id" });
    }

    const valid = verifyGitHubSignature(rawBody, signature256, config.githubWebhookSecret, signatureSha1);
    if (!valid) {
      return res.status(401).json({ ok: false, error: "Invalid signature" });
    }

    next();
  };
};
