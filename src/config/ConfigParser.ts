import fs from "node:fs";
import path from "node:path";
import { type ConsoleLogger, LogLevel } from "../logger.js";
import type { DatoBuilderConfig } from "../types/DatoBuilderConfig.js";

export class ConfigParser {
  private readonly logger: ConsoleLogger;

  constructor(logger: ConsoleLogger) {
    this.logger = logger;
  }

  public async loadConfig(): Promise<Required<DatoBuilderConfig>> {
    const configPath = await this.getConfigFilePath();

    this.logger.debug(`Loading config from ${configPath}`);

    const userConfig = await import(configPath);

    if (!userConfig.default) {
      throw new Error("Unable to load dato-builder config file");
    }

    return this.validateConfig({
      ...this.DEFAULTS,
      ...(userConfig.default as DatoBuilderConfig),
    });
  }

  private get DEFAULTS(): Omit<Required<DatoBuilderConfig>, "apiToken"> {
    return {
      overwriteExistingFields: false,
      modelApiKeySuffix: "model",
      blockApiKeySuffix: "block",
      blocksPath: path.resolve(process.cwd(), "datocms", "blocks"),
      modelsPath: path.resolve(process.cwd(), "datocms", "models"),
      logLevel: LogLevel.INFO,
    };
  }

  private async getConfigFilePath(): Promise<string> {
    const possiblePaths = [
      path.resolve(process.cwd(), "dato-builder.config.js"),
      path.resolve(process.cwd(), "dato-builder.config.ts"),
    ];

    for (const configPath of possiblePaths) {
      if (fs.existsSync(configPath)) {
        await this.validateConfigPath(configPath);
        return configPath;
      }
    }

    throw new Error("No dato-builder config file found");
  }

  private async validateConfigPath(configPath: string): Promise<void> {
    try {
      const realPath = await fs.promises.realpath(configPath);
      const projectRoot = process.cwd();

      if (!realPath.startsWith(projectRoot)) {
        throw new Error(
          "Configuration file path resolves outside project directory",
        );
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("resolves outside project directory")
      ) {
        throw error;
      }
      // Re-throw other errors (e.g., filesystem errors)
      throw new Error(
        `Failed to validate config path: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private validateConfig<T extends DatoBuilderConfig>(config: T): T {
    if (!config.apiToken) {
      throw new Error("Validation error: Missing apiToken");
    }

    return config;
  }
}
