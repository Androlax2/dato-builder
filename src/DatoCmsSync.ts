import fs from "node:fs/promises";
import path from "node:path";
import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { buildClient } from "@datocms/cma-client-node";
import { confirm } from "@inquirer/prompts";
import { FileGenerationService } from "@/FileGeneration/FileGenerationService";
import DatoApi from "./Api/DatoApi";
import type { CacheManager } from "./cache/CacheManager";
import type { ConsoleLogger } from "./logger";
import type { DatoBuilderConfig } from "./types/DatoBuilderConfig";

// TODO: When everything is stable, make this be able to run in concurrent mode like the run command

export interface SyncOptions {
  config: Required<DatoBuilderConfig>;
  cache: CacheManager;
  logger: ConsoleLogger;
  dryRun?: boolean;
  force?: boolean;
}

export class DatoCmsSync {
  private readonly api: DatoApi;
  private readonly logger: ConsoleLogger;
  private readonly config: Required<DatoBuilderConfig>;
  private readonly cache: CacheManager;
  private readonly fileGenerationService: FileGenerationService;

  constructor(options: SyncOptions) {
    this.config = options.config;
    this.logger = options.logger;
    this.cache = options.cache;
    this.api = new DatoApi(buildClient({ apiToken: this.config.apiToken }));
    this.fileGenerationService = new FileGenerationService();
  }

  /**
   * Fetch all item types from DatoCMS
   */
  async fetchItemTypes() {
    this.logger.trace("Fetching item types from DatoCMS");

    try {
      const response = await this.api.call(() =>
        this.api.client.itemTypes.list(),
      );
      this.logger.debug(`Fetched ${response.length} item types from DatoCMS`);
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to fetch item types: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Fetch fields for a specific item type
   */
  async fetchFields(itemTypeId: string) {
    this.logger.trace(`Fetching fields for item type: ${itemTypeId}`);

    try {
      const fields = await this.api.call(() =>
        this.api.client.fields.list(itemTypeId),
      );
      this.logger.trace(
        `Fetched ${fields.length} fields for item type: ${itemTypeId}`,
      );
      return fields;
    } catch (error) {
      this.logger.error(
        `Failed to fetch fields for item type ${itemTypeId}: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Separate blocks and models from item types
   */
  private categorizeItemTypes(itemTypes: ItemType[]) {
    const blocks = itemTypes.filter((item) => item.modular_block);
    const models = itemTypes.filter((item) => !item.modular_block);

    this.logger.debug(
      `Categorized ${blocks.length} blocks and ${models.length} models`,
    );

    return { blocks, models };
  }

  /**
   * Check if sync is needed based on cache
   */
  private async shouldSync(
    itemType: ItemType,
    fields: Field[],
    force: boolean,
  ): Promise<boolean> {
    if (force) {
      this.logger.trace(`Force sync enabled for ${itemType.api_key}`);
      return true;
    }

    const cacheKey = `sync:${itemType.api_key}`;
    const cached = this.cache.get(cacheKey);

    if (!cached) {
      this.logger.trace(`No cache found for ${itemType.api_key}`);
      return true;
    }

    // Create a hash of the current state
    const currentHash = this.createHash({ itemType, fields });

    if (currentHash !== cached.hash) {
      this.logger.trace(`Hash mismatch for ${itemType.api_key}, sync needed`);
      return true;
    }

    this.logger.trace(`Cache hit for ${itemType.api_key}, skipping sync`);
    return false;
  }

  /**
   * Create a hash for caching purposes
   */
  private createHash(data: { itemType: ItemType; fields: Field[] }): string {
    const crypto = require("node:crypto");
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(data))
      .digest("hex");
  }

  /**
   * Update cache after successful sync
   */
  private async updateCache(itemType: ItemType, fields: Field[]) {
    const cacheKey = `sync:${itemType.api_key}`;
    const hash = this.createHash({ itemType, fields });

    await this.cache.set(cacheKey, {
      id: itemType.id,
      hash,
    });

    this.logger.trace(`Updated cache for ${itemType.api_key}`);
  }

  /**
   * Main sync method
   */
  async sync(
    options: { dryRun?: boolean; force?: boolean } = {},
  ): Promise<void> {
    this.logger.info("Starting sync from DatoCMS to local files");

    try {
      // Fetch all item types
      const itemTypes = await this.fetchItemTypes();

      if (itemTypes.length === 0) {
        this.logger.warn("No item types found in DatoCMS");
        return;
      }

      // Set item type references for the file generator
      this.fileGenerationService.setItemTypeReferences(itemTypes);

      // Categorize into blocks and models
      const { blocks, models } = this.categorizeItemTypes(itemTypes);

      this.logger.info(
        `Found ${blocks.length} blocks and ${models.length} models`,
      );

      // Process blocks
      if (blocks.length > 0) {
        this.logger.info("Processing blocks...");
        await this.processItemTypes(blocks, "block", options);
      }

      // Process models
      if (models.length > 0) {
        this.logger.info("Processing models...");
        await this.processItemTypes(models, "model", options);
      }

      this.logger.success("Sync completed successfully!");
    } catch (error) {
      this.logger.error(`Sync failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Process a list of item types (blocks or models)
   */
  private async processItemTypes(
    itemTypes: ItemType[],
    type: "block" | "model",
    options: { dryRun?: boolean; force?: boolean },
  ): Promise<void> {
    const results = [];

    for (const itemType of itemTypes) {
      try {
        this.logger.debug(
          `Processing ${type}: ${itemType.name} (${itemType.api_key})`,
        );

        // Fetch fields for this item type
        const fields = await this.fetchFields(itemType.id);

        // Check if sync is needed
        const needsSync = await this.shouldSync(
          itemType,
          fields,
          options.force || false,
        );

        if (!needsSync) {
          this.logger.debug(
            `Skipping ${itemType.api_key} - no changes detected`,
          );
          continue;
        }

        if (options.dryRun) {
          this.logger.info(`[DRY RUN] Would sync ${type}: ${itemType.name}`);
          results.push({ type, name: itemType.name, action: "would-sync" });
          continue;
        }

        // TODO: Remove, this is a temporary check for specific API keys
        if (
          itemType.id !== "L8wgPpIdTSec3IjocdW5Dg" &&
          itemType.id !== "Fw5taMrIRT-x5WLMlpsVvw"
        ) {
          continue;
        }

        // Generate file content
        const fileContent = await this.fileGenerationService.generateFile({
          itemType,
          fields,
          type,
        });

        // Determine file path
        const filePath = this.getFilePath(itemType, type);

        // Ensure directory exists
        await fs.mkdir(path.dirname(filePath), { recursive: true });

        // Write file
        await fs.writeFile(filePath, fileContent, "utf8");

        // Update cache
        await this.updateCache(itemType, fields);

        this.logger.success(`Generated ${type}: ${filePath}`);
        results.push({ type, name: itemType.name, action: "synced", filePath });
      } catch (error) {
        this.logger.error(
          `Failed to process ${type} ${itemType.name}: ${(error as Error).message}`,
        );
        results.push({
          type,
          name: itemType.name,
          action: "failed",
          error: (error as Error).message,
        });
      }
    }

    // Summary
    const synced = results.filter((r) => r.action === "synced").length;
    const failed = results.filter((r) => r.action === "failed").length;
    const skipped = itemTypes.length - synced - failed;

    this.logger.info(
      `${type.charAt(0).toUpperCase() + type.slice(1)} summary: ${synced} synced, ${skipped} skipped, ${failed} failed`,
    );
  }

  /**
   * Get the file path for an item type
   */
  private getFilePath(itemType: ItemType, type: "block" | "model"): string {
    const basePath =
      type === "block"
        ? this.config.syncBlocksPath
        : this.config.syncModelsPath;
    const fileName = `${this.toPascalCase(itemType.name)}.ts`;
    return path.resolve(process.cwd(), basePath, fileName);
  }

  /**
   * Convert string to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  }

  /**
   * Ask user for confirmation before proceeding
   */
  async confirmSync(force: boolean = false): Promise<boolean> {
    if (force) {
      return true;
    }

    return confirm({
      message:
        "This will overwrite existing local files. Are you sure you want to continue?",
      default: false,
    });
  }
}
