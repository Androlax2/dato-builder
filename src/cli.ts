#!/usr/bin/env node

import { initializeCLI } from "./cli/CLIInitializer";
import { CommandBuilder } from "./cli/CommandBuilder";
import { ConsoleLogger, LogLevel } from "./logger";

// Version will be replaced during build
const VERSION = "__PACKAGE_VERSION__";

// Setup Commander CLI
async function setupCLI(): Promise<void> {
  const commandBuilder = new CommandBuilder(VERSION);

  // Configure all commands
  commandBuilder
    .addBuildCommand(initializeCLI)
    .addGenerateCommands(initializeCLI)
    .addClearCacheCommand(initializeCLI);

  // Parse command line arguments
  await commandBuilder.parse(process.argv);
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
