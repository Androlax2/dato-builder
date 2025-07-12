import type { ConsoleLogger } from "../../logger";
import type { ItemBuilder } from "./ItemBuilder";
import type { BuildResult, FileInfo } from "./types";

export class BuildExecutor {
  private buildPromises = new Map<
    string,
    Promise<{ id: string; fromCache: boolean }>
  >();

  constructor(
    private itemBuilder: ItemBuilder,
    private logger: ConsoleLogger,
  ) {
    this.logger.trace("Initializing BuildExecutor");
  }

  async executeBuild(
    fileMap: Map<string, FileInfo>,
    buildOrder: string[],
  ): Promise<BuildResult[]> {
    this.logger.traceJson("Starting build execution", {
      fileCount: fileMap.size,
      buildOrderLength: buildOrder.length,
    });
    this.logger.debug(`Build order determined: ${buildOrder.join(" -> ")}`);

    this.logger.trace("Creating build promises for all items");
    const buildPromises = buildOrder.map(
      async (fileKey): Promise<BuildResult> => {
        this.logger.traceJson("Processing build item", { fileKey });

        const fileInfo = fileMap.get(fileKey);
        if (!fileInfo) {
          this.logger.errorJson("File info not found", { fileKey });
          throw new Error(`File info not found for: ${fileKey}`);
        }

        this.logger.traceJson("Building item", {
          type: fileInfo.type,
          name: fileInfo.name,
          filePath: fileInfo.filePath,
        });

        try {
          const result = await this.getOrBuildItem(fileKey, fileInfo);
          this.logger.traceJson("Item built successfully", {
            type: fileInfo.type,
            name: fileInfo.name,
            id: result.id,
            fromCache: result.fromCache,
          });

          return {
            name: fileInfo.name,
            type: fileInfo.type,
            id: result.id,
            fromCache: result.fromCache,
            success: true,
          };
        } catch (error: unknown) {
          const err = error as Error;
          this.logger.error(
            `Failed to build ${fileInfo.type} "${fileInfo.name}": ${err.message}`,
          );
          this.logger.traceJson("Build failed", {
            type: fileInfo.type,
            name: fileInfo.name,
            error: err.message,
            stack: err.stack,
          });

          return {
            name: fileInfo.name,
            type: fileInfo.type,
            id: "",
            fromCache: false,
            success: false,
            error: err,
          };
        }
      },
    );

    this.logger.trace("Executing all build promises");
    const results = await Promise.all(buildPromises);

    this.logger.traceJson("Build execution completed", {
      totalResults: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      fromCache: results.filter((r) => r.fromCache).length,
    });

    return results;
  }

  public async getOrBuildItem(
    fileKey: string,
    fileInfo: FileInfo,
  ): Promise<{ id: string; fromCache: boolean }> {
    this.logger.traceJson("Getting or building item", {
      fileKey,
      type: fileInfo.type,
      name: fileInfo.name,
    });

    // Return existing promise if currently building
    const existingPromise = this.buildPromises.get(fileKey);
    if (existingPromise) {
      this.logger.traceJson("Found existing build promise", { fileKey });
      return existingPromise;
    }

    this.logger.traceJson("Creating new build promise", { fileKey });
    // Create new build promise
    const buildPromise = this.itemBuilder.buildItem(fileInfo);
    this.buildPromises.set(fileKey, buildPromise);

    try {
      const result = await buildPromise;
      this.logger.traceJson("Build promise completed", {
        fileKey,
        id: result.id,
        fromCache: result.fromCache,
      });
      return result;
    } finally {
      this.logger.traceJson("Cleaning up build promise", { fileKey });
      this.buildPromises.delete(fileKey);
    }
  }
}
