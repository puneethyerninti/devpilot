// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import crypto from "node:crypto";

const safeCompare = (a: Buffer, b: Buffer) => {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

const hmacFor = (algo: "sha1" | "sha256", rawBody: Buffer, secret: string) => {
  return Buffer.from(`${algo}=` + crypto.createHmac(algo, secret).update(rawBody).digest("hex"), "utf8");
};

export const verifyGitHubSignature = (
  rawBody: Buffer,
  signature256: string | undefined,
  secret: string,
  signatureSha1?: string
): boolean => {
  if (!secret) return false;

  const expected256 = hmacFor("sha256", rawBody, secret);
  const expectedSha1 = hmacFor("sha1", rawBody, secret);

  const provided = [signature256, signatureSha1].filter(Boolean) as string[];
  if (!provided.length) return false;

  return provided.some((sig) => {
    const received = Buffer.from(sig, "utf8");
    if (sig.startsWith("sha256=")) return safeCompare(expected256, received);
    if (sig.startsWith("sha1=")) return safeCompare(expectedSha1, received);
    return false;
  });
};
