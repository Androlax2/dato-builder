import type { ItemTypeCacheManager } from "../../cache/ItemTypeCacheManager";
import type { ConsoleLogger } from "../../logger";
import type { BuilderContext } from "../../types/BuilderContext";
import type { DatoBuilderConfig } from "../../types/DatoBuilderConfig";
import { BuildExecutor } from "./BuildExecutor";
import { DependencyAnalyzer } from "./DependencyAnalyzer";
import { DependencyResolver } from "./DependencyResolver";
import { ExecutionSummary } from "./ExecutionSummary";
import { FileDiscoverer } from "./FileDiscover";
import { ItemBuilder } from "./ItemBuilder";
import type { FileInfo } from "./types";

interface RunCommandOptions {
  config: Required<DatoBuilderConfig>;
  cache: ItemTypeCacheManager;
  logger: ConsoleLogger;
  blocksPath?: string | null;
  modelsPath?: string | null;
}

export class RunCommand {
  private readonly config: Required<DatoBuilderConfig>;
  private readonly cache: ItemTypeCacheManager;
  private readonly logger: ConsoleLogger;
  private readonly fileDiscoverer: FileDiscoverer;
  private readonly dependencyAnalyzer: DependencyAnalyzer;
  private readonly dependencyResolver: DependencyResolver;
  private readonly itemBuilder: ItemBuilder;
  private readonly buildExecutor: BuildExecutor;
  private readonly executionSummary: ExecutionSummary;

  private fileMap: Map<string, FileInfo> | null = null;

  constructor({
    config,
    cache,
    logger,
    blocksPath,
    modelsPath,
  }: RunCommandOptions) {
    this.config = config;
    this.cache = cache;
    this.logger = logger;

    this.fileDiscoverer = new FileDiscoverer(
      blocksPath ?? "./datocms/blocks",
      modelsPath ?? "./datocms/models",
      logger,
    );

    this.dependencyAnalyzer = new DependencyAnalyzer(config, logger);
    this.dependencyResolver = new DependencyResolver(logger);
    this.itemBuilder = new ItemBuilder(cache, logger, () => this.getContext());
    this.buildExecutor = new BuildExecutor(this.itemBuilder, logger);
    this.executionSummary = new ExecutionSummary(logger);
  }

  public async execute(): Promise<void> {
    this.fileMap = await this.fileDiscoverer.discoverFiles();

    if (this.fileMap.size === 0) {
      return;
    }

    await this.dependencyAnalyzer.analyzeDependencies(this.fileMap);

    const buildOrder = this.dependencyResolver.topologicalSort(this.fileMap);
    const results = await this.buildExecutor.executeBuild(
      this.fileMap,
      buildOrder,
    );

    results.forEach((result) => {
      if (result.success && !result.fromCache) {
        this.logger.success(
          `${result.type.charAt(0).toUpperCase() + result.type.slice(1)} "${result.name}" built successfully`,
        );
      }
    });

    this.executionSummary.logSummary(results, this.fileMap);
  }

  private getContext(): BuilderContext {
    return {
      config: this.config,
      getBlock: (name: string) => this.getItemId("block", name),
      getModel: (name: string) => this.getItemId("model", name),
    };
  }

  private async getItemId(
    type: "block" | "model",
    name: string,
  ): Promise<string> {
    const cacheKey = `${type}:${name}`;
    const cached = this.cache.get(cacheKey);

    if (cached) {
      return cached.id;
    }

    // If not in cache, try to build it using BuildExecutor
    if (this.fileMap) {
      const fileKey = this.findFileKeyByName(type, name);

      if (fileKey) {
        const fileInfo = this.fileMap.get(fileKey);

        if (fileInfo) {
          try {
            this.logger.debug(`Building dependency ${type} "${name}"`);
            const result = await this.buildExecutor.getOrBuildItem(
              fileKey,
              fileInfo,
            );
            return result.id;
          } catch (error) {
            this.logger.error(
              `Failed to build dependency ${type} "${name}": ${(error as Error).message}`,
            );
            throw error;
          }
        }
      }
    }

    // TODO: Consider throwing a more specific error type, and show available items for the type

    throw new Error(
      `Cannot find ${type} with name "${name}". Please ensure it exists and can be built.`,
    );
  }

  private findFileKeyByName(
    type: "block" | "model",
    name: string,
  ): string | null {
    if (!this.fileMap) {
      return null;
    }

    for (const [fileKey, fileInfo] of this.fileMap.entries()) {
      if (fileInfo.type === type && fileInfo.name === name) {
        return fileKey;
      }
    }

    return null;
  }
}
