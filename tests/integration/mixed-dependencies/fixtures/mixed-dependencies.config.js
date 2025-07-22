import "dotenv/config";

/** @type {import("../../../../src/index.ts").DatoBuilderConfig} */
const config = {
  apiToken: process.env.DATOCMS_API_TOKEN || "test-token-placeholder",
  blocksPath: "./tests/integration/mixed-dependencies/fixtures/blocks",
  modelsPath: "./tests/integration/mixed-dependencies/fixtures/models",
  overwriteExistingFields: true,
  // Enable debugging for integration tests
  logLevel: 0, // ERROR level
};

export default config;
