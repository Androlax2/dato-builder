import path from "node:path";
import { Command } from "@commander-js/extra-typings";
import { CacheManager } from "./cache/CacheManager";
import { RunCommand } from "./commands/run/RunCommand";
import { ConfigParser } from "./config/ConfigParser";
import { ConsoleLogger, LogLevel } from "./logger";
import type { DatoBuilderConfig } from "./types/DatoBuilderConfig";

interface BaseCommandOptions {
  config: Required<DatoBuilderConfig>;
  cache: CacheManager;
  logger: ConsoleLogger;
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
  public async build(): Promise<void> {
    this.logger.trace("Starting build command execution");
    await new RunCommand({
      config: this.config,
      cache: this.cache,
      logger: this.logger,
    }).execute();
    this.logger.trace("Build command execution completed");
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

// Type definitions for options
type GlobalOptions = {
  debug: boolean;
  verbose: boolean;
  quiet: boolean;
  cache: boolean;
};

// Setup Commander CLI
async function setupCLI(): Promise<void> {
  const program = new Command()
    .name("dato-builder")
    .description("DatoCMS Builder CLI")
    .option("-n, --no-cache", "Disable cache usage")
    .option("-d, --debug", "Output information useful for debugging.", false)
    .option("-v, --verbose", "Display even finer-grained trace logs.", false)
    .option("-q, --quiet", "Only display errors.", false);

  function getLogLevelFromOptions(options: GlobalOptions): LogLevel {
    if (options.debug) {
      return LogLevel.DEBUG;
    } else if (options.quiet) {
      return LogLevel.ERROR;
    } else if (options.verbose) {
      return LogLevel.TRACE;
    } else {
      return LogLevel.INFO;
    }
  }

  async function initializeCLI(
    globalOptions: GlobalOptions,
  ): Promise<DatoBuilderCLI> {
    const level = getLogLevelFromOptions(globalOptions);

    const logger = new ConsoleLogger(
      level,
      {},
      {
        timestamp: level === LogLevel.TRACE,
        prefix: level === LogLevel.TRACE ? "dato-builder" : undefined,
        prettyJson: true,
      },
    );
    const configParser = new ConfigParser(logger);
    const cache = new CacheManager(
      path.join(process.cwd(), ".dato-builder-cache", "item-types.json"),
      {
        skipReads: !globalOptions.cache,
      },
    );

    const config = await configParser.loadConfig();

    // Override log level from config if CLI options are provided
    if (globalOptions.debug || globalOptions.verbose || globalOptions.quiet) {
      logger.setLevel(level);
      config.logLevel = level;
    } else {
      logger.setLevel(config.logLevel);
    }

    await cache.initialize();

    return new DatoBuilderCLI({
      config,
      cache,
      logger,
    });
  }

  // Build command
  program
    .command("build")
    .description("Build DatoCMS types and blocks")
    .action(async (_options, command) => {
      try {
        const globalOptions = command.optsWithGlobals();
        const cli = await initializeCLI({
          debug: globalOptions.debug,
          verbose: globalOptions.verbose,
          quiet: globalOptions.quiet,
          cache: globalOptions.cache,
        });
        await cli.build();
      } catch (error) {
        const logger = new ConsoleLogger(LogLevel.ERROR);
        logger.error(`Build failed: ${(error as Error).message}`);
        process.exit(1);
      }
    });

  // Clear cache command
  program
    .command("clear-cache")
    .description("Clear all caches")
    .action(async (_options, command) => {
      try {
        const globalOptions = command.optsWithGlobals();
        const cli = await initializeCLI({
          debug: globalOptions.debug,
          verbose: globalOptions.verbose,
          quiet: globalOptions.quiet,
          cache: globalOptions.cache,
        });
        await cli.clearCache();
      } catch (error) {
        const logger = new ConsoleLogger(LogLevel.ERROR);
        logger.error(`Cache clear failed: ${(error as Error).message}`);
        process.exit(1);
      }
    });

  await program.parseAsync(process.argv);
}

// Main execution
if (require.main === module) {
  setupCLI().catch((error: unknown) => {
    const logger = new ConsoleLogger(LogLevel.ERROR);
    if (error instanceof Error) {
      logger.error(`CLI initialization failed: ${error.message}`);
    } else {
      logger.error("CLI initialization failed with an unknown error");
    }
    process.exit(1);
  });
}

export { setupCLI };
