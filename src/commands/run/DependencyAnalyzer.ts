import type { ConsoleLogger } from "../../logger";
import type { BuilderContext } from "../../types/BuilderContext";
import type { DatoBuilderConfig } from "../../types/DatoBuilderConfig";
import type { FileInfo } from "./types";

export class DependencyAnalyzer {
  constructor(
    private config: Required<DatoBuilderConfig>,
    private logger: ConsoleLogger,
  ) {}

  async analyzeDependencies(fileMap: Map<string, FileInfo>): Promise<void> {
    this.logger.debug("Analyzing dependencies...");

    const analysisPromises = Array.from(fileMap.entries()).map(
      async ([, fileInfo]) => {
        const contextLogger = this.logger.child({
          [fileInfo.type]: fileInfo.name,
          operation: "analyze-deps",
        });

        try {
          const dependencies = await this.extractDependencies(fileInfo);
          fileInfo.dependencies = dependencies;

          if (dependencies.size > 0) {
            contextLogger.debug(
              `Dependencies found: ${Array.from(dependencies).join(", ")}`,
            );
          } else {
            contextLogger.debug("No dependencies found");
          }
        } catch (error: unknown) {
          contextLogger.warn(
            `Failed to analyze dependencies: ${(error as Error).message}`,
          );
          fileInfo.dependencies = new Set();
        }
      },
    );

    await Promise.all(analysisPromises);
  }

  private async extractDependencies(fileInfo: FileInfo): Promise<Set<string>> {
    const dependencies = new Set<string>();
    const proxyContext = this.createProxyContext(dependencies);

    const moduleExports = await import(fileInfo.filePath);
    const buildFunction = moduleExports.default;

    if (typeof buildFunction !== "function") {
      throw new Error(
        `${fileInfo.type} "${fileInfo.name}" does not export a default function`,
      );
    }

    await buildFunction(proxyContext);
    return dependencies;
  }

  private createProxyContext(dependencies: Set<string>): BuilderContext {
    return {
      config: this.config,
      getBlock: (name: string) => {
        dependencies.add(`block:${name}`);
        return Promise.resolve("temp-id");
      },
      getModel: (name: string) => {
        dependencies.add(`model:${name}`);
        return Promise.resolve("temp-id");
      },
    };
  }
}
