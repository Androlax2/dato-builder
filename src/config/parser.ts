import fs from "node:fs";
import path from "node:path";
import type { ConsoleLogger } from "../logger";
import type { DatoBuilderConfig } from "./types";

export class ConfigParser {
  private readonly logger: ConsoleLogger;

  constructor(logger: ConsoleLogger) {
    this.logger = logger;
  }

  private async loadBaseConfig(): Promise<DatoBuilderConfig> {
    const configPath = await this.getConfigFilePath();

    this.logger.info(`Loading config from ${configPath}`);

    this.logger.debug(`Checking if config file exists at ${configPath}`);
    const baseConfig = await import(configPath);

    if (!baseConfig.default) {
      throw new Error("Unable to load dato-builder config file");
    }

    return baseConfig.default;
  }

  /**
   * Get config file path
   */
  private async getConfigFilePath(): Promise<string> {
    const possiblePaths = [
      path.resolve(process.cwd(), "dato-builder.config.js"),
      path.resolve(process.cwd(), "dato-builder.config.ts"),
    ];

    for (const configPath of possiblePaths) {
      if (fs.existsSync(configPath)) {
        return configPath;
      }
    }

    throw new Error("No dato-builder config file found");
  }

  /**
   * Validate config
   */
  private async validateConfig(
    config: DatoBuilderConfig,
  ): Promise<DatoBuilderConfig> {
    if (!config.apiToken) {
      throw new Error("Validation error: Missing apiToken");
    }

    return config;
  }

  /**
   * Load full config
   */
  async loadConfig(): Promise<DatoBuilderConfig> {
    const baseConfig = await this.loadBaseConfig();
    return await this.validateConfig(baseConfig);
  }
}
