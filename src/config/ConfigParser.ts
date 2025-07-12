import fs from "node:fs";
import path from "node:path";
import type { ConsoleLogger } from "../logger";
import type { DatoBuilderConfig } from "../types/DatoBuilderConfig";

export class ConfigParser {
  private readonly logger: ConsoleLogger;

  private static readonly DEFAULTS: Omit<
    Required<DatoBuilderConfig>,
    "apiToken"
  > = {
    overwriteExistingFields: false,
    debug: false,
    modelApiKeySuffix: null,
    blockApiKeySuffix: null,
    logLevel: "info",
  };

  constructor(logger: ConsoleLogger) {
    this.logger = logger;
  }

  public async loadConfig(): Promise<Required<DatoBuilderConfig>> {
    const configPath = await this.getConfigFilePath();

    this.logger.info(`Loading config from ${configPath}`);

    const userConfig = await import(configPath);

    if (!userConfig.default) {
      throw new Error("Unable to load dato-builder config file");
    }

    return this.validateConfig({
      ...ConfigParser.DEFAULTS,
      ...(userConfig.default as DatoBuilderConfig),
    });
  }

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

  private validateConfig<T extends DatoBuilderConfig>(config: T): T {
    if (!config.apiToken) {
      throw new Error("Validation error: Missing apiToken");
    }

    return config;
  }
}
