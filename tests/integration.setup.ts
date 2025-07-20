import path from "node:path";
import { afterAll, beforeAll, jest } from "@jest/globals";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Verify API token is available
const apiToken = process.env.DATOCMS_API_TOKEN;
if (!apiToken) {
  throw new Error(
    "DATOCMS_API_TOKEN environment variable is required for integration tests. " +
      "Please set it in your .env file or as an environment variable.",
  );
}

// Set up global test environment
beforeAll(() => {
  console.log("Integration tests will use real DatoCMS API");
  console.log(
    `API Token: ${apiToken.substring(0, 8)}...${apiToken.substring(apiToken.length - 4)}`,
  );
});

// Clean up after all tests
afterAll(async () => {
  // Add any global cleanup here if needed
  // For example, delete test items created during integration tests
});

// Increase default timeout for integration tests
jest.setTimeout(30000); // 30 seconds

// Helper to ensure we're in a test environment
process.env.NODE_ENV = "test";
process.env.INTEGRATION_TEST = "true";
