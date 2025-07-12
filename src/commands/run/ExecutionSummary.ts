import type { ConsoleLogger } from "../../logger";
import type { BuildResult, FileInfo } from "./types";

export class ExecutionSummary {
  constructor(private logger: ConsoleLogger) {}

  logSummary(results: BuildResult[], fileMap: Map<string, FileInfo>): void {
    const totalItems = results.length;
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const fromCache = results.filter((r) => r.success && r.fromCache).length;
    const actuallyBuilt = successful - fromCache;

    const blocks = Array.from(fileMap.values()).filter(
      (f) => f.type === "block",
    );
    const models = Array.from(fileMap.values()).filter(
      (f) => f.type === "model",
    );

    const blocksFromCache = results.filter(
      (r) => r.success && r.fromCache && r.type === "block",
    ).length;
    const modelsFromCache = results.filter(
      (r) => r.success && r.fromCache && r.type === "model",
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
