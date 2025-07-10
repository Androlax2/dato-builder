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
    this.options = this.parseOptions();
    this.ItemTypeBuilder = null;
    this.loadItemTypeBuilder();
  }

  /**
   * Parse command line options
   */
  parseOptions() {
    const options = {
      concurrency: 1, // Default: sequential
      maxConcurrency: 5, // Default max limit
      timeout: 30000, // 30 seconds timeout per file
    };

    for (let i = 0; i < this.args.length; i++) {
      const arg = this.args[i];

      if (arg === "--concurrent" || arg === "-c") {
        options.concurrency =
          parseInt(this.args[i + 1]) || options.maxConcurrency;
        this.args.splice(i, 2);
        i--;
      } else if (arg === "--timeout" || arg === "-t") {
        options.timeout = parseInt(this.args[i + 1]) || options.timeout;
        this.args.splice(i, 2);
        i--;
      } else if (arg === "--max-concurrent") {
        options.concurrency = options.maxConcurrency;
        this.args.splice(i, 1);
        i--;
      }
    }

    return options;
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
   * Execute a single file with timeout
   */
  async runFile(filePath) {
    const { nodeArgs, env } = this.getExecutionStrategy(filePath);

    return new Promise((resolve, reject) => {
      const relativePath = path.relative(process.cwd(), filePath);

      // Only log start message in sequential mode to avoid cluttering
      if (this.options.concurrency === 1) {
        console.log(`🚀 Running: ${relativePath}`);
      }

      const child = spawn(
        "node",
        [...nodeArgs, filePath, ...this.args.slice(2)],
        {
          stdio: this.options.concurrency === 1 ? "inherit" : "pipe",
          env,
        },
      );

      let stdout = "";
      let stderr = "";

      // Capture output for concurrent execution
      if (this.options.concurrency > 1) {
        child.stdout?.on("data", (data) => {
          stdout += data.toString();
        });
        child.stderr?.on("data", (data) => {
          stderr += data.toString();
        });
      }

      // Add timeout
      const timeout = setTimeout(() => {
        child.kill("SIGTERM");
        reject(
          new Error(`File execution timed out after ${this.options.timeout}ms`),
        );
      }, this.options.timeout);

      child.on("exit", (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          if (this.options.concurrency === 1) {
            console.log(`✅ Completed: ${relativePath}\n`);
          }
          resolve({ code, stdout, stderr, file: relativePath });
        } else {
          const error = new Error(`Process exited with code ${code}`);
          error.code = code;
          error.stdout = stdout;
          error.stderr = stderr;
          error.file = relativePath;
          reject(error);
        }
      });

      child.on("error", (error) => {
        clearTimeout(timeout);
        error.file = relativePath;
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

      console.log(`📁 Found ${files.length} file(s) to run in ${resolvedPath}`);

      // Determine optimal concurrency
      const concurrency =
        this.options.concurrency > 1
          ? Math.min(this.options.concurrency, files.length)
          : 1;

      if (concurrency > 1) {
        console.log(`🚀 Running with concurrency limit of ${concurrency}\n`);
        await this.runFilesWithSmartConcurrency(files, concurrency);
      } else {
        console.log("🚀 Running sequentially\n");
        await this.runFilesSequentially(files);
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
      } catch (error) {
        console.error(`❌ Failed: ${error.file || resolvedPath}`);
        if (error.stderr) {
          console.error(error.stderr);
        }
        process.exit(1);
      }
    } else {
      console.error(`❌ Unsupported path type: ${resolvedPath}`);
      process.exit(1);
    }
  }

  /**
   * Run files sequentially (original behavior)
   */
  async runFilesSequentially(files) {
    let failedCount = 0;
    const failedFiles = [];

    for (const file of files) {
      try {
        await this.runFile(file);
      } catch (error) {
        failedCount++;
        failedFiles.push({ file: error.file || file, error });
      }
    }

    if (failedCount > 0) {
      console.error(`❌ ${failedCount} file(s) failed to execute:`);
      failedFiles.forEach(({ file, error }) => {
        console.error(`  - ${file}: ${error.message}`);
      });
      process.exit(1);
    } else {
      console.log(`🎉 All ${files.length} file(s) executed successfully`);
    }
  }

  /**
   * Smart concurrency with proper error handling and progress tracking
   */
  async runFilesWithSmartConcurrency(files, concurrency) {
    const startTime = Date.now();
    let completed = 0;
    let failed = 0;
    const failedFiles = [];

    const updateProgress = () => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const total = completed + failed;
      process.stdout.write(
        `\r📊 Progress: ${total}/${files.length} processed (${completed} ✅, ${failed} ❌) - ${elapsed}s`,
      );
    };

    const executeFile = async (file) => {
      try {
        const result = await this.runFile(file);
        completed++;
        updateProgress();
        return { success: true, file, result };
      } catch (error) {
        failed++;
        failedFiles.push({ file: error.file || file, error });
        updateProgress();
        return { success: false, file, error };
      }
    };

    // Use controlled concurrency with a sliding window approach
    const executing = new Set();
    const results = [];

    for (const file of files) {
      // Wait if we've hit the concurrency limit
      while (executing.size >= concurrency) {
        await Promise.race([...executing]);
      }

      const promise = executeFile(file);
      executing.add(promise);
      results.push(promise);

      // Remove from executing set when promise resolves
      promise.finally(() => {
        executing.delete(promise);
      });
    }

    // Wait for all remaining promises
    await Promise.all(results);

    console.log("\n"); // New line after progress

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

    if (failed > 0) {
      console.error(
        `❌ ${failed} file(s) failed to execute (completed in ${totalTime}s):`,
      );
      failedFiles.forEach(({ file, error }) => {
        console.error(`  - ${file}: ${error.message}`);
        if (error.stderr) {
          console.error(`    ${error.stderr.trim()}`);
        }
      });
      process.exit(1);
    } else {
      console.log(
        `🎉 All ${files.length} file(s) executed successfully in ${totalTime}s`,
      );
      const avgSpeed = (files.length / parseFloat(totalTime)).toFixed(1);
      console.log(`⚡ Average: ${avgSpeed} files/second`);
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
      "  dato-builder run <file|directory> [options]     Run a file or all files in a directory",
    );
    console.log(
      "  dato-builder clear-cache                         Clear the ItemTypeBuilder cache",
    );
    console.log(
      "  dato-builder help                                Show this help message",
    );
    console.log("");
    console.log("Options:");
    console.log(
      "  -c, --concurrent <number>     Run files concurrently (default: 1)",
    );
    console.log(
      "  --max-concurrent              Run with maximum concurrency (5)",
    );
    console.log(
      "  -t, --timeout <ms>            Timeout per file in milliseconds (default: 30000)",
    );
    console.log("");
    console.log("Supported file types:");
    console.log(`  ${SUPPORTED_EXTENSIONS.join(", ")}`);
    console.log("");
    console.log("Examples:");
    console.log("  dato-builder run ./scripts/build.ts");
    console.log("  dato-builder run ./scripts/ --concurrent 3");
    console.log("  dato-builder run ./scripts/ --max-concurrent");
    console.log("  dato-builder run ./scripts/ --timeout 60000");
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
