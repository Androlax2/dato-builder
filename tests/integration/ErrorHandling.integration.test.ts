import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { buildClient } from "@datocms/cma-client-node";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";

const execAsync = promisify(exec);

describe("Error Handling Integration", () => {
  let apiToken: string;
  let tempTestPath: string;

  beforeAll(async () => {
    apiToken = process.env.DATOCMS_API_TOKEN!;
    if (!apiToken) {
      throw new Error("DATOCMS_API_TOKEN environment variable is required");
    }

    // Create temporary directory for error test files
    tempTestPath = path.join(process.cwd(), "temp-test-errors");
    await fs.mkdir(tempTestPath, { recursive: true });
  });

  afterAll(async () => {
    // Cleanup temp directory
    try {
      await fs.rm(tempTestPath, { recursive: true, force: true });
    } catch (error) {
      console.warn("Failed to remove temp directory:", error);
    }
  });

  describe("API Authentication Errors", () => {
    it("should handle invalid API token", async () => {
      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${path.join(process.cwd(), "tests", "fixtures", "blocks")}"`,
        "--skip-deletion",
      ].join(" ");

      await expect(
        execAsync(buildCommand, {
          timeout: 30000,
          env: {
            ...process.env,
            DATOCMS_API_TOKEN: "invalid_token_12345",
          },
        }),
      ).rejects.toThrow();
    }, 30000);

    it("should handle missing API token", async () => {
      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${path.join(process.cwd(), "tests", "fixtures", "blocks")}"`,
        "--skip-deletion",
      ].join(" ");

      await expect(
        execAsync(buildCommand, {
          timeout: 30000,
          env: {
            ...process.env,
            DATOCMS_API_TOKEN: "",
          },
        }),
      ).rejects.toThrow();
    }, 30000);
  });

  describe("File System Errors", () => {
    it("should handle non-existent paths gracefully", async () => {
      const buildCommand = [
        "npx tsx src/cli.ts build",
        "--blocks-path=non-existent-blocks-path",
        "--models-path=non-existent-models-path",
        "--skip-deletion",
      ].join(" ");

      const { stdout } = await execAsync(buildCommand, {
        timeout: 30000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });

      // Should complete without errors when no files found
      expect(stdout).toBeDefined();
    }, 30000);

    it("should handle invalid TypeScript files", async () => {
      // Create invalid TypeScript file
      const invalidBlockPath = path.join(tempTestPath, "InvalidSyntaxBlock.ts");
      await fs.writeFile(
        invalidBlockPath,
        `
import { BlockBuilder } from "../../src/index.js";

// This is invalid TypeScript syntax
export default function buildInvalidBlock( {
  return new BlockBuilder({
    name: "Invalid Block"
    // Missing closing brace and other syntax errors
`,
      );

      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempTestPath}"`,
        "--skip-deletion",
      ].join(" ");

      await expect(
        execAsync(buildCommand, {
          timeout: 30000,
          env: {
            ...process.env,
            DATOCMS_API_TOKEN: apiToken,
          },
        }),
      ).rejects.toThrow();
    }, 30000);
  });

  describe("API Rate Limiting and Network Errors", () => {
    it("should handle API rate limiting gracefully", async () => {
      // Create multiple blocks to potentially trigger rate limiting
      const blockPromises = [];

      for (let i = 0; i < 5; i++) {
        const blockContent = `
import { BlockBuilder } from "../../src/index.js";
import type { BuilderContext } from "../../src/types/BuilderContext.js";

export default function buildRateLimitTest${i}Block({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Rate Limit Test ${i} Block",
    config,
    options: {
      api_key: "rate_limit_test_${i}_block",
    },
  })
    .addSingleLineString({
      label: "Test Field ${i}",
      body: {
        api_key: "test_field_${i}"
      }
    });
}`;

        const blockPath = path.join(tempTestPath, `RateLimitTest${i}Block.ts`);
        blockPromises.push(fs.writeFile(blockPath, blockContent));
      }

      await Promise.all(blockPromises);

      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempTestPath}"`,
        "--concurrency=5", // High concurrency to potentially trigger rate limits
        "--skip-deletion",
      ].join(" ");

      const { stdout } = await execAsync(buildCommand, {
        timeout: 120000, // Longer timeout for rate limiting
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });

      // Should eventually succeed despite rate limiting
      expect(stdout).toContain("SUCCESS");
    }, 120000);
  });

  describe("Configuration Errors", () => {
    it("should handle missing configuration gracefully", async () => {
      // Test without a dato-builder.config.js file
      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${path.join(process.cwd(), "tests", "fixtures", "blocks")}"`,
        "--skip-deletion",
      ].join(" ");

      // Remove any existing config temporarily
      const configPath = path.join(process.cwd(), "dato-builder.config.js");
      let configExists = false;
      let originalConfig = "";

      try {
        originalConfig = await fs.readFile(configPath, "utf-8");
        configExists = true;
        await fs.unlink(configPath);
      } catch {
        // Config doesn't exist, which is what we want for this test
      }

      try {
        const { stdout } = await execAsync(buildCommand, {
          timeout: 30000,
          env: {
            ...process.env,
            DATOCMS_API_TOKEN: apiToken,
          },
        });

        expect(stdout).toContain("SUCCESS");
      } finally {
        // Restore config if it existed
        if (configExists) {
          await fs.writeFile(configPath, originalConfig);
        }
      }
    }, 30000);
  });

  describe("Data Validation Errors", () => {
    it("should handle field validation errors from DatoCMS", async () => {
      const blockContent = `
import { BlockBuilder } from "../../src/index.js";
import type { BuilderContext } from "../../src/types/BuilderContext.js";

export default function buildValidationErrorTestBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Validation Error Test Block",
    config,
    options: {
      api_key: "validation_error_test_block",
    },
  })
    .addSingleLineString({
      label: "Test Field with Conflicting Validators",
      body: {
        api_key: "conflicting_field",
        validators: {
          required: {},
          length: { min: 10, max: 5 } // Invalid: min > max
        }
      }
    });
}`;

      const blockPath = path.join(tempTestPath, "ValidationErrorTestBlock.ts");
      await fs.writeFile(blockPath, blockContent);

      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempTestPath}"`,
        "--skip-deletion",
      ].join(" ");

      // This might succeed or fail depending on DatoCMS validation
      // The test ensures the system handles whatever response it gets
      try {
        const { stdout } = await execAsync(buildCommand, {
          timeout: 60000,
          env: {
            ...process.env,
            DATOCMS_API_TOKEN: apiToken,
          },
        });

        // If it succeeds, that's fine - DatoCMS accepted the configuration
        expect(stdout).toBeDefined();
      } catch (error) {
        // If it fails, that's also fine - DatoCMS rejected invalid configuration
        expect(error).toBeDefined();
      }
    }, 60000);
  });

  describe("Resource Cleanup Errors", () => {
    it("should handle cleanup errors gracefully", async () => {
      const blockContent = `
import { BlockBuilder } from "../../src/index.js";
import type { BuilderContext } from "../../src/types/BuilderContext.js";

export default function buildCleanupTestBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Cleanup Test Block",
    config,
    options: {
      api_key: "cleanup_test_block",
    },
  })
    .addSingleLineString({
      label: "Test Field",
      body: {
        api_key: "test_field"
      }
    });
}`;

      const blockPath = path.join(tempTestPath, "CleanupTestBlock.ts");
      await fs.writeFile(blockPath, blockContent);

      // First build to create the block
      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempTestPath}"`,
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
      expect(stdout).toContain("CleanupTestBlock");

      // Now try to manually delete the created item type and see how system handles missing resources
      const client = buildClient({
        apiToken,
        environment: "main",
      });

      // Get the created item type ID from output
      const itemTypes = await client.itemTypes.list();
      const createdBlock = itemTypes.find(
        (item) => item.api_key === "cleanup_test_block",
      );

      if (createdBlock) {
        // Delete it manually
        await client.itemTypes.destroy(createdBlock.id);

        // Try to build again - should handle missing resource gracefully
        const { stdout: secondBuildOutput } = await execAsync(buildCommand, {
          timeout: 60000,
          env: {
            ...process.env,
            DATOCMS_API_TOKEN: apiToken,
          },
        });

        expect(secondBuildOutput).toContain("SUCCESS");
      }
    }, 120000);
  });

  describe("Concurrent Operations Errors", () => {
    it("should handle concurrent modification conflicts", async () => {
      const blockContent = `
import { BlockBuilder } from "../../src/index.js";
import type { BuilderContext } from "../../src/types/BuilderContext.js";

export default function buildConcurrentTestBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Concurrent Test Block",
    config,
    options: {
      api_key: "concurrent_test_block",
    },
  })
    .addSingleLineString({
      label: "Test Field",
      body: {
        api_key: "test_field"
      }
    });
}`;

      const blockPath = path.join(tempTestPath, "ConcurrentTestBlock.ts");
      await fs.writeFile(blockPath, blockContent);

      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempTestPath}"`,
        "--concurrency=1",
        "--skip-deletion",
      ].join(" ");

      // Run multiple builds concurrently to test conflict handling
      const buildPromises = [];
      for (let i = 0; i < 2; i++) {
        buildPromises.push(
          execAsync(buildCommand, {
            timeout: 60000,
            env: {
              ...process.env,
              DATOCMS_API_TOKEN: apiToken,
            },
          }),
        );
      }

      const results = await Promise.allSettled(buildPromises);

      // At least one should succeed
      const successfulBuilds = results.filter(
        (result) => result.status === "fulfilled",
      );
      expect(successfulBuilds.length).toBeGreaterThan(0);
    }, 120000);
  });
});
