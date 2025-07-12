import type { ConsoleLogger } from "../../logger";
import type { BuildResult, FileInfo } from "./types";

export class ExecutionSummary {
  constructor(private logger: ConsoleLogger) {
    this.logger.trace("Initializing ExecutionSummary");
  }

  logSummary(results: BuildResult[], fileMap: Map<string, FileInfo>): void {
    this.logger.traceJson("Starting execution summary calculation", {
      resultCount: results.length,
      fileMapSize: fileMap.size,
    });

    const totalItems = results.length;
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const fromCache = results.filter((r) => r.success && r.fromCache).length;
    const actuallyBuilt = successful - fromCache;

    this.logger.traceJson("Basic statistics calculated", {
      totalItems,
      successful,
      failed,
      fromCache,
      actuallyBuilt,
    });

    const blocks = Array.from(fileMap.values()).filter(
      (f) => f.type === "block",
    );
    const models = Array.from(fileMap.values()).filter(
      (f) => f.type === "model",
    );

    this.logger.traceJson("File type breakdown", {
      blocks: blocks.length,
      models: models.length,
    });

    const blocksFromCache = results.filter(
      (r) => r.success && r.fromCache && r.type === "block",
    ).length;
    const modelsFromCache = results.filter(
      (r) => r.success && r.fromCache && r.type === "model",
    ).length;

    this.logger.traceJson("Cache breakdown by type", {
      blocksFromCache,
      modelsFromCache,
    });

    this.logger.trace("Logging execution summary");
    this.logger.info("=== Execution Summary ===");
    this.logger.info(`Total items processed: ${totalItems}`);
    this.logger.info(`Successful: ${successful} | Failed: ${failed}`);
    this.logger.info(
      `Built from cache: ${fromCache} | Actually built: ${actuallyBuilt}`,
    );
    this.logger.info(
      `Blocks: ${blocks.length} total (${blocksFromCache} cached, ${
        blocks.length - blocksFromCache
      } built)`,
    );
    this.logger.info(
      `Models: ${models.length} total (${modelsFromCache} cached, ${
        models.length - modelsFromCache
      } built)`,
    );

    if (failed > 0) {
      this.logger.traceJson("Logging failure summary", { failedCount: failed });
      this.logger.warn(`⚠️  ${failed} item(s) failed to build`);

      // Log details of failed items
      const failedItems = results.filter((r) => !r.success);
      failedItems.forEach((item) => {
        this.logger.traceJson("Failed item details", {
          type: item.type,
          name: item.name,
          error: item.error?.message,
        });
      });
    }

    if (fromCache > 0) {
      this.logger.traceJson("Logging cache summary", {
        fromCacheCount: fromCache,
      });
      this.logger.info(`⚡ ${fromCache} item(s) loaded from cache`);
    }

    if (actuallyBuilt > 0) {
      this.logger.traceJson("Logging build summary", {
        actuallyBuiltCount: actuallyBuilt,
      });
      this.logger.info(`🔨 ${actuallyBuilt} item(s) built successfully`);
    }

    this.logger.trace("Execution summary completed");
  }
}
