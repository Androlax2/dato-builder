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
    logLevel: 0,
  };

  return {
    ...defaultMockedConfig,
    ...config,
  };
}
