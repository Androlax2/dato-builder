import * as fs from "node:fs";
import path from "node:path";
import type { DatoBuilderConfig } from "./types";

export function loadDatoBuilderConfig(): DatoBuilderConfig {
  const config: Partial<DatoBuilderConfig> = {};

  // Load config from file if it exists
  if (!tryLoadFromConfigFile(config)) {
    throw new Error(
      "No Dato Builder config found. Please create a file named 'dato-builder.config.js' or 'dato-builder.config.ts' in the current directory.",
    );
  }

  // Validate the config
  validateConfig(config);

  return config as DatoBuilderConfig;
}

/**
 * Attempts to load config from JS or TS file
 */
function tryLoadFromConfigFile(config: Partial<DatoBuilderConfig>): boolean {
  try {
    // Try to find config file in current directory with different extensions
    const possiblePaths = [
      path.resolve(process.cwd(), "dato-builder.config.js"),
      path.resolve(process.cwd(), "dato-builder.config.ts"),
    ];

    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        return loadConfigFromFile(config, filePath);
      }
    }
  } catch (error) {
    console.warn(
      `Failed to load config file: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return false;
}

/**
 * Loads config from the specified JavaScript or TypeScript file
 */
function loadConfigFromFile(
  config: Partial<DatoBuilderConfig>,
  filePath: string,
): boolean {
  const ext = path.extname(filePath);

  // Only support JS and TS files
  if (ext !== ".js" && ext !== ".ts") {
    console.warn(
      `Unsupported config file extension: ${ext}. Only .js and .ts are supported.`,
    );
    return false;
  }

  try {
    // For TS files, ensure ts-node is registered
    if (ext === ".ts" && !require.extensions[".ts"]) {
      try {
        require("ts-node/register");
      } catch (_e) {
        throw new Error(
          "ts-node is required to load TypeScript config files. Please install it with: npm install -D ts-node",
        );
      }
    }

    const fileConfig = require(filePath);
    // Handle both default exports and regular exports
    const config_obj = fileConfig.default || fileConfig;
    if (typeof config_obj !== "object") {
      throw new Error(
        `Invalid config file format. Expected an object, but got ${typeof config_obj}.`,
      );
    }

    Object.assign(config, config_obj);
    return true;
  } catch (error) {
    console.warn(
      `Failed to import config file ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return false;
  }
}

/**
 * Validates that the config has all required properties
 */
function validateConfig(config: Partial<DatoBuilderConfig>): void {
  if (!config.apiToken) {
    throw new Error(
      "API token is required. Please provide it in the config file.",
    );
  }

  // Set default values
  if (config.overwriteExistingFields === undefined) {
    config.overwriteExistingFields = false;
  }

  if (config.debug === undefined) {
    config.debug = false;
  }
}
