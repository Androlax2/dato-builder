import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildClient, type Client } from "@datocms/cma-client-node";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { CLI } from "../../../src/cli.js";

describe("SimpleModels Integration Test", () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const testConfigPath = path.resolve(
    __dirname,
    "fixtures",
    "simple-models.config.js",
  );
  const API_TOKEN = process.env.DATOCMS_API_TOKEN;
  let createdModelId: string | null = null;
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
    // Cleanup: Delete the test model from DatoCMS if it was created
    if (createdModelId && datoClient) {
      try {
        await datoClient.itemTypes.destroy(createdModelId);
        console.log(`Successfully cleaned up test model: ${createdModelId}`);
      } catch (error) {
        console.warn("Error during cleanup:", error);
      }
    }
  });

  describe("Model Build and Verification", () => {
    it("should build TestSimpleModel to DatoCMS and verify creation", async () => {
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
        // Execute CLI - this will build the TestSimpleModel to DatoCMS
        await cli.execute();

        // Verify the model was actually created in DatoCMS
        const itemTypes = await datoClient.itemTypes.list();

        // Find our test model
        const testModel = itemTypes.find(
          (item) => item.api_key === "test_simple_model",
        );

        expect(testModel).toBeDefined();
        expect(testModel!.name).toBe("Test Simple Model");
        expect(testModel!.api_key).toBe("test_simple_model");

        // Store the ID for cleanup
        createdModelId = testModel!.id;

        // Verify the model has the expected fields
        const fields = await datoClient.fields.list(testModel!.id);

        // Should have 2 fields: title (string), description (string)
        expect(fields).toHaveLength(2);

        const titleField = fields.find((field) => field.api_key === "title");
        const descriptionField = fields.find(
          (field) => field.api_key === "description",
        );

        expect(titleField).toBeDefined();
        expect(titleField!.field_type).toBe("string");
        expect(titleField!.validators.required).toBeDefined(); // Required validator exists

        expect(descriptionField).toBeDefined();
        expect(descriptionField!.field_type).toBe("string");
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
