import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { buildClient } from "@datocms/cma-client-node";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";

const execAsync = promisify(exec);

describe("Comprehensive Workflow Integration", () => {
  let apiToken: string;
  let client: any;
  let tempBlocksPath: string;
  let tempModelsPath: string;
  // All DatoCMS resources will be cleaned up in afterAll

  beforeAll(async () => {
    apiToken = process.env.DATOCMS_API_TOKEN!;
    if (!apiToken) {
      throw new Error("DATOCMS_API_TOKEN environment variable is required");
    }

    client = buildClient({
      apiToken,
      environment: "main",
    });

    // Record initial state of DatoCMS
    const initialItemTypes = await client.itemTypes.list();
    console.log(
      `Found ${initialItemTypes.length} existing item types in DatoCMS`,
    );

    // Clear all existing blocks/models for clean test environment
    console.log(
      "Clearing existing DatoCMS resources for clean test environment...",
    );
    for (const itemType of initialItemTypes) {
      try {
        await client.itemTypes.destroy(itemType.id);
        console.log(
          `Deleted existing item type: ${itemType.name} (${itemType.api_key})`,
        );
      } catch (error) {
        console.warn(
          `Failed to delete existing item type ${itemType.id}:`,
          error,
        );
      }
    }

    // Create temporary directories for test files
    tempBlocksPath = path.join(process.cwd(), "temp-test-blocks");
    tempModelsPath = path.join(process.cwd(), "temp-test-models");
    await fs.mkdir(tempBlocksPath, { recursive: true });
    await fs.mkdir(tempModelsPath, { recursive: true });
  });

  afterAll(async () => {
    console.log("Starting comprehensive cleanup...");

    // Get all current item types
    const allCurrentItemTypes = await client.itemTypes.list();
    console.log(`Found ${allCurrentItemTypes.length} item types to clean up`);

    // Delete all item types created during tests
    for (const itemType of allCurrentItemTypes) {
      try {
        await client.itemTypes.destroy(itemType.id);
        console.log(
          `Deleted item type: ${itemType.name} (${itemType.api_key})`,
        );
      } catch (error) {
        console.warn(`Failed to cleanup item type ${itemType.id}:`, error);
      }
    }

    // Optionally restore initial state (commented out as it might not be desired)
    // console.log("Restoring initial DatoCMS state...");
    // This would require backing up the initial item types before deletion

    console.log("DatoCMS cleanup completed");

    // Cleanup temp directories
    try {
      await fs.rm(tempBlocksPath, { recursive: true, force: true });
      await fs.rm(tempModelsPath, { recursive: true, force: true });
      console.log("Temporary directories cleaned up");
    } catch (error) {
      console.warn("Failed to remove temp directories:", error);
    }
  });

  describe("Resource Creation and DatoCMS Verification", () => {
    it("should create resources in DatoCMS and verify they exist", async () => {
      // Create a test block file
      const blockContent = `
import { BlockBuilder } from "../../src/index.js";
import type { BuilderContext } from "../../src/types/BuilderContext.js";

export default function buildTestIntegrationBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Test Integration Block",
    config,
    options: {
      api_key: "test_integration_block",
    },
  })
    .addSingleLineString({
      label: "Title",
      body: {
        api_key: "title_field",
        validators: { required: {} }
      }
    })
    .addTextarea({
      label: "Description", 
      body: {
        api_key: "description_field"
      }
    });
}`;

      const blockPath = path.join(tempBlocksPath, "TestIntegrationBlock.ts");
      await fs.writeFile(blockPath, blockContent);

      // Get current item types count (should be 0 after beforeAll cleanup)
      const currentItemTypes = await client.itemTypes.list();
      const currentCount = currentItemTypes.length;

      // Build with deletion disabled to prevent interference
      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempBlocksPath}"`,
        "--skip-deletion",
      ].join(" ");

      const { stdout } = await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });

      expect(stdout).toContain("SUCCESS");
      expect(stdout).toContain("TestIntegrationBlock");

      // Verify the item type was actually created in DatoCMS
      const updatedItemTypes = await client.itemTypes.list();
      expect(updatedItemTypes.length).toBe(currentCount + 1);

      const createdItemType = updatedItemTypes.find(
        (item: any) => item.api_key === "test_integration_block",
      );
      expect(createdItemType).toBeDefined();
      expect(createdItemType.name).toBe("Test Integration Block");

      // Item type will be cleaned up in afterAll

      // Verify fields were created
      const fields = await client.fields.list(createdItemType.id);
      expect(fields.length).toBe(2);

      const titleField = fields.find((f: any) => f.api_key === "title_field");
      const descField = fields.find(
        (f: any) => f.api_key === "description_field",
      );

      expect(titleField).toBeDefined();
      expect(titleField.field_type).toBe("string");
      expect(titleField.label).toBe("Title");

      expect(descField).toBeDefined();
      expect(descField.field_type).toBe("text");
      expect(descField.label).toBe("Description");
    }, 90000);
  });

  describe("Resource Updates and Field Synchronization", () => {
    it("should update existing resources when changes are made", async () => {
      // Create initial block
      const initialBlockContent = `
import { BlockBuilder } from "../../src/index.js";
import type { BuilderContext } from "../../src/types/BuilderContext.js";

export default function buildUpdateTestBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Update Test Block",
    config,
    options: {
      api_key: "update_test_block",
    },
  })
    .addSingleLineString({
      label: "Original Field",
      body: {
        api_key: "original_field"
      }
    });
}`;

      const blockPath = path.join(tempBlocksPath, "UpdateTestBlock.ts");
      await fs.writeFile(blockPath, initialBlockContent);

      // First build
      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempBlocksPath}"`,
        "--skip-deletion",
      ].join(" ");

      await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });

      // Get the created item type
      const itemTypes = await client.itemTypes.list();
      const itemType = itemTypes.find(
        (item: any) => item.api_key === "update_test_block",
      );
      expect(itemType).toBeDefined();
      // Item type will be cleaned up in afterAll

      // Verify initial field
      let fields = await client.fields.list(itemType.id);
      expect(fields.length).toBe(1);
      expect(fields[0].api_key).toBe("original_field");

      // Update the block to add a new field
      const updatedBlockContent = `
import { BlockBuilder } from "../../src/index.js";
import type { BuilderContext } from "../../src/types/BuilderContext.js";

export default function buildUpdateTestBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Update Test Block",
    config,
    options: {
      api_key: "update_test_block",
    },
  })
    .addSingleLineString({
      label: "Original Field",
      body: {
        api_key: "original_field"
      }
    })
    .addInteger({
      label: "New Field",
      body: {
        api_key: "new_field"
      }
    });
}`;

      await fs.writeFile(blockPath, updatedBlockContent);

      // Second build
      await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });

      // Verify the new field was added
      fields = await client.fields.list(itemType.id);
      expect(fields.length).toBe(2);

      const newField = fields.find((f: any) => f.api_key === "new_field");
      expect(newField).toBeDefined();
      expect(newField.field_type).toBe("integer");
      expect(newField.label).toBe("New Field");
    }, 120000);
  });

  describe("Deletion Workflow Testing", () => {
    it("should detect and delete orphaned resources when deletion is enabled", async () => {
      // Create a temporary block that we'll remove from filesystem
      const tempBlockContent = `
import { BlockBuilder } from "../../src/index.js";
import type { BuilderContext } from "../../src/types/BuilderContext.js";

export default function buildTempDeletionBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Temp Deletion Block",
    config,
    options: {
      api_key: "temp_deletion_block",
    },
  })
    .addSingleLineString({
      label: "Temp Field",
      body: {
        api_key: "temp_field"
      }
    });
}`;

      const tempBlockPath = path.join(tempBlocksPath, "TempDeletionBlock.ts");
      await fs.writeFile(tempBlockPath, tempBlockContent);

      // First build to create the block
      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempBlocksPath}"`,
        "--skip-deletion",
      ].join(" ");

      await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });

      // Verify the block was created
      let itemTypes = await client.itemTypes.list();
      let tempBlock = itemTypes.find(
        (item: any) => item.api_key === "temp_deletion_block",
      );
      expect(tempBlock).toBeDefined();

      // Remove the block file from filesystem
      await fs.unlink(tempBlockPath);

      // Build with deletion enabled
      const deletionBuildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempBlocksPath}"`,
        "--skip-deletion-confirmation", // Skip manual confirmation for testing
      ].join(" ");

      const { stdout } = await execAsync(deletionBuildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });

      // Should indicate deletion occurred
      expect(stdout).toMatch(/delet(ed|ing)|remov(ed|ing)/i);

      // Verify the block was actually deleted from DatoCMS
      itemTypes = await client.itemTypes.list();
      tempBlock = itemTypes.find(
        (item: any) => item.api_key === "temp_deletion_block",
      );
      expect(tempBlock).toBeUndefined();
    }, 120000);
  });

  describe("Cache Functionality Testing", () => {
    it("should use cache for subsequent builds", async () => {
      // Create a block for cache testing
      const cacheBlockContent = `
import { BlockBuilder } from "../../src/index.js";
import type { BuilderContext } from "../../src/types/BuilderContext.js";

export default function buildCacheTestBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Cache Test Block",
    config,
    options: {
      api_key: "cache_test_block",
    },
  })
    .addSingleLineString({
      label: "Cache Field",
      body: {
        api_key: "cache_field"
      }
    });
}`;

      const blockPath = path.join(tempBlocksPath, "CacheTestBlock.ts");
      await fs.writeFile(blockPath, cacheBlockContent);

      // First build (should populate cache)
      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempBlocksPath}"`,
        "--skip-deletion",
      ].join(" ");

      const startTime1 = Date.now();
      const { stdout: firstBuild } = await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });
      const firstBuildTime = Date.now() - startTime1;

      expect(firstBuild).toContain("SUCCESS");

      // Item type will be cleaned up in afterAll

      // Second build (should use cache and be faster)
      const startTime2 = Date.now();
      const { stdout: secondBuild } = await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });
      const secondBuildTime = Date.now() - startTime2;

      expect(secondBuild).toContain("SUCCESS");

      // Second build should be significantly faster due to caching
      expect(secondBuildTime).toBeLessThan(firstBuildTime * 0.8);

      // Test with cache disabled
      const noCacheBuildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempBlocksPath}"`,
        "--skip-deletion",
        "--no-cache",
      ].join(" ");

      const startTime3 = Date.now();
      const { stdout: noCacheBuild } = await execAsync(noCacheBuildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });
      const noCacheBuildTime = Date.now() - startTime3;

      expect(noCacheBuild).toContain("SUCCESS");

      // No cache build should take longer than cached build
      expect(noCacheBuildTime).toBeGreaterThan(secondBuildTime);
    }, 180000);
  });

  describe("Complex Dependency Resolution", () => {
    it("should handle dependencies between blocks and models correctly", async () => {
      // Create a base block
      const baseBlockContent = `
import { BlockBuilder } from "../../src/index.js";
import type { BuilderContext } from "../../src/types/BuilderContext.js";

export default function buildDependencyBaseBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Dependency Base Block",
    config,
    options: {
      api_key: "dependency_base_block",
    },
  })
    .addSingleLineString({
      label: "Base Field",
      body: {
        api_key: "base_field"
      }
    });
}`;

      // Create a model that references the block
      const modelContent = `
import { ModelBuilder } from "../../src/index.js";
import type { BuilderContext } from "../../src/types/BuilderContext.js";

export default async function buildDependencyModel({ config, getBlock }: BuilderContext) {
  const baseBlockId = await getBlock("DependencyBaseBlock");
  
  return new ModelBuilder({
    name: "Dependency Model",
    config,
    options: {
      api_key: "dependency_model",
    },
  })
    .addSingleLineString({
      label: "Model Field",
      body: {
        api_key: "model_field"
      }
    })
    .addModularContent({
      label: "Content Blocks",
      body: {
        api_key: "content_blocks",
        validators: {
          rich_text_blocks: {
            item_types: [baseBlockId]
          }
        }
      }
    });
}`;

      const baseBlockPath = path.join(tempBlocksPath, "DependencyBaseBlock.ts");
      const modelPath = path.join(tempModelsPath, "DependencyModel.ts");

      await fs.writeFile(baseBlockPath, baseBlockContent);
      await fs.writeFile(modelPath, modelContent);

      // Build both blocks and models
      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempBlocksPath}"`,
        `--models-path="${tempModelsPath}"`,
        "--skip-deletion",
      ].join(" ");

      const { stdout } = await execAsync(buildCommand, {
        timeout: 90000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });

      expect(stdout).toContain("SUCCESS");
      expect(stdout).toContain("DependencyBaseBlock");
      expect(stdout).toContain("DependencyModel");

      // Verify both were created in DatoCMS
      const itemTypes = await client.itemTypes.list();

      const baseBlock = itemTypes.find(
        (item: any) => item.api_key === "dependency_base_block",
      );
      const model = itemTypes.find(
        (item: any) => item.api_key === "dependency_model",
      );

      expect(baseBlock).toBeDefined();
      expect(model).toBeDefined();

      // Item types will be cleaned up in afterAll

      // Verify the modular content field references the block correctly
      const modelFields = await client.fields.list(model.id);
      const modularContentField = modelFields.find(
        (f: any) => f.api_key === "content_blocks",
      );

      expect(modularContentField).toBeDefined();
      expect(modularContentField.field_type).toBe("rich_text");
      expect(
        modularContentField.validators.rich_text_blocks.item_types,
      ).toContain(baseBlock.id);
    }, 120000);
  });
});
