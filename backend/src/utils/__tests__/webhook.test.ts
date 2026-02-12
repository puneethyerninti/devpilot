import crypto from "node:crypto";
import { verifyGitHubSignature } from "../webhook";

describe("verifyGitHubSignature", () => {
  const secret = "test-secret";
  const body = Buffer.from(JSON.stringify({ hello: "world" }));

  it("accepts a valid sha256 signature", () => {
    const signature = "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyGitHubSignature(body, signature, secret)).toBe(true);
  });

  it("rejects invalid signatures", () => {
    const signature = "sha256=deadbeef";
    expect(verifyGitHubSignature(body, signature, secret)).toBe(false);
  });
});
