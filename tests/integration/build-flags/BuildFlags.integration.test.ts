import path from "node:path";
import { buildClient, type Client } from "@datocms/cma-client-node";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { CLI } from "../../../src/cli.js";

describe("BuildFlags Integration Test", () => {
  const testConfigPath = path.resolve(
    process.cwd(),
    "tests/integration/build-flags/fixtures/build-flags.config.js",
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

  afterAll(async () => {
    // Cleanup: Delete all test blocks from DatoCMS
    for (const blockId of createdBlockIds) {
      try {
        await datoClient.itemTypes.destroy(blockId);
        console.log(`Successfully cleaned up test block: ${blockId}`);
      } catch (error) {
        console.warn("Error during cleanup:", error);
      }
    }
  });

  describe("CLI Build Flags", () => {
    it("should build with --skip-deletion flag (prevents accidental deletions)", async () => {
      // Create CLI instance with test-specific config
      const cli = new CLI(testConfigPath);

      // Mock process.argv to simulate build command with --skip-deletion flag
      const originalArgv = process.argv;
      process.argv = ["node", "dato-builder", "build", "--skip-deletion"];

      try {
        // Execute CLI - this will build the TestBuildFlagsBlock to DatoCMS
        await cli.execute();

        // Verify the block was actually created in DatoCMS
        const itemTypes = await datoClient.itemTypes.list();

        // Find our test block
        const testBlock = itemTypes.find(
          (item) => item.api_key === "test_build_flags_block",
        );

        expect(testBlock).toBeDefined();
        expect(testBlock!.name).toBe("Test Build Flags Block");
        expect(testBlock!.api_key).toBe("test_build_flags_block");

        // Store the ID for cleanup
        createdBlockIds.push(testBlock!.id);

        // Verify the block has the expected fields
        const fields = await datoClient.fields.list(testBlock!.id);
        expect(fields).toHaveLength(2);

        const titleField = fields.find((field) => field.api_key === "title");
        const publishedField = fields.find(
          (field) => field.api_key === "published",
        );

        expect(titleField).toBeDefined();
        expect(titleField!.field_type).toBe("string");
        expect(titleField!.validators.required).toBeDefined();

        expect(publishedField).toBeDefined();
        expect(publishedField!.field_type).toBe("boolean");
      } catch (error) {
        console.error("Build with --skip-deletion failed:", error);
        throw error;
      } finally {
        // Restore original process.argv
        process.argv = originalArgv;
      }
    }, 30000); // 30 second timeout for API calls

    it("should build with --no-cache flag (forces rebuild without cache)", async () => {
      // Create CLI instance with test-specific config
      const cli = new CLI(testConfigPath);

      // Mock process.argv to simulate build command with --no-cache flag
      const originalArgv = process.argv;
      process.argv = [
        "node",
        "dato-builder",
        "build",
        "--skip-deletion",
        "--no-cache",
      ];

      try {
        // Execute CLI - this should force a rebuild without using cache
        await cli.execute();

        // Since the block already exists from the previous test, this should update it
        // Verify it still exists and is accessible
        const itemTypes = await datoClient.itemTypes.list();
        const testBlock = itemTypes.find(
          (item) => item.api_key === "test_build_flags_block",
        );

        expect(testBlock).toBeDefined();
        expect(testBlock!.name).toBe("Test Build Flags Block");

        // Verify the fields are still correct (no duplication)
        const fields = await datoClient.fields.list(testBlock!.id);
        expect(fields).toHaveLength(2);
      } catch (error) {
        console.error("Build with --no-cache failed:", error);
        throw error;
      } finally {
        // Restore original process.argv
        process.argv = originalArgv;
      }
    }, 30000); // 30 second timeout for API calls

    it("should build with --auto-concurrency flag (enables automatic concurrency)", async () => {
      // Create CLI instance with test-specific config
      const cli = new CLI(testConfigPath);

      // Mock process.argv to simulate build command with --auto-concurrency flag
      const originalArgv = process.argv;
      process.argv = [
        "node",
        "dato-builder",
        "build",
        "--skip-deletion",
        "--auto-concurrency",
      ];

      try {
        // Execute CLI - this should enable automatic concurrency management
        await cli.execute();

        // Verify the block still exists and works with concurrency enabled
        const itemTypes = await datoClient.itemTypes.list();
        const testBlock = itemTypes.find(
          (item) => item.api_key === "test_build_flags_block",
        );

        expect(testBlock).toBeDefined();
        expect(testBlock!.name).toBe("Test Build Flags Block");

        // Verify fields are correct
        const fields = await datoClient.fields.list(testBlock!.id);
        expect(fields).toHaveLength(2);
      } catch (error) {
        console.error("Build with --auto-concurrency failed:", error);
        throw error;
      } finally {
        // Restore original process.argv
        process.argv = originalArgv;
      }
    }, 30000); // 30 second timeout for API calls

    it("should build with combined flags (--skip-deletion --no-cache --auto-concurrency)", async () => {
      // Create CLI instance with test-specific config
      const cli = new CLI(testConfigPath);

      // Mock process.argv to simulate build command with multiple flags
      const originalArgv = process.argv;
      process.argv = [
        "node",
        "dato-builder",
        "build",
        "--skip-deletion",
        "--no-cache",
        "--auto-concurrency",
      ];

      try {
        // Execute CLI - this should work with all flags combined
        await cli.execute();

        // Verify the block still exists and works with all flags
        const itemTypes = await datoClient.itemTypes.list();
        const testBlock = itemTypes.find(
          (item) => item.api_key === "test_build_flags_block",
        );

        expect(testBlock).toBeDefined();
        expect(testBlock!.name).toBe("Test Build Flags Block");

        // Verify fields are correct
        const fields = await datoClient.fields.list(testBlock!.id);
        expect(fields).toHaveLength(2);
      } catch (error) {
        console.error("Build with combined flags failed:", error);
        throw error;
      } finally {
        // Restore original process.argv
        process.argv = originalArgv;
      }
    }, 30000); // 30 second timeout for API calls
  });
});
