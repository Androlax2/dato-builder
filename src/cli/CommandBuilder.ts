import os from "node:os";
import { Command } from "@commander-js/extra-typings";
import type { DatoBuilderCLI } from "../DatoBuilderCLI.js";
import { ConsoleLogger, LogLevel } from "../logger.js";

export interface GlobalOptions {
  debug: boolean;
  verbose: boolean;
  quiet: boolean;
  cache: boolean;
  env?: string;
}

export interface BuildOptions {
  skipDeletion: boolean;
  skipDeletionConfirmation: boolean;
  concurrent?: boolean;
  concurrency?: number;
  autoConcurrency?: boolean;
}

export class CommandBuilder {
  private readonly program: Command;
  private readonly customConfigPath?: string;

  constructor(version: string, customConfigPath?: string) {
    this.customConfigPath = customConfigPath;
    this.program = new Command()
      .name("dato-builder")
      .description("DatoCMS Builder CLI")
      .version(version)
      .option("-n, --no-cache", "Disable cache usage")
      .option("-d, --debug", "Output information useful for debugging.", false)
      .option("-v, --verbose", "Display even finer-grained trace logs.", false)
      .option("-q, --quiet", "Only display errors.", false)
      .option("-e, --env <environment>", "Specify the environment to use");
  }

  /**
   * Create a custom initializeCLI function that uses custom config path if provided
   */
  private createInitializeCLI(
    originalInitializeCLI: (
      options: GlobalOptions,
      customConfigPath?: string,
    ) => Promise<DatoBuilderCLI>,
  ) {
    return (options: GlobalOptions) =>
      originalInitializeCLI(options, this.customConfigPath);
  }

  /**
   * Add build command
   */
  public addBuildCommand(
    initializeCLI: (
      options: GlobalOptions,
      customConfigPath?: string,
    ) => Promise<DatoBuilderCLI>,
  ): this {
    this.program
      .command("build")
      .description("Build DatoCMS types and blocks")
      .option(
        "--skip-deletion",
        "Skip deletion detection and removal of orphaned items",
        false,
      )
      .option(
        "--skip-deletion-confirmation",
        "Skip confirmation prompts for deletions",
        false,
      )
      .option(
        "--concurrent",
        "Enable concurrent builds (default concurrency: 3)",
        false,
      )
      .option(
        "--concurrency <number>",
        "Set the concurrency level for builds (implies --concurrent)",
        parseInt,
      )
      .option(
        "--auto-concurrency",
        "Automatically determine and set concurrency based on CPU cores",
        false,
      )
      .action(async (options: BuildOptions, command) => {
        try {
          const globalOptions = this.extractGlobalOptions(command);
          const cli =
            await this.createInitializeCLI(initializeCLI)(globalOptions);

          const concurrency = this.determineConcurrency(options);

          await cli.build({
            enableDeletion: !options.skipDeletion,
            skipDeletionConfirmation: options.skipDeletionConfirmation,
            concurrency,
          });
        } catch (error) {
          this.handleError("Build failed", error);
        }
      });

    return this;
  }

  /**
   * Add generate commands
   */
  public addGenerateCommands(
    initializeCLI: (
      options: GlobalOptions,
      customConfigPath?: string,
    ) => Promise<DatoBuilderCLI>,
  ): this {
    // Generate command
    this.program
      .command("generate")
      .description("Generate Blocks and Models")
      .action(async (_options, command) => {
        try {
          const globalOptions = this.extractGlobalOptions(command);
          const cli =
            await this.createInitializeCLI(initializeCLI)(globalOptions);

          await cli.generate();
        } catch (error) {
          this.handleError("Generation failed", error);
        }
      });

    // Generate block command
    this.program
      .command("generate:block")
      .description("Generate a new DatoCMS block")
      .action(async (_options, command) => {
        try {
          const globalOptions = this.extractGlobalOptions(command);
          const cli =
            await this.createInitializeCLI(initializeCLI)(globalOptions);

          await cli.generate("block");
        } catch (error) {
          this.handleError("Block generation failed", error);
        }
      });

    // Generate model command
    this.program
      .command("generate:model")
      .description("Generate a new DatoCMS model")
      .action(async (_options, command) => {
        try {
          const globalOptions = this.extractGlobalOptions(command);
          const cli =
            await this.createInitializeCLI(initializeCLI)(globalOptions);

          await cli.generate("model");
        } catch (error) {
          this.handleError("Model generation failed", error);
        }
      });

    return this;
  }

  /**
   * Add clear cache command
   */
  public addClearCacheCommand(
    initializeCLI: (
      options: GlobalOptions,
      customConfigPath?: string,
    ) => Promise<DatoBuilderCLI>,
  ): this {
    this.program
      .command("clear-cache")
      .description("Clear all caches")
      .action(async (_options, command) => {
        try {
          const globalOptions = this.extractGlobalOptions(command);
          const cli =
            await this.createInitializeCLI(initializeCLI)(globalOptions);

          await cli.clearCache();
        } catch (error) {
          this.handleError("Cache clear failed", error);
        }
      });

    return this;
  }

  /**
   * Parse command line arguments
   */
  public async parse(argv: string[]): Promise<void> {
    await this.program.parseAsync(argv);
  }

  /**
   * Determine concurrency level based on options
   */
  private determineConcurrency(options: BuildOptions): number {
    if (options.autoConcurrency) {
      const concurrency = Math.max(1, os.cpus().length - 1);
      console.log(`Auto-determined concurrency level: ${concurrency}`);
      return concurrency;
    }

    if (options.concurrent && !options.concurrency) {
      return 3; // Default concurrent level
    }

    if (options.concurrency) {
      return options.concurrency;
    }

    return 1; // Default to sequential
  }

  /**
   * Extract global options from command context
   */
  private extractGlobalOptions(command: any): GlobalOptions {
    const allOptions = command.optsWithGlobals();
    return {
      debug: Boolean(allOptions.debug),
      verbose: Boolean(allOptions.verbose),
      quiet: Boolean(allOptions.quiet),
      cache: Boolean(allOptions.cache),
    };
  }

  /**
   * Handle command errors consistently
   */
  private handleError(message: string, error: unknown): never {
    const logger = new ConsoleLogger(LogLevel.ERROR);
    logger.error(`${message}: ${(error as Error).message}`);

    process.exit(1);
  }
}
