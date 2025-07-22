#!/usr/bin/env node

import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the actual CLI file
const cliPath = join(__dirname, "cli.js");

// Spawn tsx with the CLI file and pass through all arguments
const child = spawn("npx", ["tsx", cliPath, ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: true,
});

// Exit with the same code as the child process
child.on("exit", (code) => {
  process.exit(code || 0);
});

// Handle errors
child.on("error", (error) => {
  console.error("Failed to start CLI:", error.message);
  process.exit(1);
});
