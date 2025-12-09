import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { readFileSync } from "fs";
import path from "path";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function getGitHubClient(installationId: number) {
  if (!installationId) {
    throw new Error("installationId is required");
  }

  const appId = Number(required("GITHUB_APP_ID"));
  const privateKeyPath = required("GITHUB_PRIVATE_KEY_PATH");
  const privateKey = readFileSync(path.resolve(privateKeyPath), "utf8");

  const auth = createAppAuth({
    appId,
    privateKey,
  });

  const { token } = await auth({
    type: "installation",
    installationId,
  });

  return new Octokit({
    auth: token,
  });
}
