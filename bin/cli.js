#!/usr/bin/env node

const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const SUPPORTED_EXTENSIONS = [".ts", ".js", ".mts", ".mjs"];
const ESM_EXTENSIONS = [".mjs", ".mts"];
const TS_EXTENSIONS = [".ts", ".mts"];

class DatoBuilderCLI {
  constructor() {
    this.args = process.argv.slice(2);
    this.command = this.args[0];
    this.ItemTypeBuilder = null;
    this.loadItemTypeBuilder();
  }

  loadItemTypeBuilder() {
    try {
      this.ItemTypeBuilder = require("../build/ItemTypeBuilder").default;
    } catch (error) {
      console.error("❌ Failed to load ItemTypeBuilder:", error.message);
      process.exit(1);
    }
  }

  /**
   * Check if the project is configured as ESM
   */
  isESMProject() {
    try {
      const pkg = JSON.parse(
        fs.readFileSync(path.resolve("package.json"), "utf8"),
      );
      return pkg.type === "module";
    } catch {
      return false;
    }
  }

  /**
   * Check if file has explicit ESM extension
   */
  isESMFile(filePath) {
    return ESM_EXTENSIONS.some((ext) => filePath.endsWith(ext));
  }

  /**
   * Check if file has TypeScript extension
   */
  isTypeScriptFile(filePath) {
    return TS_EXTENSIONS.some((ext) => filePath.endsWith(ext));
  }

  /**
   * Detect module syntax by analyzing file content
   */
  detectModuleSyntax(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const hasESMSyntax = /^\s*(import|export)\s/m.test(content);
      const hasCJSSyntax = /require\s*\(|module\.exports|exports\./m.test(
        content,
      );

      if (hasESMSyntax && !hasCJSSyntax) return "esm";
      if (hasCJSSyntax && !hasESMSyntax) return "commonjs";
      if (hasESMSyntax && hasCJSSyntax) return "mixed";

      return "unknown";
    } catch {
      return "unknown";
    }
  }

  /**
   * Find all runnable files in a directory recursively
   */
  findRunnableFiles(dirPath) {
    const result = [];

    const walk = (currentPath) => {
      try {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);

          if (entry.isDirectory()) {
            // Skip common directories that shouldn't contain runnable scripts
            if (
              !["node_modules", ".git", "dist", "build", ".next"].includes(
                entry.name,
              )
            ) {
              walk(fullPath);
            }
          } else if (entry.isFile()) {
            if (SUPPORTED_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
              result.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(
          `⚠️ Cannot read directory ${currentPath}: ${error.message}`,
        );
      }
    };

    walk(dirPath);
    return result.sort(); // Sort for consistent ordering
  }

  /**
   * Determine the appropriate Node.js execution strategy
   */
  getExecutionStrategy(filePath) {
    const isTs = this.isTypeScriptFile(filePath);
    const isExplicitESM = this.isESMFile(filePath);
    const projectIsESM = this.isESMProject();
    const fileSyntax = this.detectModuleSyntax(filePath);
    const hasESMSyntax = fileSyntax === "esm";
    const useESM = isExplicitESM || projectIsESM;

    const env = {
      ...process.env,
      NODE_OPTIONS: "--enable-source-maps",
    };

    let nodeArgs = [];

    if (isTs) {
      if (hasESMSyntax && !useESM) {
        // TypeScript with ESM syntax but should run as CommonJS
        env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
          module: "CommonJS",
          moduleResolution: "node",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        });
        nodeArgs = ["-r", "ts-node/register"];
      } else if (useESM) {
        // TypeScript with ESM
        nodeArgs = ["--loader", "ts-node/esm"];
      } else {
        // TypeScript with CommonJS
        nodeArgs = ["-r", "ts-node/register"];
      }
    } else {
      // JavaScript files
      if (useESM && !isExplicitESM) {
        nodeArgs = ["--input-type=module"];
      }
      // For explicit ESM (.mjs) or regular JS, no special args needed
    }

    return { nodeArgs, env };
  }

  /**
   * Execute a single file
   */
  async runFile(filePath) {
    const { nodeArgs, env } = this.getExecutionStrategy(filePath);

    return new Promise((resolve, reject) => {
      console.log(`🚀 Running: ${path.relative(process.cwd(), filePath)}`);

      const child = spawn(
        "node",
        [...nodeArgs, filePath, ...this.args.slice(2)],
        {
          stdio: "inherit",
          env,
        },
      );

      child.on("exit", (code) => {
        if (code === 0) {
          console.log(
            `✅ Completed: ${path.relative(process.cwd(), filePath)}\n`,
          );
          resolve(code);
        } else {
          console.error(
            `❌ Failed: ${path.relative(process.cwd(), filePath)} (exit code: ${code})\n`,
          );
          reject(new Error(`Process exited with code ${code}`));
        }
      });

      child.on("error", (error) => {
        console.error(`❌ Error running ${filePath}:`, error.message);
        reject(error);
      });
    });
  }

  /**
   * Execute files in a directory or a single file
   */
  async runFileOrDirectory(inputPath) {
    const resolvedPath = path.resolve(process.cwd(), inputPath);

    if (!fs.existsSync(resolvedPath)) {
      console.error(`❌ File or directory not found: ${resolvedPath}`);
      process.exit(1);
    }

    const stat = fs.statSync(resolvedPath);

    if (stat.isDirectory()) {
      const files = this.findRunnableFiles(resolvedPath);

      if (files.length === 0) {
        console.warn(`⚠️ No runnable files found in: ${resolvedPath}`);
        return;
      }

      console.log(
        `📁 Found ${files.length} file(s) to run in ${resolvedPath}\n`,
      );

      let failedCount = 0;
      for (const file of files) {
        try {
          await this.runFile(file);
        } catch (_error) {
          failedCount++;
        }
      }

      if (failedCount > 0) {
        console.error(`❌ ${failedCount} file(s) failed to execute`);
        process.exit(1);
      } else {
        console.log(`🎉 All ${files.length} file(s) executed successfully`);
      }
    } else if (stat.isFile()) {
      if (!SUPPORTED_EXTENSIONS.some((ext) => resolvedPath.endsWith(ext))) {
        console.error(`❌ Unsupported file type: ${resolvedPath}`);
        console.error(
          `Supported extensions: ${SUPPORTED_EXTENSIONS.join(", ")}`,
        );
        process.exit(1);
      }

      try {
        await this.runFile(resolvedPath);
      } catch (_error) {
        process.exit(1);
      }
    } else {
      console.error(`❌ Unsupported path type: ${resolvedPath}`);
      process.exit(1);
    }
  }

  /**
   * Clear the ItemTypeBuilder cache
   */
  clearCache() {
    try {
      this.ItemTypeBuilder.clearCache();
      console.log("✅ Cache cleared successfully");
    } catch (error) {
      console.error("❌ Failed to clear cache:", error.message);
      process.exit(1);
    }
  }

  /**
   * Display help information
   */
  showHelp() {
    console.log("📦 Dato Builder CLI");
    console.log("");
    console.log("Usage:");
    console.log(
      "  dato-builder run <file|directory>     Run a file or all files in a directory",
    );
    console.log(
      "  dato-builder clear-cache              Clear the ItemTypeBuilder cache",
    );
    console.log(
      "  dato-builder help                     Show this help message",
    );
    console.log("");
    console.log("Supported file types:");
    console.log(`  ${SUPPORTED_EXTENSIONS.join(", ")}`);
    console.log("");
    console.log("Examples:");
    console.log("  dato-builder run ./scripts/build.ts");
    console.log("  dato-builder run ./scripts/");
    console.log("  dato-builder clear-cache");
  }

  /**
   * Main CLI entry point
   */
  async run() {
    try {
      switch (this.command) {
        case "run": {
          const input = this.args[1];
          if (!input) {
            console.error("❌ Missing path argument");
            console.error("Usage: dato-builder run <file|directory>");
            process.exit(1);
          }
          await this.runFileOrDirectory(input);
          break;
        }

        case "clear-cache":
          this.clearCache();
          break;

        case "help":
        case "--help":
        case "-h":
          this.showHelp();
          break;

        default:
          if (this.command) {
            console.error(`❌ Unknown command: ${this.command}`);
            console.error("Run 'dato-builder help' for usage information");
            process.exit(1);
          } else {
            this.showHelp();
          }
      }
    } catch (error) {
      console.error("❌ CLI Error:", error.message);
      process.exit(1);
    }
  }
}

// Execute CLI
if (require.main === module) {
  const cli = new DatoBuilderCLI();
  cli.run().catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  });
}

module.exports = DatoBuilderCLI;
