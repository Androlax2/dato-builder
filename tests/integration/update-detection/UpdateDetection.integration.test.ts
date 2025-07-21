import fs from "node:fs";
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
  jest,
} from "@jest/globals";
import { CLI } from "../../../src/cli.js";

describe("UpdateDetection Integration Tests", () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const testConfigPath = path.resolve(
    __dirname,
    "fixtures",
    "update-detection.config.js",
  );
  const API_TOKEN = process.env.DATOCMS_API_TOKEN;
  let originalArgv: string[];
  let datoClient: Client;
  let createdBlockId: string | null = null;

  // Backup of original block file for modifications
  const blockFilePath = path.resolve(
    process.cwd(),
    "tests/integration/update-detection/fixtures/blocks/TestUpdateBlock.ts",
  );
  const blockBackupPath = `${blockFilePath}.original`;

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

    // Backup the original block file
    fs.copyFileSync(blockFilePath, blockBackupPath);
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

    // Restore original block file
    if (fs.existsSync(blockBackupPath)) {
      fs.copyFileSync(blockBackupPath, blockFilePath);
      fs.unlinkSync(blockBackupPath);
    }

    // Restore original argv
    process.argv = originalArgv;
  });

  afterEach(() => {
    // Restore original argv after each test
    process.argv = originalArgv;
  });

  describe("Initial Build and Baseline", () => {
    it("should create block with initial configuration", async () => {
      const cli = new CLI(testConfigPath);

      // Set up CLI arguments for build command
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
        (item) => item.api_key === "test_update_block",
      );

      expect(testBlock).toBeDefined();
      expect(testBlock!.name).toBe("Test Update Block");
      expect(testBlock!.api_key).toBe("test_update_block");

      // Store the ID for subsequent tests and cleanup
      createdBlockId = testBlock!.id;

      // Verify the block has the expected initial fields
      const fields = await datoClient.fields.list(testBlock!.id);
      expect(fields).toHaveLength(3); // title, count, is_active

      const titleField = fields.find((field) => field.api_key === "title");
      const countField = fields.find((field) => field.api_key === "count");
      const activeField = fields.find((field) => field.api_key === "is_active");

      expect(titleField).toBeDefined();
      expect(countField).toBeDefined();
      expect(activeField).toBeDefined();

      expect(titleField!.field_type).toBe("string");
      expect(countField!.field_type).toBe("integer");
      expect(activeField!.field_type).toBe("boolean");

      // Verify initial validators
      expect(titleField!.validators).toHaveProperty("required");
      expect(countField!.validators).toHaveProperty("number_range");
    }, 60000);
  });

  describe("Cache-Based Field Addition Detection", () => {
    it("should detect and add new fields using cache comparison", async () => {
      // First ensure block exists and is cached
      expect(createdBlockId).toBeTruthy();

      // Modify the block file to add a new field
      const modifiedBlockContent = `import type { BuilderContext } from "../../../../../src";
import BlockBuilder from "../../../../../src/BlockBuilder.js";

export default function buildTestUpdateBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Test Update Block",
    config,
    options: {
      api_key: "test_update_block",
      hint: "Block for testing update detection functionality",
    },
  })
    .addText({
      label: "Title",
      body: {
        api_key: "title",
        validators: {
          required: true,
        },
      },
    })
    .addInteger({
      label: "Count",
      body: {
        api_key: "count",
        validators: {
          number_range: {
            min: 0,
            max: 100,
          },
        },
      },
    })
    .addBoolean({
      label: "Is Active",
      body: {
        api_key: "is_active",
      },
    })
    .addText({
      label: "New Description",
      body: {
        api_key: "new_description",
      },
    });
}`;

      // Write the modified content
      fs.writeFileSync(blockFilePath, modifiedBlockContent);

      // Set up CLI arguments for build command (force rebuild to detect changes)
      process.argv = ["node", "dato-builder", "build", "--skip-deletion"];

      jest.resetModules(); // flush ESM registry in this worker

      const cli = new CLI(testConfigPath);

      // Execute build with modified block - should detect new field and add it
      await cli.execute();

      // Verify the new field was added
      const fields = await datoClient.fields.list(createdBlockId as string);
      expect(fields).toHaveLength(4); // title, count, is_active, new_description

      const newField = fields.find(
        (field) => field.api_key === "new_description",
      );
      expect(newField).toBeDefined();
      expect(newField!.field_type).toBe("string");
      expect(newField!.label).toBe("New Description");
    }, 60000);
  });

  describe("Cache-Based Validator Update Detection", () => {
    it("should detect and update field validators using cache comparison", async () => {
      // First ensure block exists and is cached
      expect(createdBlockId).toBeTruthy();

      // Modify the block file to update validators
      const modifiedBlockContent = `import type { BuilderContext } from "../../../../../src";
import BlockBuilder from "../../../../../src/BlockBuilder.js";

export default function buildTestUpdateBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Test Update Block",
    config,
    options: {
      api_key: "test_update_block",
      hint: "Block for testing update detection functionality",
    },
  })
    .addText({
      label: "Title",
      body: {
        api_key: "title",
        validators: {
          required: true,
        },
      },
    })
    .addInteger({
      label: "Count",
      body: {
        api_key: "count",
        validators: {
          number_range: {
            min: 0,
            max: 500, // Changed from 100 to 500
          },
        },
      },
    })
    .addBoolean({
      label: "Is Active",
      body: {
        api_key: "is_active",
      },
    });
}`;

      // Write the modified content
      fs.writeFileSync(blockFilePath, modifiedBlockContent);

      // Set up CLI arguments for build command (force rebuild to detect changes)
      process.argv = ["node", "dato-builder", "build", "--skip-deletion"];

      jest.resetModules(); // flush ESM registry in this worker

      const cli = new CLI(testConfigPath);

      // Execute build with updated validators - should detect changes and update
      await cli.execute();

      // Verify the validator was updated
      const fields = await datoClient.fields.list(createdBlockId as string);
      const countField = fields.find((field) => field.api_key === "count");

      expect(countField).toBeDefined();
      expect(countField!.validators).toHaveProperty("number_range");
      expect(countField!.validators.number_range).toEqual({
        min: 0,
        max: 500, // Updated max value
      });
    }, 60000);
  });

  describe("Field Label Update Detection", () => {
    it("should detect and update field labels", async () => {
      // First ensure block exists
      expect(createdBlockId).toBeTruthy();

      // Modify the block file to update field labels
      const modifiedBlockContent = `import type { BuilderContext } from "../../../../../src";
import BlockBuilder from "../../../../../src/BlockBuilder.js";

export default function buildTestUpdateBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Test Update Block",
    config,
    options: {
      api_key: "test_update_block",
      hint: "Block for testing update detection functionality",
    },
  })
    .addText({
      label: "Updated Title Label", // Changed from "Title"
      body: {
        api_key: "title",
        validators: {
          required: true,
        },
      },
    })
    .addInteger({
      label: "Updated Count Label", // Changed from "Count"
      body: {
        api_key: "count",
        validators: {
          number_range: {
            min: 0,
            max: 100,
          },
        },
      },
    })
    .addBoolean({
      label: "Is Active",
      body: {
        api_key: "is_active",
      },
    });
}`;

      // Write the modified content
      fs.writeFileSync(blockFilePath, modifiedBlockContent);

      // Set up CLI arguments for build command (force rebuild to detect changes)
      process.argv = ["node", "dato-builder", "build", "--skip-deletion"];

      jest.resetModules(); // flush ESM registry in this worker

      // Execute build with updated labels - should detect changes and update
      const cli = new CLI(testConfigPath);
      await cli.execute();

      // Verify the labels were updated
      const fields = await datoClient.fields.list(createdBlockId as string);

      const titleField = fields.find((field) => field.api_key === "title");
      const countField = fields.find((field) => field.api_key === "count");

      expect(titleField).toBeDefined();
      expect(countField).toBeDefined();

      expect(titleField!.label).toBe("Updated Title Label");
      expect(countField!.label).toBe("Updated Count Label");
    }, 60000);
  });

  describe("Configuration Consistency", () => {
    it("should maintain consistency across update cycles", async () => {
      // First ensure block exists
      expect(createdBlockId).toBeTruthy();

      jest.resetModules(); // flush ESM registry in this worker

      const cli = new CLI(testConfigPath);

      // Perform multiple update cycles
      for (let i = 0; i < 2; i++) {
        process.argv = ["node", "dato-builder", "build", "--skip-deletion"];

        await cli.execute();

        // Verify block still exists and maintains basic structure
        const itemTypes = await datoClient.itemTypes.list();
        const testBlock = itemTypes.find(
          (item) => item.api_key === "test_update_block",
        );

        expect(testBlock).toBeDefined();
        expect(testBlock!.id).toBe(createdBlockId);

        // Verify fields exist
        const fields = await datoClient.fields.list(createdBlockId as string);
        expect(fields.length).toBeGreaterThanOrEqual(3);
      }
    }, 120000);
  });
});
