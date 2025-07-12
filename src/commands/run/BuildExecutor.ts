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
  ) {}

  async executeBuild(
    fileMap: Map<string, FileInfo>,
    buildOrder: string[],
  ): Promise<BuildResult[]> {
    this.logger.debug(`Build order determined: ${buildOrder.join(" -> ")}`);

    const buildPromises = buildOrder.map(
      async (fileKey): Promise<BuildResult> => {
        const fileInfo = fileMap.get(fileKey);
        if (!fileInfo) {
          throw new Error(`File info not found for: ${fileKey}`);
        }

        try {
          const result = await this.getOrBuildItem(fileKey, fileInfo);
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

    return Promise.all(buildPromises);
  }

  public async getOrBuildItem(
    fileKey: string,
    fileInfo: FileInfo,
  ): Promise<{ id: string; fromCache: boolean }> {
    // Return existing promise if currently building
    const existingPromise = this.buildPromises.get(fileKey);
    if (existingPromise) {
      return existingPromise;
    }

    // Create new build promise
    const buildPromise = this.itemBuilder.buildItem(fileInfo);
    this.buildPromises.set(fileKey, buildPromise);

    try {
      return await buildPromise;
    } finally {
      this.buildPromises.delete(fileKey);
    }
  }
}
