import { RunCommand } from "./commands/RunCommand";
import { ConfigParser } from "./config/ConfigParser";
import { ConsoleLogger } from "./logger";
import { getLogLevel } from "./utils/utils";

// TODO: Remove that after and build it inside build and call it from bin/cli.js
const consoleLogger = new ConsoleLogger();

(async () => {
  const configParser = new ConfigParser(consoleLogger);
  const config = await configParser.loadConfig();

  void new RunCommand({
    config,
    logger: new ConsoleLogger(getLogLevel(config.logLevel)),
    blocksPath: `${process.cwd()}/src/datocms/blocks`,
    modelsPath: `${process.cwd()}/src/datocms/models`,
  }).execute();
})().catch((error) => {
  consoleLogger.error(error);
  process.exit(1);
});
