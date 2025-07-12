import path from "node:path";
import { ItemTypeCacheManager } from "./cache/ItemTypeCacheManager";
import { RunCommand } from "./commands/RunCommand";
import { ConfigParser } from "./config/ConfigParser";
import { ConsoleLogger } from "./logger";
import { getLogLevel } from "./utils/utils";

// TODO: Remove that after and build it inside build and call it from bin/cli.js
const consoleLogger = new ConsoleLogger();

(async () => {
  const configParser = new ConfigParser(consoleLogger);
  const config = await configParser.loadConfig();
  const itemTypeCache = new ItemTypeCacheManager(
    path.join(process.cwd(), ".dato-builder-cache", "item-types.json"),
  );

  await itemTypeCache.initialize();

  void new RunCommand({
    config,
    cache: itemTypeCache,
    logger: new ConsoleLogger(getLogLevel(config.logLevel)),
    blocksPath: `${process.cwd()}/src/datocms/blocks`,
    modelsPath: `${process.cwd()}/src/datocms/models`,
  }).execute();
})().catch((error) => {
  consoleLogger.error(error);
  process.exit(1);
});
