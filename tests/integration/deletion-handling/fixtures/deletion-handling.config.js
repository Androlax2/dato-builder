import "dotenv/config";

/** @type {import("../../../../../src/index.js").DatoBuilderConfig} */
const config = {
  apiToken: process.env.DATOCMS_API_TOKEN || "test-token-placeholder",
  blocksPath: "./tests/integration/deletion-handling/fixtures/blocks",
  modelsPath: "./tests/integration/deletion-handling/fixtures/models",
  overwriteExistingFields: true,
  // Enable debugging for integration tests
  logLevel: 0, // ERROR level
};

export default config;
