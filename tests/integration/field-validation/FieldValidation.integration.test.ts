import path from "node:path";
import { buildClient, type Client } from "@datocms/cma-client-node";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { CLI } from "../../../src/cli.js";

describe("FieldValidation Integration Test", () => {
  const testConfigPath = path.resolve(
    process.cwd(),
    "tests/integration/field-validation/fixtures/field-validation.config.js",
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

  describe("Block Build and Field Type Verification", () => {
    it("should build TestFieldValidationBlock with various field types and verify validators", async () => {
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
        // Execute CLI - this will build the TestFieldValidationBlock to DatoCMS
        await cli.execute();

        // Verify the block was actually created in DatoCMS
        const itemTypes = await datoClient.itemTypes.list();

        // Find our test block
        const testBlock = itemTypes.find(
          (item) => item.api_key === "test_field_validation_block",
        );

        expect(testBlock).toBeDefined();
        expect(testBlock!.name).toBe("Test Field Validation Block");
        expect(testBlock!.api_key).toBe("test_field_validation_block");

        // Store the ID for cleanup
        createdBlockId = testBlock!.id;

        // Verify the block has the expected fields
        const fields = await datoClient.fields.list(testBlock!.id);

        // Should have 5 fields: required_text, optional_boolean, limited_integer, date_field, datetime_field
        expect(fields).toHaveLength(5);

        // Test text field with required validator
        const textField = fields.find(
          (field) => field.api_key === "required_text",
        );
        expect(textField).toBeDefined();
        expect(textField!.field_type).toBe("string");
        expect(textField!.validators.required).toBeDefined();

        // Test boolean field (no validators)
        const booleanField = fields.find(
          (field) => field.api_key === "optional_boolean",
        );
        expect(booleanField).toBeDefined();
        expect(booleanField!.field_type).toBe("boolean");

        // Test integer field with range validator
        const integerField = fields.find(
          (field) => field.api_key === "limited_integer",
        );
        expect(integerField).toBeDefined();
        expect(integerField!.field_type).toBe("integer");
        expect(integerField!.validators.number_range).toBeDefined();
        expect((integerField!.validators.number_range as any).min).toBe(1);
        expect((integerField!.validators.number_range as any).max).toBe(100);

        // Test date field
        const dateField = fields.find(
          (field) => field.api_key === "date_field",
        );
        expect(dateField).toBeDefined();
        expect(dateField!.field_type).toBe("date");

        // Test datetime field
        const datetimeField = fields.find(
          (field) => field.api_key === "datetime_field",
        );
        expect(datetimeField).toBeDefined();
        expect(datetimeField!.field_type).toBe("date_time");
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
