// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    exclude: ["**/*.pw.spec.ts", "tests/smoke.spec.ts"]
  }
});

