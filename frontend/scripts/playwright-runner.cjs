"use strict";

const fs = require("fs");
const Module = require("module");
const path = require("path");

function runPlaywrightCli() {
	const packageJsonPath = require.resolve("@playwright/test/package.json");
	const cliPath = path.join(path.dirname(packageJsonPath), "cli.js");

	let source = fs.readFileSync(cliPath, "utf8");
	source = source.replace(/^\uFEFF/, "").replace(/^#![^\n]*\n/, "");

	const cliModule = new Module(cliPath, module);
	cliModule.filename = cliPath;
	cliModule.paths = Module._nodeModulePaths(path.dirname(cliPath));
	cliModule._compile(source, cliPath);
}

runPlaywrightCli();
