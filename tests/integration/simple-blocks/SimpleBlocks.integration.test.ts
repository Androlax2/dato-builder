import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildClient, type Client } from "@datocms/cma-client-node";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { CLI } from "../../../src/cli.js";

describe("SimpleBlocks Integration Test", () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const testConfigPath = path.resolve(
    __dirname,
    "fixtures",
    "simple-blocks.config.js",
  );
  const API_TOKEN = process.env.DATOCMS_API_TOKEN;
  let createdBlockId: string | null = null;
  let datoClient: Client;

  beforeAll(async () => {
    // Ensure we have a DatoCMS API token for integration tests
    if (!API_TOKEN) {
      throw new Error(
        "DATOCMS_API_TOKEN environment variable is required for integration tests",
      );
    }

    // Initialize DatoCMS client
    datoClient = buildClient({ apiToken: API_TOKEN });
  });

  afterAll(async () => {
    // Cleanup: Delete the test block from DatoCMS if it was created
    if (createdBlockId && datoClient) {
      try {
        await datoClient.itemTypes.destroy(createdBlockId);
        console.log(`Successfully cleaned up test block: ${createdBlockId}`);
      } catch (error) {
        console.warn("Error during cleanup:", error);
      }
    }
  });

  describe("Block Build and Verification", () => {
    it("should build TestSimpleBlock to DatoCMS and verify creation", async () => {
      // Create CLI instance with test-specific config
      const cli = new CLI(testConfigPath);

      // Mock process.argv to simulate build command (skip deletion to avoid touching other items, no cache to force rebuild)
      const originalArgv = process.argv;
      process.argv = [
        "node",
        "dato-builder",
        "build",
        "--skip-deletion",
        "--no-cache",
      ];

      try {
        // Execute CLI - this will build the TestSimpleBlock to DatoCMS
        await cli.execute();

        // Verify the block was actually created in DatoCMS
        const itemTypes = await datoClient.itemTypes.list();

        // Find our test block
        const testBlock = itemTypes.find(
          (item) => item.api_key === "test_simple_block",
        );

        expect(testBlock).toBeDefined();
        expect(testBlock!.name).toBe("Test Simple Block");
        expect(testBlock!.api_key).toBe("test_simple_block");

        // Store the ID for cleanup
        createdBlockId = testBlock!.id;

        // Verify the block has the expected fields
        const fields = await datoClient.fields.list(testBlock!.id);

        // Should have 2 fields: title (text) and is_enabled (boolean)
        expect(fields).toHaveLength(2);

        const titleField = fields.find((field) => field.api_key === "title");
        const enabledField = fields.find(
          (field) => field.api_key === "is_enabled",
        );

        expect(titleField).toBeDefined();
        expect(titleField!.field_type).toBe("string");
        expect(titleField!.validators.required).toBeDefined(); // Required validator exists

        expect(enabledField).toBeDefined();
        expect(enabledField!.field_type).toBe("boolean");
      } catch (error) {
        console.error("Build or verification failed:", error);
        throw error;
      } finally {
        // Restore original process.argv
        process.argv = originalArgv;
      }
    }, 30000); // 30 second timeout for API calls
  });
});
