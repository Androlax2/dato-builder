import path from "node:path";
import { ItemTypeCacheManager } from "./cache/ItemTypeCacheManager";
import { ListCommand } from "./commands/ListCommand";
import { RunCommand } from "./commands/run/RunCommand";
import { ConfigParser } from "./config/ConfigParser";
import { ConsoleLogger } from "./logger";
import type { DatoBuilderConfig } from "./types/DatoBuilderConfig";
import { getLogLevel } from "./utils/utils";

interface BaseCommandOptions {
  config: Required<DatoBuilderConfig>;
  cache: ItemTypeCacheManager;
  logger: ConsoleLogger;
  blocksPath?: string | null;
  modelsPath?: string | null;
}

export class DatoBuilderCLI {
  private readonly config: Required<DatoBuilderConfig>;
  private readonly cache: ItemTypeCacheManager;
  private readonly logger: ConsoleLogger;
  private readonly blocksPath?: string | null;
  private readonly modelsPath?: string | null;

  constructor(options: BaseCommandOptions) {
    this.config = options.config;
    this.cache = options.cache;
    this.logger = options.logger;
    this.blocksPath = options.blocksPath;
    this.modelsPath = options.modelsPath;
  }

  /**
   * Execute the build command
   */
  public async build(): Promise<void> {
    this.logger.info("🚀 Starting build process...");

    const runCommand = new RunCommand({
      config: this.config,
      cache: this.cache,
      logger: this.logger,
      blocksPath: this.blocksPath,
      modelsPath: this.modelsPath,
    });

    try {
      await runCommand.execute();
      this.logger.success("✅ Build completed successfully!");
    } catch (error) {
      this.logger.error(`❌ Build failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Execute the list command
   */
  public async list(
    options: {
      format?: "table" | "json" | "simple";
      type?: "blocks" | "models" | "all";
      showCached?: boolean;
    } = {},
  ): Promise<void> {
    const listCommand = new ListCommand({
      config: this.config,
      cache: this.cache,
      logger: this.logger,
      blocksPath: this.blocksPath,
      modelsPath: this.modelsPath,
    });

    await listCommand.execute(options);
  }

  /**
   * Clear all caches
   */
  public async clearCache(): Promise<void> {
    this.logger.info("🧹 Clearing all caches...");

    // Clear persistent cache
    await this.cache.clear();

    this.logger.success("✅ All caches cleared!");
  }

  /**
   * Get debug information
   */
  public async debug(): Promise<void> {
    this.logger.info("🔍 Gathering debug information...");

    const runCommand = new RunCommand({
      config: this.config,
      cache: this.cache,
      logger: this.logger,
      blocksPath: this.blocksPath,
      modelsPath: this.modelsPath,
    });

    const debugInfo = runCommand.getDebugInfo();

    console.log("\n📊 DEBUG INFORMATION:");
    console.log("=".repeat(50));
    console.log(`File Map Size: ${debugInfo.fileMapSize}`);
    console.log(`Module Cache Size: ${debugInfo.cacheStats.moduleCache}`);
    console.log(`Hash Cache Size: ${debugInfo.cacheStats.hashCache}`);
    console.log(`Available Blocks: ${debugInfo.availableBlocks.length}`);
    console.log(`Available Models: ${debugInfo.availableModels.length}`);
    console.log("=".repeat(50));

    if (debugInfo.availableBlocks.length > 0) {
      console.log("\n📦 Available Blocks:");
      debugInfo.availableBlocks.forEach((block) => console.log(`  - ${block}`));
    }

    if (debugInfo.availableModels.length > 0) {
      console.log("\n🏗️  Available Models:");
      debugInfo.availableModels.forEach((model) => console.log(`  - ${model}`));
    }
  }
}

// Example usage functions for different command patterns
export class BuildCommandRunner {
  async run(
    options: BaseCommandOptions & {
      command: "build" | "list" | "clear" | "debug";
      listOptions?: {
        format?: "table" | "json" | "simple";
        type?: "blocks" | "models" | "all";
        showCached?: boolean;
      };
    },
  ): Promise<void> {
    const cli = new DatoBuilderCLI(options);

    switch (options.command) {
      case "build":
        await cli.build();
        break;
      case "list":
        await cli.list(options.listOptions);
        break;
      case "clear":
        await cli.clearCache();
        break;
      case "debug":
        await cli.debug();
        break;
      default:
        throw new Error(`Unknown command: ${options.command}`);
    }
  }
}

(async () => {
  const consoleLogger = new ConsoleLogger();
  const runner = new BuildCommandRunner();
  const configParer = new ConfigParser(consoleLogger);

  const config = await configParer.loadConfig();

  const itemTypeCache = new ItemTypeCacheManager(
    path.join(process.cwd(), ".dato-builder-cache", "item-types.json"),
  );

  await itemTypeCache.initialize();

  await runner.run({
    command: "debug",
    config,
    modelsPath: `${process.cwd()}/src/datocms/models`,
    blocksPath: `${process.cwd()}/src/datocms/blocks`,
    cache: itemTypeCache,
    logger: new ConsoleLogger(getLogLevel(config.logLevel)),
  });
})().catch((error) => {
  console.error("Error running DatoBuilder CLI:", error);
  process.exit(1);
});
