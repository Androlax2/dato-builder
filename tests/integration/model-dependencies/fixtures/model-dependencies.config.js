import "dotenv/config";

/** @type {import("../../../../src/index.ts").DatoBuilderConfig} */
const config = {
  apiToken: process.env.DATOCMS_API_TOKEN || "test-token-placeholder",
  blocksPath: "./tests/integration/model-dependencies/fixtures/blocks",
  modelsPath: "./tests/integration/model-dependencies/fixtures/models",
  overwriteExistingFields: true,
  // Enable debugging for integration tests
  logLevel: 0, // ERROR level
};

export default config;
