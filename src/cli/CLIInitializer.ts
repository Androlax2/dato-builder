import path from "node:path";
import { CacheManager } from "../cache/CacheManager";
import { ConfigParser } from "../config/ConfigParser";
import { DatoBuilderCLI } from "../DatoBuilderCLI";
import { ConsoleLogger, LogLevel } from "../logger";
import type { GlobalOptions } from "./CommandBuilder";

/**
 * Get log level from global options
 */
export function getLogLevelFromOptions(options: GlobalOptions): LogLevel {
  if (options.debug) {
    return LogLevel.DEBUG;
  }
  if (options.quiet) {
    return LogLevel.ERROR;
  }
  if (options.verbose) {
    return LogLevel.TRACE;
  }
  return LogLevel.INFO;
}

/**
 * Initialize DatoBuilderCLI with proper configuration
 */
export async function initializeCLI(
  globalOptions: GlobalOptions,
): Promise<DatoBuilderCLI> {
  const level = getLogLevelFromOptions(globalOptions);

  // Create logger
  const logger = new ConsoleLogger(
    level,
    {},
    {
      timestamp: level === LogLevel.TRACE,
      prefix: level === LogLevel.TRACE ? "dato-builder" : undefined,
      prettyJson: true,
    },
  );

  // Create config parser and cache manager
  const configParser = new ConfigParser(logger);
  const cache = new CacheManager(
    path.join(process.cwd(), ".dato-builder-cache", "item-types.json"),
    {
      skipReads: !globalOptions.cache,
    },
  );

  // Load configuration
  const config = await configParser.loadConfig();

  // Override log level from config if CLI options are provided
  if (globalOptions.debug || globalOptions.verbose || globalOptions.quiet) {
    logger.setLevel(level);
    config.logLevel = level;
  } else {
    logger.setLevel(config.logLevel);
  }

  // Initialize cache
  await cache.initialize();

  return new DatoBuilderCLI({
    config,
    cache,
    logger,
  });
}
