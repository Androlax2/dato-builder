import "dotenv/config";

/** @type {import("../../../../src/index.js").DatoBuilderConfig} */
const config = {
  apiToken: process.env.DATOCMS_API_TOKEN || "test-token-placeholder",
  blocksPath: "./tests/integration/build-flags/fixtures/blocks",
  modelsPath: "./tests/integration/build-flags/fixtures/models",
  overwriteExistingFields: true,
  // Enable debugging for integration tests
  logLevel: 0, // ERROR level
};

export default config;
