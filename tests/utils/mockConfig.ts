import type { DatoBuilderConfig } from "../../src";

export function createMockConfig(): Required<DatoBuilderConfig> {
  // We don't inline the variable to have type safety on this mock configuration object.
  const mock: Required<DatoBuilderConfig> = {
    apiToken: "custom-token",
    overwriteExistingFields: true,
    modelApiKeySuffix: "custom-model",
    blockApiKeySuffix: "custom-block",
    blocksPath: "/custom/blocks",
    modelsPath: "/custom/models",
    logLevel: 0,
  };

  return mock;
}
