import { buildClient } from "@datocms/cma-client-node";
import DatoApi from "../../Api/DatoApi.js";
import type { CacheManager } from "../../cache/CacheManager.js";
import type { ConsoleLogger } from "../../logger.js";
import type { BuilderContext } from "../../types/BuilderContext.js";
import type { ResolvedDatoBuilderConfig } from "../../types/DatoBuilderConfig.js";
import { BuildExecutor } from "./BuildExecutor.js";
import { DeletionDetector } from "./DeletionDetector.js";
import { DeletionManager } from "./DeletionManager.js";
import { DependencyAnalyzer } from "./DependencyAnalyzer.js";
import { DependencyResolver } from "./DependencyResolver.js";
import { FileDiscoverer } from "./FileDiscoverer.js";
import { ItemBuilder } from "./ItemBuilder.js";
import type { BuildResult, FileInfo } from "./types.js";

interface RunCommandOptions {
  config: ResolvedDatoBuilderConfig;
  cache: CacheManager;
  logger: ConsoleLogger;
  enableDeletion?: boolean;
  skipDeletionConfirmation?: boolean;
  concurrency?: number;
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
  private readonly config: ResolvedDatoBuilderConfig;
  private readonly cache: CacheManager;
  private readonly logger: ConsoleLogger;
  private readonly fileDiscoverer: FileDiscoverer;
  private readonly dependencyAnalyzer: DependencyAnalyzer;
  private readonly dependencyResolver: DependencyResolver;
  private readonly itemBuilder: ItemBuilder;
  private readonly buildExecutor: BuildExecutor;
  private readonly deletionDetector: DeletionDetector;
  private readonly deletionManager: DeletionManager;
  private readonly enableDeletion: boolean;
  private readonly skipDeletionConfirmation: boolean;
  private readonly concurrency: number;

  private fileMap: Map<string, FileInfo> | null = null;

  constructor({
    config,
    cache,
    logger,
    enableDeletion = true,
    skipDeletionConfirmation = false,
    concurrency = 1,
  }: RunCommandOptions) {
    this.logger = logger;

    this.logger.traceJson("Initializing RunCommand", {
      config: {
        logLevel: config.logLevel,
        apiToken: config.apiToken ? "***" : "undefined",
        blocksPath: config.blocksPath,
        modelsPath: config.modelsPath,
      },
      enableDeletion,
      skipDeletionConfirmation,
    });

    this.config = config;
    this.cache = cache;
    this.enableDeletion = enableDeletion;
    this.skipDeletionConfirmation = skipDeletionConfirmation;
    this.concurrency = concurrency;

    this.fileDiscoverer = new FileDiscoverer(
      this.config.blocksPath,
      this.config.modelsPath,
      logger,
    );

    this.dependencyAnalyzer = new DependencyAnalyzer(config, logger);
    this.dependencyResolver = new DependencyResolver(logger);
    this.itemBuilder = new ItemBuilder(cache, logger, () => this.getContext());
    this.buildExecutor = new BuildExecutor(this.itemBuilder, logger);
    this.deletionDetector = new DeletionDetector(cache, logger);

    const datoApi = new DatoApi(
      buildClient({
        apiToken: config.apiToken,
        environment: config.environment,
      }),
    );
    this.deletionManager = new DeletionManager(datoApi, cache, logger);

    this.logger.trace("RunCommand initialized successfully");
  }

  public async execute(): Promise<void> {
    this.logger.trace("Starting RunCommand execution");

    // File discovery
    this.fileMap = await this.fileDiscoverer.discoverFiles();
    this.logger.traceJson("File discovery completed", {
      fileCount: this.fileMap.size,
    });

    if (this.fileMap.size === 0) {
      this.logger.info("No files found to process");
      return;
    }

    // Dependency analysis
    this.logger.trace("Starting dependency analysis");
    await this.dependencyAnalyzer.analyzeDependencies(this.fileMap);
    this.logger.trace("Dependency analysis completed");

    // Build order resolution
    this.logger.trace("Resolving build order");
    const buildOrder = this.dependencyResolver.topologicalSort(this.fileMap);
    this.logger.traceJson("Build order resolved", {
      buildOrder: buildOrder.map((key) => this.fileMap?.get(key)?.name || key),
    });

    // Build execution
    this.logger.trace("Starting build execution");

    const results = await this.buildExecutorWithoutProgress(
      this.fileMap,
      buildOrder,
    );

    this.logger.traceJson("Build execution completed", {
      resultCount: results.length,
    });

    // Process results
    this.logger.trace("Processing build results");

    if (this.enableDeletion) {
      this.logger.trace("Starting deletion detection and handling");
      await this.handleDeletions();
    }
  }

  /**
   * Execute build with simple logging
   */
  private async buildExecutorWithoutProgress(
    fileMap: Map<string, FileInfo>,
    buildOrder: string[],
  ): Promise<BuildResult[]> {
    if (this.concurrency <= 1) {
      return this.buildSequentially(fileMap, buildOrder);
    }

    return this.buildConcurrently(fileMap, buildOrder);
  }

  /**
   * Original sequential build logic
   */
  private async buildSequentially(
    fileMap: Map<string, FileInfo>,
    buildOrder: string[],
  ): Promise<BuildResult[]> {
    const results: BuildResult[] = [];

    for (const fileKey of buildOrder) {
      const fileInfo = fileMap.get(fileKey);
      if (!fileInfo) {
        this.logger.warn(`File info not found for key: ${fileKey}`);
        continue;
      }

      this.logger.info(`Building ${fileInfo.type}: ${fileInfo.name}`);

      try {
        // Build the item
        const result = await this.buildExecutor.getOrBuildItem(
          fileKey,
          fileInfo,
        );

        const status = result.fromCache ? "(from cache)" : "(built)";
        this.logger.success(`${fileInfo.type}: ${fileInfo.name} ${status}`);

        results.push({
          success: true,
          fromCache: result.fromCache,
          type: fileInfo.type,
          name: fileInfo.name,
        });
      } catch (error: unknown) {
        this.logger.error(
          `${fileInfo.type}: ${fileInfo.name} - ${error instanceof Error ? error.message : String(error)}`,
        );

        results.push({
          success: false,
          fromCache: false,
          type: fileInfo.type,
          name: fileInfo.name,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }

    return results;
  }

  /**
   * Concurrent build execution that respects dependencies
   */
  private async buildConcurrently(
    fileMap: Map<string, FileInfo>,
    buildOrder: string[],
  ): Promise<BuildResult[]> {
    const results: BuildResult[] = [];
    const completed = new Set<string>();
    const inProgress = new Map<string, Promise<BuildResult>>();
    const pending = new Set(buildOrder);

    // Build dependency map for quick lookup
    const dependsOn = new Map<string, Set<string>>();
    for (const [fileKey, fileInfo] of fileMap) {
      dependsOn.set(fileKey, new Set(fileInfo.dependencies || []));
    }

    this.logger.traceJson("Starting concurrent build", {
      totalItems: buildOrder.length,
      concurrency: this.concurrency,
    });

    // Keep building until all items are processed
    while (pending.size > 0 || inProgress.size > 0) {
      // Find items ready to build (dependencies satisfied)
      const readyToBuild = Array.from(pending).filter((fileKey) => {
        const deps = dependsOn.get(fileKey) || new Set();
        return Array.from(deps).every((dep) => completed.has(dep));
      });

      // Start builds up to concurrency limit
      const slotsAvailable = this.concurrency - inProgress.size;
      const itemsToStart = readyToBuild.slice(0, slotsAvailable);

      for (const fileKey of itemsToStart) {
        pending.delete(fileKey);
        const buildPromise = this.buildSingleItem(fileMap, fileKey);
        inProgress.set(fileKey, buildPromise);

        const fileInfo = fileMap.get(fileKey);
        if (fileInfo) {
          this.logger.info(`Building ${fileInfo.type}: ${fileInfo.name}`);
        }
      }

      // If we have builds in progress, wait for at least one to complete
      if (inProgress.size > 0) {
        // Wait for ALL in-progress builds to complete, not just one
        const inProgressEntries = Array.from(inProgress.entries());
        const completedBuilds = await Promise.allSettled(
          inProgressEntries.map(async ([fileKey, promise]) => ({
            fileKey,
            result: await promise,
          })),
        );

        // Process all completed builds
        for (const buildResult of completedBuilds) {
          if (buildResult.status === "fulfilled") {
            const { fileKey, result } = buildResult.value;

            // Remove from in progress and add to completed
            inProgress.delete(fileKey);
            completed.add(fileKey);
            results.push(result);

            const fileInfo = fileMap.get(fileKey);
            if (fileInfo) {
              if (result.success) {
                const status = result.fromCache ? "(from cache)" : "(built)";
                this.logger.success(
                  `${fileInfo.type}: ${fileInfo.name} ${status}`,
                );
              } else {
                const errorMessage =
                  result.error instanceof Error
                    ? result.error.message
                    : String(result.error);

                this.logger.error(
                  `${fileInfo.type}: ${fileInfo.name} - ${errorMessage}`,
                );
              }
            }
          } else {
            // Handle rejected promises
            this.logger.error(`Build promise rejected: ${buildResult.reason}`);
          }
        }

        // Clear the inProgress map since we've processed all builds
        inProgress.clear();
      }

      // Safety check to prevent infinite loops
      if (pending.size > 0 && inProgress.size === 0) {
        const readyToBuildAfterCompletion = Array.from(pending).filter(
          (fileKey) => {
            const deps = dependsOn.get(fileKey) || new Set();
            return Array.from(deps).every((dep) => completed.has(dep));
          },
        );

        if (readyToBuildAfterCompletion.length === 0) {
          this.logger.error(
            "Dependency deadlock detected. Some items cannot be built due to circular or missing dependencies.",
          );
          const remainingItems = Array.from(pending).map((key) => {
            const fileInfo = fileMap.get(key);
            const deps = dependsOn.get(key) || new Set();
            const missingDeps = Array.from(deps).filter(
              (dep) => !completed.has(dep),
            );
            return fileInfo
              ? `${fileInfo.type}:${fileInfo.name} (missing deps: ${missingDeps.join(", ")})`
              : key;
          });
          this.logger.error(`Remaining items: ${remainingItems.join(", ")}`);
          break;
        }
      }
    }

    this.logger.traceJson("Concurrent build completed", {
      totalResults: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    });

    return results;
  }

  /**
   * Build a single item and return the result
   */
  private async buildSingleItem(
    fileMap: Map<string, FileInfo>,
    fileKey: string,
  ): Promise<BuildResult> {
    const fileInfo = fileMap.get(fileKey);
    if (!fileInfo) {
      return {
        success: false,
        fromCache: false,
        type: "unknown",
        name: fileKey,
        error: new Error(`File info not found for key: ${fileKey}`),
      };
    }

    try {
      const result = await this.buildExecutor.getOrBuildItem(fileKey, fileInfo);
      return {
        success: true,
        fromCache: result.fromCache,
        type: fileInfo.type,
        name: fileInfo.name,
      };
    } catch (error: unknown) {
      return {
        success: false,
        fromCache: false,
        type: fileInfo.type,
        name: fileInfo.name,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  private getContext(): BuilderContext {
    this.logger.trace("Creating builder context");
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
    this.logger.traceJson("Getting item ID", { type, name });

    const cacheKey = `${type}:${name}`;
    const cached = this.cache.get(cacheKey);

    if (cached) {
      this.logger.traceJson("Item found in cache", {
        type,
        name,
        id: cached.id,
      });
      return cached.id;
    }

    this.logger.traceJson("Item not in cache, attempting to build", {
      type,
      name,
    });

    // If not in cache, try to build it using BuildExecutor
    if (this.fileMap) {
      const fileKey = this.findFileKeyByName(type, name);

      if (fileKey) {
        this.logger.traceJson("Found file key for item", {
          type,
          name,
          fileKey,
        });
        const fileInfo = this.fileMap.get(fileKey);

        if (fileInfo) {
          try {
            this.logger.debug(`Building dependency ${type} "${name}"`);
            const result = await this.buildExecutor.getOrBuildItem(
              fileKey,
              fileInfo,
            );
            this.logger.traceJson("Dependency built successfully", {
              type,
              name,
              id: result.id,
            });
            return result.id;
          } catch (error) {
            this.logger.error(
              `Failed to build dependency ${type} "${name}": ${
                (error as Error).message
              }`,
            );
            throw error;
          }
        }
      } else {
        this.logger.traceJson("No file key found for item", { type, name });
      }
    } else {
      this.logger.traceJson("No file map available for item lookup", {
        type,
        name,
      });
    }

    // Generate helpful error message with available items
    this.logger.traceJson("Generating error message for missing item", {
      type,
      name,
    });
    const availableItems = this.getAvailableItems(type);
    const errorMessage = this.buildItemNotFoundMessage(
      type,
      name,
      availableItems,
    );

    this.logger.traceJson("Item not found", { type, name, availableItems });
    throw new ItemNotFoundError(errorMessage, type, name, availableItems);
  }

  private findFileKeyByName(
    type: "block" | "model",
    name: string,
  ): string | null {
    this.logger.traceJson("Finding file key by name", { type, name });

    if (!this.fileMap) {
      this.logger.trace("No file map available for lookup");
      return null;
    }

    for (const [fileKey, fileInfo] of this.fileMap.entries()) {
      if (fileInfo.type === type && fileInfo.name === name) {
        this.logger.traceJson("Found file key", { type, name, fileKey });
        return fileKey;
      }
    }

    this.logger.traceJson("File key not found", { type, name });
    return null;
  }

  private getAvailableItems(type: "block" | "model"): string[] {
    this.logger.traceJson("Getting available items", { type });

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
    const result = [...new Set(availableItems)].sort();

    this.logger.traceJson("Available items retrieved", {
      type,
      cachedCount: cachedItems.length,
      fileMapCount: fileMapItems.length,
      totalCount: result.length,
    });
    return result;
  }

  private buildItemNotFoundMessage(
    type: "block" | "model",
    name: string,
    availableItems: string[],
  ): string {
    this.logger.traceJson("Building item not found message", {
      type,
      name,
      availableItemsCount: availableItems.length,
    });

    const baseMessage = `Cannot find ${type} with name "${name}".`;

    if (availableItems.length === 0) {
      this.logger.trace("No available items for error message");
      return `${baseMessage} No ${type}s are available.`;
    }

    // If there are similar names, suggest them
    const similarItems = this.findSimilarItems(name, availableItems);

    if (similarItems.length > 0) {
      this.logger.traceJson("Found similar items for suggestion", {
        similarItems,
      });
      return `${baseMessage} Did you mean one of these: ${similarItems.join(
        ", ",
      )}? Available ${type}s: ${availableItems.join(", ")}`;
    }

    this.logger.trace("No similar items found, returning basic error message");
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

  private async handleDeletions(): Promise<void> {
    if (!this.fileMap) {
      this.logger.warn("No file map available for deletion detection");
      return;
    }

    this.logger.trace("Starting deletion detection");

    const deletionSummary = this.deletionDetector.detectDeletions(this.fileMap);

    if (deletionSummary.total === 0) {
      this.logger.debug("No deletions detected");
      return;
    }

    this.logger.traceJson("Deletions detected", {
      total: deletionSummary.total,
      blocks: deletionSummary.blocks.length,
      models: deletionSummary.models.length,
    });

    const allCandidates = [
      ...deletionSummary.blocks,
      ...deletionSummary.models,
    ];
    const { safe, unsafe } = this.deletionDetector.filterSafeDeletions(
      allCandidates,
      this.fileMap,
    );

    const deletionOptions = {
      skipConfirmation: this.skipDeletionConfirmation,
    };

    const results = await this.deletionManager.handleDeletions(
      deletionSummary,
      safe,
      unsafe,
      deletionOptions,
    );

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    if (results.length > 0) {
      this.logger.info(
        `Deletion process completed: ${successful} successful, ${failed} failed`,
      );
    }
  }
}
