// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parserOptions: {
    sourceType: "module",
    project: undefined
  },
  ignorePatterns: ["dist", "coverage"]
};
