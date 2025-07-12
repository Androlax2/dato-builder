import { ConfigParser } from "./config/parser";
import type { DatoBuilderConfig } from "./config/types";
import { ConsoleLogger } from "./logger";

export class CLI {
  private readonly config: Required<DatoBuilderConfig>;

  public constructor(config: Required<DatoBuilderConfig>) {
    this.config = config;
  }

  public async main() {
    console.log(this.config);
  }
}

// TODO: Remove that after and build it inside build and call it from bin/cli.js
const consoleLogger = new ConsoleLogger();

(async () => {
  const configParser = new ConfigParser(consoleLogger);
  const config = await configParser.loadConfig();

  void new CLI(config).main();
})().catch((error) => {
  consoleLogger.error(error);
  process.exit(1);
});
