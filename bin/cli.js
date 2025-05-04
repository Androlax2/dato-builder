#!/usr/bin/env node

const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const args = process.argv.slice(2);
const command = args[0];

function isESMProject() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve("package.json"), "utf8"),
    );
    return pkg.type === "module";
  } catch {
    return false;
  }
}

function isESMFile(filePath) {
  return filePath.endsWith(".mjs") || filePath.endsWith(".mts");
}

function detectModuleSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    // Simple check for import/export statements
    const hasESMSyntax = content.match(/^\s*(import|export)\s/m);
    return hasESMSyntax ? "esm" : "commonjs";
  } catch (_err) {
    return null; // Can't determine
  }
}

function runFile(filePath) {
  const resolved = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(resolved)) {
    console.error(`❌ File not found: ${resolved}`);
    process.exit(1);
  }

  const isTs = filePath.endsWith(".ts") || filePath.endsWith(".mts");
  const isJs = filePath.endsWith(".js") || filePath.endsWith(".mjs");
  const isExplicitESM = isESMFile(filePath);
  const projectIsESM = isESMProject();

  // Check the file content for ESM syntax
  const fileSyntax = detectModuleSyntax(resolved);
  const hasESMSyntax = fileSyntax === "esm";

  // Determine if we should use ESM mode
  const useESM = isExplicitESM || projectIsESM;

  let nodeArgs = [];
  const env = {
    ...process.env,
    NODE_OPTIONS: "--enable-source-maps",
  };

  if (isTs) {
    // For TypeScript files with ESM syntax in a CommonJS project
    if (hasESMSyntax && !useESM) {
      console.log(
        "📦 Detected ESM syntax in a CommonJS project, using special handling",
      );
      // Set ts-node to transpile to CommonJS but allow ESM syntax
      env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
        module: "CommonJS",
        moduleResolution: "node",
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      });
      nodeArgs = ["-r", "ts-node/register", resolved];
    } else if (useESM) {
      nodeArgs = ["--loader", "ts-node/esm", resolved];
    } else {
      nodeArgs = ["-r", "ts-node/register", resolved];
    }
  } else if (isJs) {
    if (useESM && !isExplicitESM) {
      // For .js files in ESM projects, we need to specify the loader
      nodeArgs = ["--input-type=module", resolved];
    } else {
      nodeArgs = [resolved];
    }
  } else {
    console.error("❌ Only .ts and .js files are supported.");
    process.exit(1);
  }

  console.log(
    `🚀 Running ${filePath} ${
      hasESMSyntax ? "with ESM syntax" : "with CommonJS syntax"
    }`,
  );

  const child = spawn("node", nodeArgs.concat(args.slice(2)), {
    stdio: "inherit",
    env,
  });

  child.on("exit", (code) => process.exit(code ?? 1));
}

if (command === "run") {
  const file = args[1];
  if (!file) {
    console.error(
      "❌ Missing file path. Usage: dato-builder run <file.ts|file.js>",
    );
    process.exit(1);
  }
  runFile(file);
} else {
  console.log("📦 dato-builder CLI");
  console.log("Usage:");
  console.log(
    "  dato-builder run <file.ts|file.js>   Run a JS or TS file with correct loader",
  );
}
