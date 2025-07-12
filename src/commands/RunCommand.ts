import path from "node:path";
import { glob } from "glob";
import BlockBuilder from "../BlockBuilder";
import type { ItemTypeCacheManager } from "../cache/ItemTypeCacheManager";
import type { ConsoleLogger } from "../logger";
import ModelBuilder from "../ModelBuilder";
import type { BuilderContext } from "../types/BuilderContext";
import type { DatoBuilderConfig } from "../types/DatoBuilderConfig";

type RunCommandOptions = {
  config: Required<DatoBuilderConfig>;
  cache: ItemTypeCacheManager;
  logger: ConsoleLogger;
  /**
   * Path to the directory containing block files.
   *
   * @default "./datocms/blocks"
   */
  blocksPath?: string | null;
  /**
   * Path to the directory containing model files.
   *
   * @default "./datocms/models"
   */
  modelsPath?: string | null;
};

interface FileInfo {
  name: string;
  builder?: BlockBuilder | ModelBuilder;
  type: "block" | "model";
  filePath: string;
  dependencies: Set<string>;
}

export class RunCommand {
  private readonly config: Required<DatoBuilderConfig>;
  private readonly cache: ItemTypeCacheManager;
  private readonly blocksPath: string;
  private readonly modelsPath: string;
  private readonly logger: ConsoleLogger;

  private buildPromises = new Map<string, Promise<string>>();
  private fileMap = new Map<string, FileInfo>();

  private builtFromCache = new Set<string>();

  constructor({
    config,
    cache,
    logger,
    blocksPath,
    modelsPath,
  }: RunCommandOptions) {
    this.config = config;
    this.cache = cache;
    this.blocksPath = blocksPath ?? "./datocms/blocks";
    this.modelsPath = modelsPath ?? "./datocms/models";
    this.logger = logger;
  }

  public async execute() {
    await this.discoverAllFiles();

    if (this.fileMap.size === 0) {
      return;
    }

    await this.analyzeDependencies();

    const buildOrder = this.topologicalSort();

    this.logger.debug(`Build order determined: ${buildOrder.join(" -> ")}`);

    this.builtFromCache.clear();

    const results = await Promise.allSettled(
      buildOrder.map(async (fileKey) => {
        const fileInfo = this.fileMap.get(fileKey);
        if (!fileInfo) {
          throw new Error(`File info not found for: ${fileKey}`);
        }

        try {
          let result: string;
          if (fileInfo.type === "block") {
            result = await this.getOrCreateBlock(fileInfo.name);
            if (!this.builtFromCache.has(`block:${fileInfo.name}`)) {
              this.logger.success(
                `Block "${fileInfo.name}" built successfully`,
              );
            }
          } else {
            result = await this.getOrCreateModel(fileInfo.name);
            if (!this.builtFromCache.has(`model:${fileInfo.name}`)) {
              this.logger.success(
                `Model "${fileInfo.name}" built successfully`,
              );
            }
          }

          return result;
        } catch (error: unknown) {
          this.logger.error(
            `Failed to build ${fileInfo.type} "${fileInfo.name}": ${(error as Error).message}`,
          );
          throw error;
        }
      }),
    );

    // Log failed builds
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        const fileKey = buildOrder[index];
        const fileInfo = this.fileMap.get(fileKey);
        this.logger.error(
          `Failed to build ${fileInfo?.type} "${fileInfo?.name}": ${result.reason}`,
        );
      }
    });

    // Log execution summary
    this.logExecutionSummary(results);
  }

  private async analyzeDependencies() {
    this.logger.debug("Analyzing dependencies...");

    for (const [, fileInfo] of Array.from(this.fileMap)) {
      const contextLogger = this.logger.child({
        [fileInfo.type]: fileInfo.name,
        operation: "analyze-deps",
      });

      try {
        // Create a proxy context to track dependency calls
        const dependencies = new Set<string>();
        const proxyContext = this.createProxyContext(dependencies);

        // Import and call the build function to discover dependencies
        const moduleExports = await import(fileInfo.filePath);
        const buildFunction = moduleExports.default;

        if (typeof buildFunction !== "function") {
          throw new Error(
            `${fileInfo.type} "${fileInfo.name}" does not export a default function`,
          );
        }

        // Call the build function with proxy context to track dependencies
        await buildFunction(proxyContext);

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
        // Continue with empty dependencies if analysis fails
      }
    }
  }

  private createProxyContext(dependencies: Set<string>): BuilderContext {
    return {
      config: this.config,
      getBlock: (name: string) => {
        dependencies.add(`block:${name}`);
        // Return a dummy promise that won't be awaited during dependency analysis
        return Promise.resolve("temp-id");
      },
      getModel: (name: string) => {
        dependencies.add(`model:${name}`);
        // Return a dummy promise that won't be awaited during dependency analysis
        return Promise.resolve("temp-id");
      },
    };
  }

  private topologicalSort(): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    const visit = (fileKey: string) => {
      if (visiting.has(fileKey)) {
        throw new Error(`Circular dependency detected involving: ${fileKey}`);
      }

      if (visited.has(fileKey)) {
        return;
      }

      visiting.add(fileKey);

      const fileInfo = this.fileMap.get(fileKey);
      if (fileInfo) {
        // Visit dependencies first
        for (const dep of Array.from(fileInfo.dependencies)) {
          if (this.fileMap.has(dep)) {
            visit(dep);
          } else {
            this.logger.warn(`Dependency "${dep}" not found for ${fileKey}`);
          }
        }
      }

      visiting.delete(fileKey);
      visited.add(fileKey);
      result.push(fileKey);
    };

    // Visit all files
    for (const fileKey of Array.from(this.fileMap.keys())) {
      if (!visited.has(fileKey)) {
        visit(fileKey);
      }
    }

    return result;
  }

  private getContext(): BuilderContext {
    return {
      config: this.config,
      getBlock: (name: string) => this.getOrCreateBlock(name),
      getModel: (name: string) => this.getOrCreateModel(name),
    };
  }

  private async getOrCreateBlock(name: string): Promise<string> {
    const contextLogger = this.logger.child({
      block: name,
      operation: "get-or-create",
    });

    // Return cached ID if already built
    const cachedBlock = this.cache.get(`block:${name}`);
    if (cachedBlock) {
      contextLogger.debug(
        `Found cached block: ${cachedBlock.id}, comparing hashes...`,
      );

      try {
        const fileInfo = this.fileMap.get(`block:${name}`);

        if (fileInfo) {
          // Import and build the block to get current hash
          const createBlock = await import(fileInfo.filePath);
          const buildFunction = createBlock.default;

          if (typeof buildFunction === "function") {
            const builder = await buildFunction(this.getContext());

            if (builder instanceof BlockBuilder) {
              const currentHash = builder.getHash();

              if (currentHash === cachedBlock.hash) {
                contextLogger.debug(
                  `Using cached block ID: ${cachedBlock.id} (hash match)`,
                );
                this.builtFromCache.add(`block:${name}`);
                return cachedBlock.id;
              } else {
                contextLogger.debug(
                  `Cache invalidated for block "${name}" (hash mismatch)`,
                );
              }
            }
          }
        }
      } catch (error: unknown) {
        contextLogger.warn(
          `Failed to verify cache for block "${name}": ${(error as Error).message}`,
        );
      }
    }

    // Return existing promise if currently building (prevents duplicate builds)
    const existingPromise = this.buildPromises.get(`block:${name}`);

    if (existingPromise) {
      contextLogger.debug("Waiting for existing build promise");
      return existingPromise;
    }

    // Create new build promise
    const buildPromise = this.buildBlock(name);
    this.buildPromises.set(`block:${name}`, buildPromise);

    try {
      const itemTypeId = await buildPromise;
      contextLogger.debug(`Block built with ID: ${itemTypeId}`);
      return itemTypeId;
    } finally {
      this.buildPromises.delete(`block:${name}`);
    }
  }

  private async getOrCreateModel(name: string): Promise<string> {
    const contextLogger = this.logger.child({
      model: name,
      operation: "get-or-create",
    });

    // Return cached ID if already built
    const cachedModel = this.cache.get(`model:${name}`);
    if (cachedModel) {
      contextLogger.debug(
        `Found cached model: ${cachedModel.id}, comparing hashes...`,
      );

      try {
        const fileInfo = this.fileMap.get(`model:${name}`);

        if (fileInfo) {
          // Import and build the model to get current hash
          const createModel = await import(fileInfo.filePath);
          const buildFunction = createModel.default;

          if (typeof buildFunction === "function") {
            const builder = await buildFunction(this.getContext());

            if (builder instanceof ModelBuilder) {
              const currentHash = builder.getHash();

              if (currentHash === cachedModel.hash) {
                contextLogger.debug(
                  `Using cached model ID: ${cachedModel.id} (hash match)`,
                );
                this.builtFromCache.add(`model:${name}`);
                return cachedModel.id;
              } else {
                contextLogger.debug(
                  `Cache invalidated for model "${name}" (hash mismatch)`,
                );
              }
            }
          }
        }
      } catch (error: unknown) {
        contextLogger.warn(
          `Failed to verify cache for model "${name}": ${(error as Error).message}`,
        );
      }
    }

    // Return existing promise if currently building (prevents duplicate builds)
    const existingPromise = this.buildPromises.get(`model:${name}`);
    if (existingPromise) {
      contextLogger.debug("Waiting for existing build promise");
      return existingPromise;
    }

    const buildPromise = this.buildModel(name);
    this.buildPromises.set(`model:${name}`, buildPromise);

    try {
      const itemTypeId = await buildPromise;
      contextLogger.debug(`Model built with ID: ${itemTypeId}`);
      return itemTypeId;
    } finally {
      this.buildPromises.delete(`model:${name}`);
    }
  }

  private async buildBlock(name: string): Promise<string> {
    const fileInfo = this.fileMap.get(`block:${name}`);

    if (!fileInfo) {
      throw new Error(
        `Block "${name}" not found. Available blocks: ${Array.from(
          this.fileMap.keys(),
        )
          .filter((k) => k.startsWith("block:"))
          .map((k) => k.replace("block:", ""))
          .join(", ")}`,
      );
    }

    const contextLogger = this.logger.child({
      block: name,
      operation: "build",
    });

    contextLogger.debug(`Building block from: ${fileInfo.filePath}`);

    const createBlock = await import(fileInfo.filePath);
    const buildFunction = createBlock.default;

    if (typeof buildFunction !== "function") {
      throw new Error(`Block "${name}" does not export a default function`);
    }

    const builder = await buildFunction(this.getContext());

    if (!(builder instanceof BlockBuilder)) {
      throw new Error(
        `Block "${name}" must return an instance of BlockBuilder`,
      );
    }

    fileInfo.builder = builder;

    const blockId = await builder.upsert();

    try {
      contextLogger.debug(`Caching block "${name}" with ID: ${blockId}`);

      await this.cache.set(`block:${name}`, {
        id: blockId,
        hash: builder.getHash(),
      });

      contextLogger.debug(`Block "${name}" cached with ID: ${blockId}`);
    } catch (error: unknown) {
      contextLogger.warn(
        `Failed to cache block "${name}": ${(error as Error).message}`,
      );
      // Continue without caching if it fails
    }

    return blockId;
  }

  private async buildModel(name: string): Promise<string> {
    const fileInfo = this.fileMap.get(`model:${name}`);

    if (!fileInfo) {
      throw new Error(
        `Model "${name}" not found. Available models: ${Array.from(
          this.fileMap.keys(),
        )
          .filter((k) => k.startsWith("model:"))
          .map((k) => k.replace("model:", ""))
          .join(", ")}`,
      );
    }

    const contextLogger = this.logger.child({
      model: name,
      operation: "build",
    });

    contextLogger.debug(`Building model from: ${fileInfo.filePath}`);

    const createModel = await import(fileInfo.filePath);
    const buildFunction = createModel.default;

    if (typeof buildFunction !== "function") {
      throw new Error(`Model "${name}" does not export a default function`);
    }

    const builder = await buildFunction(this.getContext());

    if (!(builder instanceof ModelBuilder)) {
      throw new Error(
        `Model "${name}" must return an instance of ModelBuilder`,
      );
    }

    fileInfo.builder = builder;

    const modelId = await builder.upsert();

    try {
      contextLogger.debug(`Caching model "${name}" with ID: ${modelId}`);

      await this.cache.set(`model:${name}`, {
        id: modelId,
        hash: builder.getHash(),
      });

      contextLogger.debug(`Model "${name}" cached with ID: ${modelId}`);
    } catch (error: unknown) {
      contextLogger.warn(
        `Failed to cache model "${name}": ${(error as Error).message}`,
      );
      // Continue without caching if it fails
    }

    return modelId;
  }

  private async discoverAllFiles() {
    const [blockFiles, modelFiles] = await Promise.all([
      glob(`${this.blocksPath}/**/*.{ts,js}`),
      glob(`${this.modelsPath}/**/*.{ts,js}`),
    ]);

    for (const file of blockFiles) {
      const name = path.basename(file, path.extname(file));
      this.fileMap.set(`block:${name}`, {
        name,
        type: "block",
        filePath: path.resolve(file),
        dependencies: new Set(),
      });
    }

    for (const file of modelFiles) {
      const name = path.basename(file, path.extname(file));
      this.fileMap.set(`model:${name}`, {
        name,
        type: "model",
        filePath: path.resolve(file),
        dependencies: new Set(),
      });
    }

    if (this.fileMap.size === 0) {
      this.logger.warn(
        `No blocks or models found. Please ensure you have files in "${this.blocksPath}" or "${this.modelsPath}".`,
      );
    } else {
      this.logger.debug(
        `Discovered ${blockFiles.length} blocks and ${modelFiles.length} models`,
      );
    }
  }

  private logExecutionSummary(results: PromiseSettledResult<string>[]) {
    const totalItems = results.length;
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;
    const fromCache = this.builtFromCache.size;
    const actuallyBuilt = successful - fromCache;

    const blocks = Array.from(this.fileMap.values()).filter(
      (f) => f.type === "block",
    );
    const models = Array.from(this.fileMap.values()).filter(
      (f) => f.type === "model",
    );

    const blocksFromCache = Array.from(this.builtFromCache).filter((key) =>
      key.startsWith("block:"),
    ).length;
    const modelsFromCache = Array.from(this.builtFromCache).filter((key) =>
      key.startsWith("model:"),
    ).length;

    this.logger.info("=== Execution Summary ===");
    this.logger.info(`Total items processed: ${totalItems}`);
    this.logger.info(`Successful: ${successful} | Failed: ${failed}`);
    this.logger.info(
      `Built from cache: ${fromCache} | Actually built: ${actuallyBuilt}`,
    );
    this.logger.info(
      `Blocks: ${blocks.length} total (${blocksFromCache} cached, ${blocks.length - blocksFromCache} built)`,
    );
    this.logger.info(
      `Models: ${models.length} total (${modelsFromCache} cached, ${models.length - modelsFromCache} built)`,
    );

    if (failed > 0) {
      this.logger.warn(`⚠️  ${failed} item(s) failed to build`);
    }

    if (fromCache > 0) {
      this.logger.info(`⚡ ${fromCache} item(s) loaded from cache`);
    }

    if (actuallyBuilt > 0) {
      this.logger.info(`🔨 ${actuallyBuilt} item(s) built successfully`);
    }
  }
}
