import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildClient, type Client } from "@datocms/cma-client-node";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
} from "@jest/globals";
import { CLI } from "../../../src/cli.js";

describe("SubsequentBuilds Integration Tests", () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const testConfigPath = path.resolve(
    __dirname,
    "fixtures",
    "subsequent-builds.config.js",
  );
  const API_TOKEN = process.env.DATOCMS_API_TOKEN;
  let originalArgv: string[];
  let datoClient: Client;
  let createdBlockId: string | null = null;

  beforeAll(async () => {
    // Ensure we have a DatoCMS API token for integration tests
    if (!API_TOKEN) {
      throw new Error(
        "DATOCMS_API_TOKEN environment variable is required for integration tests",
      );
    }

    // Initialize DatoCMS client and store original argv
    datoClient = buildClient({ apiToken: API_TOKEN });
    originalArgv = process.argv;
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

    // Restore original argv
    process.argv = originalArgv;
  });

  afterEach(() => {
    // Restore original argv after each test
    process.argv = originalArgv;
  });

  describe("First Build", () => {
    it("should create block on first build", async () => {
      const cli = new CLI(testConfigPath);

      // Set up CLI arguments for build command (no cache to ensure fresh build)
      process.argv = [
        "node",
        "dato-builder",
        "build",
        "--skip-deletion",
        "--no-cache",
      ];

      // Execute first build
      await cli.execute();

      // Verify the block was created in DatoCMS
      const itemTypes = await datoClient.itemTypes.list();
      const testBlock = itemTypes.find(
        (item) => item.api_key === "test_state_block",
      );

      expect(testBlock).toBeDefined();
      expect(testBlock!.name).toBe("Test State Block");
      expect(testBlock!.api_key).toBe("test_state_block");

      // Store the ID for subsequent tests and cleanup
      createdBlockId = testBlock!.id;

      // Verify the block has the expected fields
      const fields = await datoClient.fields.list(testBlock!.id);
      expect(fields).toHaveLength(3); // title, is_published, view_count

      const titleField = fields.find((field) => field.api_key === "title");
      const publishedField = fields.find(
        (field) => field.api_key === "is_published",
      );
      const viewCountField = fields.find(
        (field) => field.api_key === "view_count",
      );

      expect(titleField).toBeDefined();
      expect(publishedField).toBeDefined();
      expect(viewCountField).toBeDefined();

      expect(titleField!.field_type).toBe("string");
      expect(publishedField!.field_type).toBe("boolean");
      expect(viewCountField!.field_type).toBe("integer");
    }, 60000);
  });

  describe("Subsequent Build (Cached)", () => {
    it("should use cache on subsequent build without --no-cache", async () => {
      // First ensure block exists
      expect(createdBlockId).toBeTruthy();

      const cli = new CLI(testConfigPath);

      // Set up CLI arguments for build command (with cache enabled)
      process.argv = [
        "node",
        "dato-builder",
        "build",
        "--skip-deletion",
        // No --no-cache flag - should use cache
      ];

      // Execute second build (should use cache)
      await cli.execute();

      // Verify the block still exists and wasn't duplicated
      const itemTypes = await datoClient.itemTypes.list();
      const testBlocks = itemTypes.filter(
        (item) => item.api_key === "test_state_block",
      );

      // Should still be only one block with this API key
      expect(testBlocks).toHaveLength(1);
      expect(testBlocks[0]?.id).toBe(createdBlockId);

      // Verify fields are still the same
      const fields = await datoClient.fields.list(createdBlockId as string);
      expect(fields).toHaveLength(3);
    }, 60000);
  });

  describe("Forced Rebuild", () => {
    it("should rebuild when forced with --no-cache", async () => {
      // First ensure block exists
      expect(createdBlockId).toBeTruthy();

      const cli = new CLI(testConfigPath);

      // Set up CLI arguments for build command (force rebuild)
      process.argv = [
        "node",
        "dato-builder",
        "build",
        "--skip-deletion",
        "--no-cache", // Force rebuild
      ];

      // Execute forced rebuild
      await cli.execute();

      // Verify the block still exists and wasn't duplicated
      const itemTypes = await datoClient.itemTypes.list();
      const testBlocks = itemTypes.filter(
        (item) => item.api_key === "test_state_block",
      );

      // Should still be only one block with this API key
      expect(testBlocks).toHaveLength(1);
      expect(testBlocks[0]?.id).toBe(createdBlockId);

      // Verify fields are still correct after forced rebuild
      const fields = await datoClient.fields.list(createdBlockId as string);
      expect(fields).toHaveLength(3);

      const titleField = fields.find((field) => field.api_key === "title");
      const publishedField = fields.find(
        (field) => field.api_key === "is_published",
      );
      const viewCountField = fields.find(
        (field) => field.api_key === "view_count",
      );

      expect(titleField).toBeDefined();
      expect(publishedField).toBeDefined();
      expect(viewCountField).toBeDefined();
    }, 60000);
  });

  describe("No Duplication Verification", () => {
    it("should never create duplicate blocks on multiple builds", async () => {
      // First ensure block exists
      expect(createdBlockId).toBeTruthy();

      const cli = new CLI(testConfigPath);

      // Run multiple builds to ensure no duplication
      for (let i = 0; i < 3; i++) {
        process.argv = [
          "node",
          "dato-builder",
          "build",
          "--skip-deletion",
          i % 2 === 0 ? "--no-cache" : "", // Alternate between cache and no-cache
        ].filter(Boolean);

        await cli.execute();
      }

      // Verify only one block exists
      const itemTypes = await datoClient.itemTypes.list();
      const testBlocks = itemTypes.filter(
        (item) => item.api_key === "test_state_block",
      );

      expect(testBlocks).toHaveLength(1);
      expect(testBlocks[0]?.id).toBe(createdBlockId as string);
    }, 120000);
  });
});
