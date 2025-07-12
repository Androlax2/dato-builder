import BlockBuilder from "../../BlockBuilder";
import type { ItemTypeCacheManager } from "../../cache/ItemTypeCacheManager";
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

export class ItemBuilder {
  // Cache for loaded modules to avoid repeated imports
  private moduleCache = new Map<string, any>();

  // Cache for computed hashes to avoid recomputation
  private hashCache = new Map<string, string>();

  constructor(
    private cache: ItemTypeCacheManager,
    private logger: ConsoleLogger,
    private getContext: () => BuilderContext,
  ) {}

  async buildItem(
    fileInfo: FileInfo,
  ): Promise<{ id: string; fromCache: boolean }> {
    const contextLogger = this.logger.child({
      [fileInfo.type]: fileInfo.name,
      operation: "build",
    });

    try {
      // Try to use cache first
      const cachedResult = await this.tryUseCache(fileInfo, contextLogger);
      if (cachedResult) {
        return { id: cachedResult, fromCache: true };
      }

      // Build the item
      const id = await this.buildFromSource(fileInfo, contextLogger);
      return { id, fromCache: false };
    } catch (error) {
      throw new ItemBuildError(
        `Failed to build ${fileInfo.type} "${fileInfo.name}": ${(error as Error).message}`,
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
    const cacheKey = `${fileInfo.type}:${fileInfo.name}`;
    const cached = this.cache.get(cacheKey);

    if (!cached) {
      return null;
    }

    try {
      const currentHash = await this.computeHash(fileInfo);

      if (currentHash === cached.hash) {
        logger.debug(
          `Using cached ${fileInfo.type} ID: ${cached.id} (hash match)`,
        );
        return cached.id;
      } else {
        logger.debug(
          `Cache invalidated for ${fileInfo.type} "${fileInfo.name}" (hash mismatch)`,
        );
        // Clear hash cache since it's stale
        this.hashCache.delete(fileInfo.filePath);
        return null;
      }
    } catch (error: unknown) {
      logger.warn(
        `Failed to verify cache for ${fileInfo.type} "${fileInfo.name}": ${(error as Error).message}`,
      );
      return null;
    }
  }

  private async computeHash(fileInfo: FileInfo): Promise<string> {
    // Check hash cache first
    const cachedHash = this.hashCache.get(fileInfo.filePath);
    if (cachedHash) {
      return cachedHash;
    }

    const builder = await this.loadAndValidateBuilder(fileInfo);
    const hash = builder.getHash();

    // Cache the hash
    this.hashCache.set(fileInfo.filePath, hash);

    return hash;
  }

  private async buildFromSource(
    fileInfo: FileInfo,
    logger: ConsoleLogger,
  ): Promise<string> {
    logger.debug(`Building ${fileInfo.type} from: ${fileInfo.filePath}`);

    const builder = await this.loadAndValidateBuilder(fileInfo);
    const id = await builder.upsert();

    // Cache the result
    await this.cacheResult(fileInfo, id, builder, logger);

    return id;
  }

  private async loadAndValidateBuilder(
    fileInfo: FileInfo,
  ): Promise<BlockBuilder | ModelBuilder> {
    // Load module (with caching)
    const moduleExports = await this.loadModule(fileInfo.filePath);
    const buildFunction = moduleExports.default;

    if (typeof buildFunction !== "function") {
      throw new Error(
        `${fileInfo.type} "${fileInfo.name}" does not export a default function`,
      );
    }

    // Execute build function
    const builder = await buildFunction(this.getContext());

    // Validate builder type
    this.validateBuilderType(fileInfo, builder);

    return builder;
  }

  private async loadModule(filePath: string): Promise<any> {
    // Check module cache first
    const cachedModule = this.moduleCache.get(filePath);
    if (cachedModule) {
      return cachedModule;
    }

    // Load and cache module
    const moduleExports = await import(filePath);
    this.moduleCache.set(filePath, moduleExports);

    return moduleExports;
  }

  private validateBuilderType(
    fileInfo: FileInfo,
    builder: any,
  ): asserts builder is BlockBuilder | ModelBuilder {
    if (fileInfo.type === "block" && !(builder instanceof BlockBuilder)) {
      throw new Error(
        `Block "${fileInfo.name}" must return an instance of BlockBuilder`,
      );
    }

    if (fileInfo.type === "model" && !(builder instanceof ModelBuilder)) {
      throw new Error(
        `Model "${fileInfo.name}" must return an instance of ModelBuilder`,
      );
    }
  }

  private async cacheResult(
    fileInfo: FileInfo,
    id: string,
    builder: BlockBuilder | ModelBuilder,
    logger: ConsoleLogger,
  ): Promise<void> {
    try {
      const cacheKey = `${fileInfo.type}:${fileInfo.name}`;
      const hash = builder.getHash();

      logger.debug(
        `Caching ${fileInfo.type} "${fileInfo.name}" with ID: ${id}`,
      );

      await this.cache.set(cacheKey, { id, hash });

      // Update hash cache
      this.hashCache.set(fileInfo.filePath, hash);

      logger.debug(`${fileInfo.type} "${fileInfo.name}" cached with ID: ${id}`);
    } catch (error: unknown) {
      logger.warn(
        `Failed to cache ${fileInfo.type} "${fileInfo.name}": ${(error as Error).message}`,
      );
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
