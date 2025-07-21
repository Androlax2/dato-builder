import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildClient, type Client } from "@datocms/cma-client-node";
import { afterEach, beforeAll, describe, expect, it } from "@jest/globals";
import { CLI } from "../../../src/cli.js";

describe("BlockDependencies Integration Test", () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const testConfigPath = path.resolve(
    __dirname,
    "fixtures",
    "block-dependencies.config.js",
  );
  const API_TOKEN = process.env.DATOCMS_API_TOKEN;
  const createdBlockIds: string[] = [];
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

  afterEach(async () => {
    // Cleanup created blocks after tests
    if (createdBlockIds.length > 0) {
      try {
        for (const blockId of createdBlockIds) {
          await datoClient.itemTypes.destroy(blockId);
          console.log(`Successfully cleaned up test block: ${blockId}`);
        }
      } catch (error) {
        console.error("Failed to clean up created blocks:", error);
      }
    }
  });

  describe("Async Block Dependencies", () => {
    it("should build blocks with async getBlock() dependencies in correct order", async () => {
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
        // Execute CLI - this will build both TestBaseBlock and TestReferenceBlock
        // The dependency resolution should ensure TestBaseBlock is built first
        await cli.execute();

        // Verify both blocks were created in DatoCMS
        const itemTypes = await datoClient.itemTypes.list();

        // Find our test blocks
        const baseBlock = itemTypes.find(
          (item) => item.api_key === "test_base_block",
        );
        const referenceBlock = itemTypes.find(
          (item) => item.api_key === "test_reference_block",
        );

        expect(baseBlock).toBeDefined();
        expect(baseBlock!.name).toBe("Test Base Block");
        expect(baseBlock!.api_key).toBe("test_base_block");

        expect(referenceBlock).toBeDefined();
        expect(referenceBlock!.name).toBe("Test Reference Block");
        expect(referenceBlock!.api_key).toBe("test_reference_block");

        // Store the IDs for cleanup (reference block first, then base block)
        createdBlockIds.push(referenceBlock!.id);
        createdBlockIds.push(baseBlock!.id);

        // Verify the base block has the expected fields
        const baseFields = await datoClient.fields.list(baseBlock!.id);
        expect(baseFields).toHaveLength(2);

        const baseTitleField = baseFields.find(
          (field) => field.api_key === "title",
        );
        const baseActiveField = baseFields.find(
          (field) => field.api_key === "is_active",
        );

        expect(baseTitleField).toBeDefined();
        expect(baseTitleField!.field_type).toBe("string");
        expect(baseTitleField!.validators.required).toBeDefined();

        expect(baseActiveField).toBeDefined();
        expect(baseActiveField!.field_type).toBe("boolean");

        // Verify the reference block has the expected fields
        const refFields = await datoClient.fields.list(referenceBlock!.id);
        expect(refFields).toHaveLength(2);

        const refTitleField = refFields.find(
          (field) => field.api_key === "reference_title",
        );
        const refModularField = refFields.find(
          (field) => field.api_key === "base_block_reference",
        );

        expect(refTitleField).toBeDefined();
        expect(refTitleField!.field_type).toBe("string");
        expect(refTitleField!.validators.required).toBeDefined();

        expect(refModularField).toBeDefined();
        expect(refModularField!.field_type).toBe("rich_text");

        // Most importantly: verify the dependency was resolved correctly
        // The modular content field should reference the base block
        expect(refModularField!.validators.rich_text_blocks).toBeDefined();
        expect(
          (refModularField!.validators.rich_text_blocks as any).item_types,
        ).toBeDefined();
        expect(
          (refModularField!.validators.rich_text_blocks as any).item_types,
        ).toHaveLength(1);
        expect(
          (refModularField!.validators.rich_text_blocks as any).item_types[0],
        ).toBe(baseBlock!.id);
      } catch (error) {
        console.error("Block dependency build failed:", error);
        throw error;
      } finally {
        // Restore original process.argv
        process.argv = originalArgv;
      }
    }, 45000); // 45 second timeout for API calls (longer for dependency resolution)
  });
});
