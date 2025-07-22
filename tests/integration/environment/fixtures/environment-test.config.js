import "dotenv/config";

/** @type {import("../../../../src/index.js").DatoBuilderConfig} */
const config = {
  apiToken: process.env.DATOCMS_API_TOKEN || "test-token-placeholder",
  blocksPath: "./tests/integration/environment/fixtures/blocks",
  modelsPath: "./tests/integration/environment/fixtures/models",
  overwriteExistingFields: true,
  // Test with default environment (undefined)
  environment: undefined,
  // Enable debugging for integration tests
  logLevel: 0, // ERROR level
};

export default config;
