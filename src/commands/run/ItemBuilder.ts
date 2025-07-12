import BlockBuilder from "../../BlockBuilder";
import type { CacheManager } from "../../cache/CacheManager";
import type { ConsoleLogger } from "../../logger";
import ModelBuilder from "../../ModelBuilder";
import type { BuilderContext } from "../../types/BuilderContext";
import type { FileInfo } from "./types";

export class ItemBuildError extends Error {
  constructor(
    message: string,
    public readonly itemType: string,
    public readonly itemName: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "ItemBuildError";
  }
}

/**
 * TODO: Persist the cache between runs
 */
export class ItemBuilder {
  // Cache for loaded modules to avoid repeated imports
  private moduleCache = new Map<string, any>();

  // Cache for computed hashes to avoid recomputation
  private hashCache = new Map<string, string>();

  constructor(
    private cache: CacheManager,
    private logger: ConsoleLogger,
    private getContext: () => BuilderContext,
  ) {
    this.logger.trace("Initializing ItemBuilder");
  }

  async buildItem(
    fileInfo: FileInfo,
  ): Promise<{ id: string; fromCache: boolean }> {
    this.logger.traceJson("Starting item build", {
      type: fileInfo.type,
      name: fileInfo.name,
      filePath: fileInfo.filePath,
    });

    const contextLogger = this.logger.child({
      [fileInfo.type]: fileInfo.name,
      operation: "build",
    });

    try {
      // Try to use cache first
      this.logger.trace("Attempting to use cache");
      const cachedResult = await this.tryUseCache(fileInfo, contextLogger);
      if (cachedResult) {
        this.logger.traceJson("Using cached result", { id: cachedResult });
        return { id: cachedResult, fromCache: true };
      }

      // Build the item
      this.logger.trace("Cache miss, building from source");
      const id = await this.buildFromSource(fileInfo, contextLogger);
      this.logger.traceJson("Build completed successfully", { id });
      return { id, fromCache: false };
    } catch (error) {
      this.logger.errorJson("Item build failed", {
        type: fileInfo.type,
        name: fileInfo.name,
        error: (error as Error).message,
      });
      throw new ItemBuildError(
        `Failed to build ${fileInfo.type} "${fileInfo.name}": ${
          (error as Error).message
        }`,
        fileInfo.type,
        fileInfo.name,
        error as Error,
      );
    }
  }

  private async tryUseCache(
    fileInfo: FileInfo,
    logger: ConsoleLogger,
  ): Promise<string | null> {
    this.logger.traceJson("Checking cache for item", {
      type: fileInfo.type,
      name: fileInfo.name,
    });

    const cacheKey = `${fileInfo.type}:${fileInfo.name}`;
    const cached = this.cache.get(cacheKey);

    if (!cached) {
      this.logger.traceJson("No cached entry found", { cacheKey });
      return null;
    }

    this.logger.traceJson("Found cached entry", {
      cacheKey,
      cachedId: cached.id,
      cachedHash: `${cached.hash?.substring(0, 8)}...`,
    });

    try {
      this.logger.trace("Computing current hash for cache validation");
      const currentHash = await this.computeHash(fileInfo);

      if (currentHash === cached.hash) {
        logger.debug(
          `Using cached ${fileInfo.type} ID: ${cached.id} (hash match)`,
        );
        this.logger.traceJson("Cache validation successful", {
          hash: `${currentHash.substring(0, 8)}...`,
        });
        return cached.id;
      } else {
        logger.debug(
          `Cache invalidated for ${fileInfo.type} "${fileInfo.name}" (hash mismatch)`,
        );
        this.logger.traceJson("Cache validation failed", {
          currentHash: `${currentHash.substring(0, 8)}...`,
          cachedHash: `${cached.hash?.substring(0, 8)}...`,
        });
        // Clear hash cache since it's stale
        this.hashCache.delete(fileInfo.filePath);
        return null;
      }
    } catch (error: unknown) {
      logger.warn(
        `Failed to verify cache for ${fileInfo.type} "${fileInfo.name}": ${
          (error as Error).message
        }`,
      );
      this.logger.traceJson("Cache verification failed with error", {
        error: (error as Error).message,
      });
      return null;
    }
  }

  private async computeHash(fileInfo: FileInfo): Promise<string> {
    this.logger.traceJson("Computing hash for file", {
      filePath: fileInfo.filePath,
    });

    // Check hash cache first
    const cachedHash = this.hashCache.get(fileInfo.filePath);
    if (cachedHash) {
      this.logger.traceJson("Using cached hash", {
        filePath: fileInfo.filePath,
        hash: `${cachedHash.substring(0, 8)}...`,
      });
      return cachedHash;
    }

    this.logger.trace("Hash not in cache, computing from builder");
    const builder = await this.loadAndValidateBuilder(fileInfo);
    const hash = builder.getHash();

    // Cache the hash
    this.hashCache.set(fileInfo.filePath, hash);
    this.logger.traceJson("Hash computed and cached", {
      filePath: fileInfo.filePath,
      hash: `${hash.substring(0, 8)}...`,
    });

    return hash;
  }

  private async buildFromSource(
    fileInfo: FileInfo,
    logger: ConsoleLogger,
  ): Promise<string> {
    this.logger.traceJson("Building from source", {
      type: fileInfo.type,
      name: fileInfo.name,
      filePath: fileInfo.filePath,
    });
    logger.debug(`Building ${fileInfo.type} from: ${fileInfo.filePath}`);

    const builder = await this.loadAndValidateBuilder(fileInfo);
    this.logger.trace("Builder loaded and validated, calling upsert");

    const id = await builder.upsert();
    this.logger.traceJson("Upsert completed", { id });

    // Cache the result
    this.logger.trace("Caching build result");
    await this.cacheResult(fileInfo, id, builder, logger);

    return id;
  }

  private async loadAndValidateBuilder(
    fileInfo: FileInfo,
  ): Promise<BlockBuilder | ModelBuilder> {
    this.logger.traceJson("Loading and validating builder", {
      type: fileInfo.type,
      name: fileInfo.name,
      filePath: fileInfo.filePath,
    });

    // Load module (with caching)
    this.logger.trace("Loading module");
    const moduleExports = await this.loadModule(fileInfo.filePath);
    const buildFunction = moduleExports.default;

    if (typeof buildFunction !== "function") {
      this.logger.errorJson("Module does not export default function", {
        filePath: fileInfo.filePath,
      });
      throw new Error(
        `${fileInfo.type} "${fileInfo.name}" does not export a default function`,
      );
    }

    this.logger.trace("Executing build function");
    // Execute build function
    const builder = await buildFunction(this.getContext());

    this.logger.trace("Validating builder type");
    // Validate builder type
    this.validateBuilderType(fileInfo, builder);

    this.logger.traceJson("Builder loaded and validated successfully", {
      type: fileInfo.type,
      name: fileInfo.name,
      builderType: builder.constructor.name,
    });
    return builder;
  }

  private async loadModule(filePath: string): Promise<any> {
    this.logger.traceJson("Loading module", { filePath });

    // Check module cache first
    const cachedModule = this.moduleCache.get(filePath);
    if (cachedModule) {
      this.logger.traceJson("Using cached module", { filePath });
      return cachedModule;
    }

    this.logger.traceJson("Module not in cache, importing", { filePath });
    // Load and cache module
    const moduleExports = await import(filePath);
    this.moduleCache.set(filePath, moduleExports);
    this.logger.traceJson("Module imported and cached", {
      filePath,
      exportKeys: Object.keys(moduleExports),
    });

    return moduleExports;
  }

  private validateBuilderType(
    fileInfo: FileInfo,
    builder: any,
  ): asserts builder is BlockBuilder | ModelBuilder {
    this.logger.traceJson("Validating builder type", {
      type: fileInfo.type,
      name: fileInfo.name,
      builderType: builder?.constructor?.name,
    });

    if (fileInfo.type === "block" && !(builder instanceof BlockBuilder)) {
      this.logger.errorJson("Invalid builder type for block", {
        expected: "BlockBuilder",
        actual: builder?.constructor?.name,
      });
      throw new Error(
        `Block "${fileInfo.name}" must return an instance of BlockBuilder`,
      );
    }

    if (fileInfo.type === "model" && !(builder instanceof ModelBuilder)) {
      this.logger.errorJson("Invalid builder type for model", {
        expected: "ModelBuilder",
        actual: builder?.constructor?.name,
      });
      throw new Error(
        `Model "${fileInfo.name}" must return an instance of ModelBuilder`,
      );
    }

    this.logger.trace("Builder type validation passed");
  }

  private async cacheResult(
    fileInfo: FileInfo,
    id: string,
    builder: BlockBuilder | ModelBuilder,
    logger: ConsoleLogger,
  ): Promise<void> {
    this.logger.traceJson("Caching build result", {
      type: fileInfo.type,
      name: fileInfo.name,
      id,
    });

    try {
      const cacheKey = `${fileInfo.type}:${fileInfo.name}`;
      const hash = builder.getHash();

      logger.debug(
        `Caching ${fileInfo.type} "${fileInfo.name}" with ID: ${id}`,
      );

      await this.cache.set(cacheKey, { id, hash });

      // Update hash cache
      this.hashCache.set(fileInfo.filePath, hash);

      this.logger.traceJson("Build result cached successfully", {
        cacheKey,
        id,
        hash: `${hash.substring(0, 8)}...`,
      });
    } catch (error) {
      this.logger.errorJson("Failed to cache build result", {
        type: fileInfo.type,
        name: fileInfo.name,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  public clearCaches(): void {
    this.moduleCache.clear();
    this.hashCache.clear();
  }

  public getCacheStats(): { moduleCache: number; hashCache: number } {
    return {
      moduleCache: this.moduleCache.size,
      hashCache: this.hashCache.size,
    };
  }
}
