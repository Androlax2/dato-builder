import { LogLevel } from "@/logger";
import type { DatoBuilderConfig } from "../../src";

export function createMockConfig(
  config?: Partial<DatoBuilderConfig>,
): Required<DatoBuilderConfig> {
  const defaultMockedConfig: Required<DatoBuilderConfig> = {
    apiToken: "custom-token",
    overwriteExistingFields: false,
    modelApiKeySuffix: "custom-model",
    blockApiKeySuffix: "custom-block",
    blocksPath: "/custom/blocks",
    modelsPath: "/custom/models",
    logLevel: LogLevel.NONE,
    syncBlocksPath: "/custom/sync/blocks",
    syncModelsPath: "/custom/sync/models",
  };

  return {
    ...defaultMockedConfig,
    ...config,
  };
}
