// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  moduleNameMapper: {
    // Allow TS sources to keep explicit `.js` in imports under Node16/Nodenext.
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 24,
      lines: 30,
      statements: 30
    }
  }
};

export default config;
