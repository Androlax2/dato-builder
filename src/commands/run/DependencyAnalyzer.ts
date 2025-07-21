import type { ConsoleLogger } from "../../logger.js";
import type { BuilderContext } from "../../types/BuilderContext.js";
import type { DatoBuilderConfig } from "../../types/DatoBuilderConfig.js";
import type { FileInfo } from "./types.js";

export class DependencyAnalyzer {
  constructor(
    private readonly config: Required<DatoBuilderConfig>,
    private readonly logger: ConsoleLogger,
  ) {
    this.logger.traceJson("Initializing DependencyAnalyzer", {
      config: {
        logLevel: config.logLevel,
        apiToken: config.apiToken ? "***" : "undefined",
      },
    });
  }

  async analyzeDependencies(fileMap: Map<string, FileInfo>): Promise<void> {
    this.logger.traceJson("Starting dependency analysis", {
      fileCount: fileMap.size,
    });
    this.logger.debug("Analyzing dependencies...");

    this.logger.trace("Creating analysis promises for all files");
    const analysisPromises = Array.from(fileMap.entries()).map(
      async ([fileKey, fileInfo]) => {
        this.logger.traceJson("Analyzing dependencies for file", {
          fileKey,
          type: fileInfo.type,
          name: fileInfo.name,
          filePath: fileInfo.filePath,
        });

        const contextLogger = this.logger.child({
          [fileInfo.type]: fileInfo.name,
          operation: "analyze-deps",
        });

        try {
          this.logger.traceJson("Extracting dependencies from file", {
            fileKey,
          });
          const dependencies = await this.extractDependencies(fileInfo);
          fileInfo.dependencies = dependencies;

          this.logger.traceJson("Dependencies extracted", {
            fileKey,
            dependencyCount: dependencies.size,
            dependencies: Array.from(dependencies),
          });

          if (dependencies.size > 0) {
            contextLogger.debug(
              `Dependencies found: ${Array.from(dependencies).join(", ")}`,
            );
          } else {
            contextLogger.debug("No dependencies found");
          }
        } catch (error: unknown) {
          this.logger.errorJson("Dependency analysis failed", {
            fileKey,
            error: (error as Error).message,
            stack: (error as Error).stack,
          });
          contextLogger.warn(
            `Failed to analyze dependencies: ${(error as Error).message}`,
          );
          fileInfo.dependencies = new Set();
        }
      },
    );

    this.logger.trace("Executing all dependency analysis promises");
    await Promise.all(analysisPromises);
    this.logger.trace("Dependency analysis completed");
  }

  private async extractDependencies(fileInfo: FileInfo): Promise<Set<string>> {
    this.logger.traceJson("Extracting dependencies", {
      type: fileInfo.type,
      name: fileInfo.name,
      filePath: fileInfo.filePath,
    });

    const dependencies = new Set<string>();
    const proxyContext = this.createProxyContext(dependencies);

    this.logger.traceJson("Loading module for dependency extraction", {
      filePath: fileInfo.filePath,
    });

    if (process.env.NODE_ENV === "test") {
      // 🧪 TEST ENVIRONMENT WORKAROUND
      // Jest's ESM module loader (with --experimental-vm-modules) can fail to fully link
      // modules when using dynamic `import()` — especially when there are transitive
      // class-based imports or circular dependencies (e.g. `BlockBuilder -> ItemTypeBuilder`).
      //
      // To avoid the "not yet fulfilled" error, we wait a tick to allow Jest's internal
      // `vm.SourceTextModule` to finish linking modules before we trigger the import.
      //
      // This is not needed in production or when running through Node CLI — only Jest.
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    const moduleExports = await import(fileInfo.filePath);
    const buildFunction = moduleExports.default;

    if (typeof buildFunction !== "function") {
      this.logger.errorJson(
        "Module does not export default function for dependency extraction",
        { filePath: fileInfo.filePath },
      );
      throw new Error(
        `${fileInfo.type} "${fileInfo.name}" does not export a default function`,
      );
    }

    this.logger.trace(
      "Executing build function with proxy context to extract dependencies",
    );
    await buildFunction(proxyContext);

    this.logger.traceJson("Dependencies extracted successfully", {
      type: fileInfo.type,
      name: fileInfo.name,
      dependencyCount: dependencies.size,
      dependencies: Array.from(dependencies),
    });

    return dependencies;
  }

  private createProxyContext(dependencies: Set<string>): BuilderContext {
    this.logger.trace("Creating proxy context for dependency extraction");

    return {
      config: this.config,
      getBlock: (name: string) => {
        const dependencyKey = `block:${name}`;
        this.logger.traceJson("Proxy getBlock called", { name, dependencyKey });
        dependencies.add(dependencyKey);
        return Promise.resolve("temp-id");
      },
      getModel: (name: string) => {
        const dependencyKey = `model:${name}`;
        this.logger.traceJson("Proxy getModel called", { name, dependencyKey });
        dependencies.add(dependencyKey);
        return Promise.resolve("temp-id");
      },
    };
  }
}
