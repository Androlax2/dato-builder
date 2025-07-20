import { initializeCLI } from "./cli/CLIInitializer.js";
import { CommandBuilder } from "./cli/CommandBuilder.js";
import { ConsoleLogger, LogLevel } from "./logger.js";

// Will be replaced during build
const VERSION = "__PACKAGE_VERSION__";

export class CLI {
  /** Entry point; wrap all failures here */
  public async execute(): Promise<void> {
    try {
      await this.run();
    } catch (error: unknown) {
      const logger = new ConsoleLogger(LogLevel.ERROR);

      if (error instanceof Error) {
        logger.error(`CLI initialization failed: ${error.message}`);
      } else {
        logger.error("CLI initialization failed with an unknown error");
      }

      process.exit(1);
    }
  }

  /** Sets up Commander, adds commands, parses argv */
  private async run(): Promise<void> {
    const builder = new CommandBuilder(VERSION);

    builder
      .addBuildCommand(initializeCLI)
      .addGenerateCommands(initializeCLI)
      .addClearCacheCommand(initializeCLI);

    await builder.parse(process.argv);
  }
}
