import type { DatoBuilderConfig, ResolvedDatoBuilderConfig } from "../../src";
import { LogLevel } from "../../src/logger";

export function createMockConfig(
  config?: Partial<DatoBuilderConfig>,
): ResolvedDatoBuilderConfig {
  const defaultMockedConfig: ResolvedDatoBuilderConfig = {
    apiToken: "custom-token",
    overwriteExistingFields: false,
    modelApiKeySuffix: "custom-model",
    blockApiKeySuffix: "custom-block",
    blocksPath: "/custom/blocks",
    modelsPath: "/custom/models",
    logLevel: LogLevel.NONE,
    environment: undefined,
  };

  return {
    ...defaultMockedConfig,
    ...config,
  };
}
