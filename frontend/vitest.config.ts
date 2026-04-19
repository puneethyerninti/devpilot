// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    exclude: ["**/*.pw.spec.ts", "tests/smoke.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts"],
      thresholds: {
        branches: 40,
        functions: 12,
        lines: 14,
        statements: 14
      }
    }
  }
});

