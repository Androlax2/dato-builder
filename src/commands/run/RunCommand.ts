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

// Custom error for item not found
export class ItemNotFoundError extends Error {
  constructor(
    message: string,
    public readonly itemType: string,
    public readonly itemName: string,
    public readonly availableItems: string[],
  ) {
    super(message);
    this.name = "ItemNotFoundError";
  }
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

    // Generate helpful error message with available items
    const availableItems = this.getAvailableItems(type);
    const errorMessage = this.buildItemNotFoundMessage(
      type,
      name,
      availableItems,
    );

    throw new ItemNotFoundError(errorMessage, type, name, availableItems);
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

  private getAvailableItems(type: "block" | "model"): string[] {
    const availableItems: string[] = [];

    // Get items from cache
    const cachedItems = Array.from(this.cache.keys())
      .filter((key) => key.startsWith(`${type}:`))
      .map((key) => key.substring(type.length + 1));

    // Get items from file map
    const fileMapItems = this.fileMap
      ? Array.from(this.fileMap.values())
          .filter((fileInfo) => fileInfo.type === type)
          .map((fileInfo) => fileInfo.name)
      : [];

    // Combine and deduplicate
    availableItems.push(...cachedItems, ...fileMapItems);
    return [...new Set(availableItems)].sort();
  }

  private buildItemNotFoundMessage(
    type: "block" | "model",
    name: string,
    availableItems: string[],
  ): string {
    const baseMessage = `Cannot find ${type} with name "${name}".`;

    if (availableItems.length === 0) {
      return `${baseMessage} No ${type}s are available.`;
    }

    // If there are similar names, suggest them
    const similarItems = this.findSimilarItems(name, availableItems);

    if (similarItems.length > 0) {
      return `${baseMessage} Did you mean one of these: ${similarItems.join(", ")}? Available ${type}s: ${availableItems.join(", ")}`;
    }

    return `${baseMessage} Available ${type}s: ${availableItems.join(", ")}`;
  }

  private findSimilarItems(target: string, items: string[]): string[] {
    const targetLower = target.toLowerCase();

    // Find items that contain the target or vice versa
    const similar = items.filter((item) => {
      const itemLower = item.toLowerCase();
      return itemLower.includes(targetLower) || targetLower.includes(itemLower);
    });

    // Sort by similarity (shorter matches first)
    return similar.sort((a, b) => a.length - b.length).slice(0, 3);
  }

  // Method to clear caches for development/testing
  public clearCaches(): void {
    this.itemBuilder.clearCaches();
  }

  // Method to get debug info
  public getDebugInfo(): {
    fileMapSize: number;
    cacheStats: { moduleCache: number; hashCache: number };
    availableBlocks: string[];
    availableModels: string[];
  } {
    return {
      fileMapSize: this.fileMap?.size ?? 0,
      cacheStats: this.itemBuilder.getCacheStats(),
      availableBlocks: this.getAvailableItems("block"),
      availableModels: this.getAvailableItems("model"),
    };
  }
}
