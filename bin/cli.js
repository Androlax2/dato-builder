#!/usr/bin/env node

const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const ItemTypeBuilder = require("../build/ItemTypeBuilder").default;

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
    return content.match(/^\s*(import|export)\s/m) ? "esm" : "commonjs";
  } catch {
    return null;
  }
}

function findRunnableFilesRecursively(dirPath) {
  const result = [];

  const walk = (currentPath) => {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".ts") || entry.name.endsWith(".js"))
      ) {
        result.push(fullPath);
      }
    }
  };

  walk(dirPath);
  return result;
}

function runOneFile(resolvedFile) {
  const isTs = resolvedFile.endsWith(".ts") || resolvedFile.endsWith(".mts");
  const isJs = resolvedFile.endsWith(".js") || resolvedFile.endsWith(".mjs");

  const isExplicitESM = isESMFile(resolvedFile);
  const projectIsESM = isESMProject();
  const fileSyntax = detectModuleSyntax(resolvedFile);
  const hasESMSyntax = fileSyntax === "esm";
  const useESM = isExplicitESM || projectIsESM;

  let nodeArgs = [];
  const env = {
    ...process.env,
    NODE_OPTIONS: "--enable-source-maps",
  };

  if (isTs) {
    if (hasESMSyntax && !useESM) {
      env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
        module: "CommonJS",
        moduleResolution: "node",
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      });
      nodeArgs = ["-r", "ts-node/register", resolvedFile];
    } else if (useESM) {
      nodeArgs = ["--loader", "ts-node/esm", resolvedFile];
    } else {
      nodeArgs = ["-r", "ts-node/register", resolvedFile];
    }
  } else if (isJs) {
    if (useESM && !isExplicitESM) {
      nodeArgs = ["--input-type=module", resolvedFile];
    } else {
      nodeArgs = [resolvedFile];
    }
  } else {
    console.error(`❌ Unsupported file type: ${resolvedFile}`);
    return;
  }

  const child = spawn("node", nodeArgs.concat(args.slice(2)), {
    stdio: "inherit",
    env,
  });

  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`❌ Execution failed for ${resolvedFile}`);
      process.exit(code ?? 1);
    }
  });
}

function runFileOrDir(inputPath) {
  const resolvedPath = path.resolve(process.cwd(), inputPath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ File or folder not found: ${resolvedPath}`);
    process.exit(1);
  }

  const stat = fs.statSync(resolvedPath);

  if (stat.isDirectory()) {
    const files = findRunnableFilesRecursively(resolvedPath);
    if (files.length === 0) {
      console.warn(`⚠️ No .ts or .js files found in: ${resolvedPath}`);
    }

    for (const file of files) {
      runOneFile(file);
    }
  } else if (stat.isFile()) {
    runOneFile(resolvedPath);
  } else {
    console.error(`❌ Unsupported path: ${resolvedPath}`);
    process.exit(1);
  }
}

// CLI entry points
if (command === "clear-cache") {
  ItemTypeBuilder.clearCache();
} else if (command === "run") {
  const input = args[1];
  if (!input) {
    console.error(
      "❌ Missing path. Usage: dato-builder run <file.ts|file.js|folder>",
    );
    process.exit(1);
  }
  runFileOrDir(input);
} else {
  console.log("📦 dato-builder CLI");
  console.log("Usage:");
  console.log(
    "  dato-builder run <file.ts|file.js|folder>   Run a file or all files in a directory (recursively)",
  );
  console.log(
    "  dato-builder clear-cache               Clear the itemTypeBuilder cache",
  );
}
