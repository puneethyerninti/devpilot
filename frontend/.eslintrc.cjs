// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react"],
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:@typescript-eslint/recommended", "eslint-config-prettier"],
  settings: {
    react: {
      version: "detect"
    }
  }
};
