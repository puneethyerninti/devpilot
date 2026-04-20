"use strict";

const { ESLint } = require("eslint");

async function run() {
  const eslint = new ESLint({ extensions: [".ts", ".tsx"] });
  const results = await eslint.lintFiles(["src"]);
  const formatter = await eslint.loadFormatter("stylish");
  const output = formatter.format(results);

  if (output) {
    process.stdout.write(output);
    if (!output.endsWith("\n")) {
      process.stdout.write("\n");
    }
  }

  const hasErrors = results.some(
    (result) => result.errorCount > 0 || result.fatalErrorCount > 0,
  );

  process.exitCode = hasErrors ? 1 : 0;
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 2;
});
