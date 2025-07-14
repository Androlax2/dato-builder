import inquirer from "inquirer";
import type DatoApi from "../../Api/DatoApi";
import type { CacheManager } from "../../cache/CacheManager";
import type { ConsoleLogger } from "../../logger";
import type { DeletionCandidate, DeletionSummary } from "./DeletionDetector";

export interface DeletionResult {
  success: boolean;
  candidate: DeletionCandidate;
  error?: Error;
}

export interface DeletionOptions {
  confirmEach?: boolean;
  confirmAll?: boolean;
  skipConfirmation?: boolean;
}

export class DeletionManager {
  constructor(
    private readonly api: DatoApi,
    private readonly cache: CacheManager,
    private readonly logger: ConsoleLogger,
  ) {
    this.logger.trace("Initializing DeletionManager");
  }

  public displayDeletionSummary(summary: DeletionSummary): void {
    if (summary.total === 0) {
      this.logger.info("No items to delete - all files match the cache.");
      return;
    }

    this.logger.info(
      `\n  Found ${summary.total} item(s) to delete from DatoCMS:`,
    );

    if (summary.blocks.length > 0) {
      this.logger.info(`\n Blocks (${summary.blocks.length}):`);
      for (const block of summary.blocks) {
        this.logger.info(`  - ${block.name} (${block.id})`);
      }
    }

    if (summary.models.length > 0) {
      this.logger.info(`\n Models (${summary.models.length}):`);
      for (const model of summary.models) {
        this.logger.info(`  - ${model.name} (${model.id})`);
      }
    }

    this.logger.info(
      "\n  These items exist in DatoCMS but their corresponding files have been deleted locally.",
    );
  }

  public displayUnsafeDeletions(
    unsafe: Array<DeletionCandidate & { usedBy: string[] }>,
  ): void {
    if (unsafe.length === 0) {
      return;
    }

    this.logger.warn(
      `\n  Warning: ${unsafe.length} item(s) cannot be safely deleted as they are still referenced:`,
    );

    for (const item of unsafe) {
      this.logger.warn(`  - ${item.type}: ${item.name}`);
      this.logger.warn(`    Used by: ${item.usedBy.join(", ")}`);
    }

    this.logger.warn(
      "\nTo delete these items, first remove their dependencies or delete the files that reference them.",
    );
  }

  public async confirmDeletions(
    safe: DeletionCandidate[],
    options: DeletionOptions = {},
  ): Promise<DeletionCandidate[]> {
    if (options.skipConfirmation) {
      return safe;
    }

    if (safe.length === 0) {
      return [];
    }

    const choices = safe.map((candidate) => ({
      name: `${candidate.type}: ${candidate.name}`,
      value: candidate,
      checked: true,
    }));

    const { confirmedItems } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "confirmedItems",
        message: "Select items to delete from DatoCMS:",
        choices,
      },
    ]);

    return confirmedItems;
  }

  public async deleteCandidates(
    candidates: DeletionCandidate[],
  ): Promise<DeletionResult[]> {
    if (candidates.length === 0) {
      return [];
    }

    this.logger.info(
      `\n️  Deleting ${candidates.length} item(s) from DatoCMS...`,
    );

    const results: DeletionResult[] = [];

    for (const candidate of candidates) {
      try {
        this.logger.info(`Deleting ${candidate.type}: ${candidate.name}`);

        await this.api.call(() =>
          this.api.client.itemTypes.destroy(candidate.id),
        );

        await this.cache.delete(candidate.key);

        results.push({
          success: true,
          candidate,
        });

        this.logger.success(`Deleted ${candidate.type}: ${candidate.name}`);
      } catch (error) {
        const err = error as Error;
        results.push({
          success: false,
          candidate,
          error: err,
        });

        this.logger.error(
          `Failed to delete ${candidate.type}: ${candidate.name} - ${err.message}`,
        );
      }
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    this.logger.info(
      `\n Deletion summary: ${successful} successful, ${failed} failed`,
    );

    return results;
  }

  public async handleDeletions(
    summary: DeletionSummary,
    safe: DeletionCandidate[],
    unsafe: Array<DeletionCandidate & { usedBy: string[] }>,
    options: DeletionOptions = {},
  ): Promise<DeletionResult[]> {
    this.logger.trace("Starting deletion handling process");

    this.displayDeletionSummary(summary);

    this.displayUnsafeDeletions(unsafe);

    if (safe.length === 0) {
      this.logger.info("No items can be safely deleted at this time.");
      return [];
    }

    const confirmedDeletions = await this.confirmDeletions(safe, options);

    if (confirmedDeletions.length === 0) {
      this.logger.info("No deletions confirmed. Skipping deletion process.");
      return [];
    }

    return await this.deleteCandidates(confirmedDeletions);
  }
}
