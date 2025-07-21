import path from "node:path";
import { buildClient } from "@datocms/cma-client-node";
import { afterAll, beforeAll, jest } from "@jest/globals";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Set TEST_TYPE for integration tests
process.env.TEST_TYPE = "integration";

// Verify API token is available
const apiToken = process.env.DATOCMS_API_TOKEN;
if (!apiToken) {
  throw new Error(
    "DATOCMS_API_TOKEN environment variable is required for integration tests. " +
      "Please set it in your .env file or as an environment variable.",
  );
}

/**
 * Erase ALL blocks and models from DatoCMS to ensure clean test environment
 */
async function eraseAllItems() {
  console.log("🧹 Erasing ALL items from DatoCMS...");

  const client = buildClient({ apiToken: apiToken! });

  try {
    // Get all item types
    const allItemTypes = await client.itemTypes.list();

    console.log(`Found ${allItemTypes.length} items to erase`);

    if (allItemTypes.length === 0) {
      console.log("✅ No items found - DatoCMS is already clean");
      return;
    }

    // Delete ALL item types concurrently
    const deletePromises = allItemTypes.map(async (itemType) => {
      try {
        await client.itemTypes.destroy(itemType.id);
        console.log(`🗑️  Erased: ${itemType.api_key} (${itemType.name})`);
        return { success: true, api_key: itemType.api_key };
      } catch (error) {
        console.warn(`⚠️  Failed to erase: ${itemType.api_key}:`, error);
        return { success: false, api_key: itemType.api_key, error };
      }
    });

    const results = await Promise.allSettled(deletePromises);

    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success,
    ).length;
    const failed = results.filter(
      (r) =>
        r.status === "rejected" ||
        (r.status === "fulfilled" && !r.value.success),
    ).length;

    console.log(`✅ Erasure completed: ${successful} erased, ${failed} failed`);
  } catch (error) {
    console.error("❌ Failed to erase items:", error);
    console.warn("Continuing with tests anyway...");
  }
}

// Set up global test environment
beforeAll(async () => {
  console.log("Integration tests will use real DatoCMS API");
  console.log(
    `API Token: ${apiToken.substring(0, 8)}...${apiToken.substring(apiToken.length - 4)}`,
  );

  // Erase ALL items from DatoCMS before starting tests
  await eraseAllItems();
}, 120000); // 2 minute timeout for cleanup

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
