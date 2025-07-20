import type { CacheManager } from "./cache/CacheManager.js";
import { RunCommand } from "./commands/run/RunCommand.js";
import { PlopGenerator } from "./generation/PlopGenerator.js";
import type { ConsoleLogger } from "./logger.js";
import type { DatoBuilderConfig } from "./types/DatoBuilderConfig.js";

interface BaseCommandOptions {
  config: Required<DatoBuilderConfig>;
  cache: CacheManager;
  logger: ConsoleLogger;
}

interface BuildCommandOptions {
  enableDeletion?: boolean;
  skipDeletionConfirmation?: boolean;
  concurrency?: number;
}

export class DatoBuilderCLI {
  private readonly config: Required<DatoBuilderConfig>;
  private readonly cache: CacheManager;
  private readonly logger: ConsoleLogger;

  constructor(options: BaseCommandOptions) {
    this.config = options.config;
    this.cache = options.cache;
    this.logger = options.logger;
  }

  /**
   * Execute the build command
   */
  public async build(options: BuildCommandOptions = {}): Promise<void> {
    this.logger.trace("Starting build command execution");

    await new RunCommand({
      config: this.config,
      cache: this.cache,
      logger: this.logger,
      enableDeletion: options.enableDeletion,
      skipDeletionConfirmation: options.skipDeletionConfirmation,
      concurrency: options.concurrency ?? 1,
    }).execute();

    this.logger.trace("Build command execution completed");
  }

  /**
   * Generate content using Plop.
   */
  public async generate(type?: "block" | "model"): Promise<void> {
    this.logger.trace("Starting content generation");
    const generator = new PlopGenerator(this.config, this.logger);

    if (type) {
      this.logger.trace(`Generating specific type: ${type}`);
      await generator.generateSpecific(type);
    } else {
      this.logger.trace("Generating all types");
      await generator.generateInteractive();
    }
  }

  /**
   * Clear all caches
   */
  public async clearCache(): Promise<void> {
    this.logger.trace("Starting cache clear operation");

    await this.cache.clear();

    this.logger.success("All caches cleared!");
    this.logger.trace("Cache clear operation completed");
  }
}
