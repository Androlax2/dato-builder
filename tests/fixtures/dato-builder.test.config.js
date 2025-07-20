import "dotenv/config";

/** @type {import("../../src/index.js").DatoBuilderConfig} */
const config = {
  apiToken: process.env.DATOCMS_API_TOKEN || "test-token-placeholder",
  overwriteExistingFields: true,
  blocksPath: "./tests/fixtures/blocks",
  modelsPath: "./tests/fixtures/models",
  logLevel: 2, // INFO level for tests
};

export default config;
