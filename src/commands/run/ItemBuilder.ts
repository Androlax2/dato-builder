import BlockBuilder from "../../BlockBuilder";
import type { ItemTypeCacheManager } from "../../cache/ItemTypeCacheManager";
import type { ConsoleLogger } from "../../logger";
import ModelBuilder from "../../ModelBuilder";
import type { BuilderContext } from "../../types/BuilderContext";
import type { FileInfo } from "./types";

export class ItemBuilder {
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

    // Try to use cache first
    const cachedResult = await this.tryUseCache(fileInfo, contextLogger);
    if (cachedResult) {
      return { id: cachedResult, fromCache: true };
    }

    // Build the item
    const id = await this.buildFromSource(fileInfo, contextLogger);
    return { id, fromCache: false };
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
    const moduleExports = await import(fileInfo.filePath);
    const buildFunction = moduleExports.default;

    if (typeof buildFunction !== "function") {
      throw new Error(
        `${fileInfo.type} "${fileInfo.name}" does not export a default function`,
      );
    }

    const builder = await buildFunction(this.getContext());

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

    return builder.getHash();
  }

  private async buildFromSource(
    fileInfo: FileInfo,
    logger: ConsoleLogger,
  ): Promise<string> {
    logger.debug(`Building ${fileInfo.type} from: ${fileInfo.filePath}`);

    const moduleExports = await import(fileInfo.filePath);
    const buildFunction = moduleExports.default;

    if (typeof buildFunction !== "function") {
      throw new Error(
        `${fileInfo.type} "${fileInfo.name}" does not export a default function`,
      );
    }

    const builder = await buildFunction(this.getContext());

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

    const id = await builder.upsert();

    // Cache the result
    await this.cacheResult(fileInfo, id, builder, logger);

    return id;
  }

  private async cacheResult(
    fileInfo: FileInfo,
    id: string,
    builder: BlockBuilder | ModelBuilder,
    logger: ConsoleLogger,
  ): Promise<void> {
    try {
      const cacheKey = `${fileInfo.type}:${fileInfo.name}`;

      logger.debug(
        `Caching ${fileInfo.type} "${fileInfo.name}" with ID: ${id}`,
      );

      await this.cache.set(cacheKey, {
        id,
        hash: builder.getHash(),
      });

      logger.debug(`${fileInfo.type} "${fileInfo.name}" cached with ID: ${id}`);
    } catch (error: unknown) {
      logger.warn(
        `Failed to cache ${fileInfo.type} "${fileInfo.name}": ${(error as Error).message}`,
      );
    }
  }
}
