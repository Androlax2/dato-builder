import "dotenv/config";

/** @type {import("../../../../../src/index.js").DatoBuilderConfig} */
const config = {
  apiToken: process.env.DATOCMS_API_TOKEN || "test-token-placeholder",
  blocksPath: "./tests/integration/update-detection/fixtures/blocks",
  modelsPath: "./tests/integration/update-detection/fixtures/models",
  overwriteExistingFields: true,
  // Enable debugging for integration tests
  logLevel: 2, // INFO level
};

export default config;
