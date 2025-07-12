import type { ItemTypeCacheManager } from "../cache/ItemTypeCacheManager";
import type { ConsoleLogger } from "../logger";
import type { DatoBuilderConfig } from "../types/DatoBuilderConfig";
import { FileDiscoverer } from "./run/FileDiscover";
import type { FileInfo } from "./run/types";

interface ListCommandOptions {
  config: Required<DatoBuilderConfig>;
  cache: ItemTypeCacheManager;
  logger: ConsoleLogger;
}

interface ItemInfo {
  name: string;
  type: "block" | "model";
  filePath: string;
  cached: boolean;
  cacheId?: string;
  status: "available" | "cached" | "stale";
}

export class ListCommand {
  private readonly config: Required<DatoBuilderConfig>;
  private readonly cache: ItemTypeCacheManager;
  private readonly logger: ConsoleLogger;
  private readonly fileDiscoverer: FileDiscoverer;

  constructor({ config, cache, logger }: ListCommandOptions) {
    this.config = config;
    this.cache = cache;
    this.logger = logger;

    this.fileDiscoverer = new FileDiscoverer(
      this.config.blocksPath,
      this.config.modelsPath,
      logger,
    );
  }

  public async execute(
    options: {
      format?: "table" | "json" | "simple";
      type?: "blocks" | "models" | "all";
      showCached?: boolean;
    } = {},
  ): Promise<void> {
    const { format = "table", type = "all", showCached = true } = options;

    this.logger.info("Discovering available items...");

    const fileMap = await this.fileDiscoverer.discoverFiles();
    const items = await this.buildItemList(fileMap, showCached);

    // Filter by type if specified
    const filteredItems = this.filterItemsByType(items, type);

    if (filteredItems.length === 0) {
      this.logger.info(`No ${type} found.`);
      return;
    }

    // Display results
    switch (format) {
      case "json":
        this.displayAsJson(filteredItems);
        break;
      case "simple":
        this.displayAsSimple(filteredItems);
        break;
      default:
        this.displayAsTable(filteredItems);
        break;
    }

    // Show summary
    this.displaySummary(filteredItems);
  }

  private async buildItemList(
    fileMap: Map<string, FileInfo>,
    showCached: boolean,
  ): Promise<ItemInfo[]> {
    const items: ItemInfo[] = [];
    const processedNames = new Set<string>();

    // Process files from disk
    for (const [, fileInfo] of fileMap) {
      const cacheKey = `${fileInfo.type}:${fileInfo.name}`;
      const cached = this.cache.get(cacheKey);

      const item: ItemInfo = {
        name: fileInfo.name,
        type: fileInfo.type,
        filePath: fileInfo.filePath,
        cached: !!cached,
        cacheId: cached?.id,
        status: cached ? "cached" : "available",
      };

      items.push(item);
      processedNames.add(cacheKey);
    }

    // Add cached items that don't have corresponding files (if requested)
    if (showCached) {
      for (const cacheKey of this.cache.keys()) {
        if (!processedNames.has(cacheKey)) {
          const [type, name] = cacheKey.split(":", 2);
          if (type === "block" || type === "model") {
            const cached = this.cache.get(cacheKey);

            items.push({
              name,
              type: type as "block" | "model",
              filePath: "(cached only)",
              cached: true,
              cacheId: cached?.id,
              status: "stale", // File exists in cache but not on disk
            });
          }
        }
      }
    }

    return items.sort((a, b) => {
      // Sort by type first, then by name
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      return a.name.localeCompare(b.name);
    });
  }

  private filterItemsByType(
    items: ItemInfo[],
    type: "blocks" | "models" | "all",
  ): ItemInfo[] {
    if (type === "all") {
      return items;
    }

    const targetType = type === "blocks" ? "block" : "model";
    return items.filter((item) => item.type === targetType);
  }

  private displayAsTable(items: ItemInfo[]): void {
    this.logger.trace("Displaying items as table", { itemCount: items.length });

    // Group by type for better organization
    const blocks = items.filter((item) => item.type === "block");
    const models = items.filter((item) => item.type === "model");

    if (blocks.length > 0) {
      this.logger.info("\n📦 BLOCKS:");
      this.displayItemTable(blocks);
    }

    if (models.length > 0) {
      this.logger.info("\n🏗️  MODELS:");
      this.displayItemTable(models);
    }
  }

  private displayItemTable(items: ItemInfo[]): void {
    this.logger.trace("Displaying items as table", { itemCount: items.length });

    // Calculate column widths
    const nameWidth = Math.max(4, ...items.map((item) => item.name.length));
    const statusWidth = Math.max(6, ...items.map((item) => item.status.length));
    const idWidth = Math.max(
      2,
      ...items.map((item) => item.cacheId?.length || 2),
    );

    // Header
    const header = `  ${"NAME".padEnd(nameWidth)} | ${"STATUS".padEnd(
      statusWidth,
    )} | ${"ID".padEnd(idWidth)} | PATH`;
    const separator = `  ${"-".repeat(nameWidth)}-+-${"-".repeat(
      statusWidth,
    )}-+-${"-".repeat(idWidth)}-+-${"-".repeat(20)}`;

    this.logger.info(header);
    this.logger.info(separator);

    // Rows
    items.forEach((item) => {
      const statusIcon = this.getStatusIcon(item.status);
      const status = `${statusIcon} ${item.status}`.padEnd(statusWidth);
      const id = (item.cacheId || "--").padEnd(idWidth);

      this.logger.info(
        `  ${item.name.padEnd(nameWidth)} | ${status} | ${id} | ${
          item.filePath
        }`,
      );
    });
  }

  private displayAsSimple(items: ItemInfo[]): void {
    this.logger.trace("Displaying items as simple list", {
      itemCount: items.length,
    });

    const blocks = items.filter((item) => item.type === "block");
    const models = items.filter((item) => item.type === "model");

    if (blocks.length > 0) {
      this.logger.info("\nBlocks:");
      blocks.forEach((item) => {
        const status = this.getStatusIcon(item.status);
        this.logger.info(`  ${status} ${item.name}`);
      });
    }

    if (models.length > 0) {
      this.logger.info("\nModels:");
      models.forEach((item) => {
        const status = this.getStatusIcon(item.status);
        this.logger.info(`  ${status} ${item.name}`);
      });
    }
  }

  private displayAsJson(items: ItemInfo[]): void {
    this.logger.trace("Displaying items as JSON", { itemCount: items.length });

    const output = {
      blocks: items.filter((item) => item.type === "block"),
      models: items.filter((item) => item.type === "model"),
      total: items.length,
    };

    this.logger.info(JSON.stringify(output, null, 2));
  }

  private displaySummary(items: ItemInfo[]): void {
    const blocks = items.filter((item) => item.type === "block");
    const models = items.filter((item) => item.type === "model");
    const cached = items.filter((item) => item.cached);
    const stale = items.filter((item) => item.status === "stale");

    this.logger.info(`\n${"=".repeat(50)}`);
    this.logger.info("📊 SUMMARY:");
    this.logger.info(`   Total items: ${items.length}`);
    this.logger.info(`   Blocks: ${blocks.length}`);
    this.logger.info(`   Models: ${models.length}`);
    this.logger.info(`   Cached: ${cached.length}`);

    if (stale.length > 0) {
      this.logger.warn(`   Stale (cached but no file): ${stale.length}`);
    }

    this.logger.info("=".repeat(50));
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case "cached":
        return "✅";
      case "available":
        return "📄";
      case "stale":
        return "⚠️";
      default:
        return "❓";
    }
  }
}
