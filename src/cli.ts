import { ConfigParser } from "./config/parser";
import { ConsoleLogger } from "./logger";

export class CLI {
  private readonly configParser: ConfigParser;

  constructor(configParser: ConfigParser) {
    this.configParser = configParser;
  }

  public async main() {
    const config = await this.configParser.loadConfig();
    console.log({ config });
  }
}

// TODO: Remove that after and build it inside build and call it from bin/cli.js
const consoleLogger = new ConsoleLogger();
const configParser = new ConfigParser(consoleLogger);

new CLI(configParser).main().catch((error) => consoleLogger.error(error));
