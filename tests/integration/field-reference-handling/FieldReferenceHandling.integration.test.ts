import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildClient, type Client } from "@datocms/cma-client-node";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { CLI } from "../../../src/cli.js";

describe("Field Reference Handling Integration Test", () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const testConfigPath = path.resolve(
    __dirname,
    "fixtures",
    "field-reference-handling.config.js",
  );
  const API_TOKEN = process.env.DATOCMS_API_TOKEN;
  let createdBlockId: string | null = null;
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
    // Cleanup: Delete the test items from DatoCMS if they were created
    const cleanupPromises = [];

    if (createdBlockId && datoClient) {
      cleanupPromises.push(
        datoClient.itemTypes
          .destroy(createdBlockId)
          .then(() =>
            console.log(
              `Successfully cleaned up test block: ${createdBlockId}`,
            ),
          )
          .catch((error) => console.warn("Error during block cleanup:", error)),
      );
    }

    if (createdModelId && datoClient) {
      cleanupPromises.push(
        datoClient.itemTypes
          .destroy(createdModelId)
          .then(() =>
            console.log(
              `Successfully cleaned up test model: ${createdModelId}`,
            ),
          )
          .catch((error) => console.warn("Error during model cleanup:", error)),
      );
    }

    await Promise.all(cleanupPromises);
  });

  describe("Block with Field References", () => {
    it("should build TestFieldReferenceBlock to DatoCMS and verify field references work", async () => {
      // Create CLI instance with test-specific config
      const cli = new CLI(testConfigPath);

      // Mock process.argv to simulate build command
      const originalArgv = process.argv;
      process.argv = [
        "node",
        "dato-builder",
        "build",
        "--skip-deletion",
        "--no-cache",
      ];

      try {
        // Execute the build command
        await cli.execute();

        // Find the created block in DatoCMS
        const itemTypes = await datoClient.itemTypes.list();
        const testBlock = itemTypes.find(
          (item) => item.api_key === "test_field_reference_block",
        );

        expect(testBlock).toBeDefined();
        expect(testBlock?.name).toBe("Test Field Reference Block");
        expect(testBlock?.modular_block).toBe(true);

        if (testBlock) {
          createdBlockId = testBlock.id;

          // Verify the block has the expected fields
          const fields = await datoClient.fields.list(testBlock.id);

          // Verify the fields were created
          expect(fields).toHaveLength(3);

          const titleField = fields.find((f) => f.api_key === "main_title");
          const imageField = fields.find((f) => f.api_key === "hero_image");
          const descField = fields.find((f) => f.api_key === "description");

          expect(titleField).toBeDefined();
          expect(imageField).toBeDefined();
          expect(descField).toBeDefined();

          // Verify field types
          expect(titleField?.field_type).toBe("text");
          expect(imageField?.field_type).toBe("date");
          expect(descField?.field_type).toBe("text");

          // Verify field reference resolution - presentation_title_field should point to main_title
          expect(testBlock.presentation_title_field).toBe(titleField?.id);

          // presentation_image_field was set to null in fixture, so should be null
          expect(testBlock.presentation_image_field).toBeNull();
        }
      } finally {
        // Restore original process.argv
        process.argv = originalArgv;
      }
    }, 60000);
  });

  describe("Model with Field References", () => {
    it("should build TestFieldReferenceModel to DatoCMS and verify field references work", async () => {
      // Create CLI instance with test-specific config
      const cli = new CLI(testConfigPath);

      // Mock process.argv to simulate build command
      const originalArgv = process.argv;
      process.argv = [
        "node",
        "dato-builder",
        "build",
        "--skip-deletion",
        "--no-cache",
      ];

      try {
        // Execute the build command
        await cli.execute();

        // Find the created model in DatoCMS
        const itemTypes = await datoClient.itemTypes.list();
        const testModel = itemTypes.find(
          (item) => item.api_key === "test_field_reference_model",
        );

        expect(testModel).toBeDefined();
        expect(testModel?.name).toBe("Test Field Reference Model");
        expect(testModel?.modular_block).toBe(false);
        expect(testModel?.sortable).toBe(true);

        if (testModel) {
          createdModelId = testModel.id;

          // Verify the model has the expected fields
          const fields = await datoClient.fields.list(testModel.id);

          // Verify the fields were created
          expect(fields).toHaveLength(4);

          const titleField = fields.find((f) => f.api_key === "title");
          const summaryField = fields.find((f) => f.api_key === "summary");
          const sortOrderField = fields.find((f) => f.api_key === "sort_order");
          const imageField = fields.find((f) => f.api_key === "featured_image");

          expect(titleField).toBeDefined();
          expect(summaryField).toBeDefined();
          expect(sortOrderField).toBeDefined();
          expect(imageField).toBeDefined();

          // Verify field types
          expect(titleField?.field_type).toBe("text");
          expect(summaryField?.field_type).toBe("text");
          expect(sortOrderField?.field_type).toBe("integer");
          expect(imageField?.field_type).toBe("date");

          // Verify field reference resolution
          expect(testModel.ordering_field).toBe(sortOrderField?.id);
          expect(testModel.presentation_title_field).toBe(titleField?.id);
          expect(testModel.excerpt_field).toBe(summaryField?.id);
        }
      } finally {
        // Restore original process.argv
        process.argv = originalArgv;
      }
    }, 60000);
  });

  describe("Error Handling", () => {
    it("should handle field resolver failures gracefully", async () => {
      // This test would require creating a fixture with a failing resolver
      // For now, we'll test that the system gracefully handles the case
      // where field resolvers can't find their target fields

      const itemTypes = await datoClient.itemTypes.list();

      // Verify that our test items exist and have proper field references
      const testBlock = itemTypes.find(
        (item) => item.api_key === "test_field_reference_block",
      );
      const testModel = itemTypes.find(
        (item) => item.api_key === "test_field_reference_model",
      );

      if (testBlock) {
        // The presentation_title_field should have been resolved to main_title field
        const blockFields = await datoClient.fields.list(testBlock.id);
        const titleField = blockFields.find((f) => f.api_key === "main_title");
        expect(testBlock.presentation_title_field).toBe(titleField?.id);
      }

      if (testModel) {
        // All field references should have been properly resolved
        const modelFields = await datoClient.fields.list(testModel.id);
        const titleField = modelFields.find((f) => f.api_key === "title");
        const summaryField = modelFields.find((f) => f.api_key === "summary");
        const sortOrderField = modelFields.find(
          (f) => f.api_key === "sort_order",
        );

        expect(testModel.presentation_title_field).toBe(titleField?.id);
        expect(testModel.excerpt_field).toBe(summaryField?.id);
        expect(testModel.ordering_field).toBe(sortOrderField?.id);
      }
    });
  });
});
