import jwt from "jsonwebtoken";
import type { AppConfig } from "../config";

export const createOAuthState = (config: AppConfig) => {
  return encodeURIComponent(jwt.sign({ nonce: Date.now() }, config.sessionSecret, { expiresIn: "10m" }));
};

export const verifyOAuthState = (state: string, config: AppConfig) => {
  jwt.verify(decodeURIComponent(state), config.sessionSecret);
};

export const buildGitHubAuthorizeUrl = (config: AppConfig, origin: string, state: string) => {
  const url = new URL("https://github.com/login/oauth/authorize");
  const redirectUri = config.githubOAuthCallback ?? `${origin}/auth/github/callback`;
  url.searchParams.set("client_id", config.githubClientId);
  url.searchParams.set("scope", "read:user user:email repo");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  return url.toString();
};

export const exchangeCodeForAccessToken = async (config: AppConfig, code: string) => {
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: config.githubClientId,
      client_secret: config.githubClientSecret,
      code
    })
  }).then((r) => r.json() as Promise<{ access_token?: string }>);

  return tokenResponse.access_token;
};

export const fetchGitHubProfile = async (accessToken: string) => {
  return fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` }
  }).then((r) => r.json() as Promise<{ id: number; login: string; name?: string; avatar_url?: string }>);
};
