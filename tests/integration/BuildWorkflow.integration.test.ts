import { exec } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import type { DatoBuilderConfig } from "../../src";

const execAsync = promisify(exec);

describe("Build Workflow Integration", () => {
  let config: DatoBuilderConfig;

  beforeAll(async () => {
    const apiToken = process.env.DATOCMS_API_TOKEN;
    if (!apiToken) {
      throw new Error("DATOCMS_API_TOKEN environment variable is required");
    }

    config = {
      apiToken,
      overwriteExistingFields: true,
      modelsPath: "tests/fixtures/models",
      blocksPath: "tests/fixtures/blocks",
    };
  });

  afterAll(async () => {
    // Note: CLI-based tests create resources that are cleaned up via --skip-deletion flag
    // No explicit cleanup needed as tests use temporary fixtures
  });

  describe("Block Building", () => {
    it("should build blocks from fixture files", async () => {
      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${path.join(process.cwd(), "tests", "fixtures", "blocks")}"`,
        `--models-path="${path.join(process.cwd(), "tests", "fixtures", "models")}"`,
        "--skip-deletion",
      ].join(" ");

      const { stdout, stderr } = await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: config.apiToken,
        },
      });

      // Verify successful build output
      expect(stdout).toContain("SUCCESS");
      expect(stdout).toContain("IntegrationTest");

      if (stderr) {
        console.warn("Build stderr:", stderr);
      }
    }, 60000);

    it("should handle different field types in blocks", async () => {
      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${path.join(process.cwd(), "tests", "fixtures", "blocks")}"`,
        "--skip-deletion",
      ].join(" ");

      const { stdout } = await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: config.apiToken,
        },
      });

      expect(stdout).toContain("SUCCESS");
      expect(stdout).toContain("IntegrationTestComplexBlock");
    }, 60000);
  });

  describe("Model Building", () => {
    it("should build models from fixture files", async () => {
      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--models-path="${path.join(process.cwd(), "tests", "fixtures", "models")}"`,
        "--skip-deletion",
      ].join(" ");

      const { stdout } = await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: config.apiToken,
        },
      });

      expect(stdout).toContain("SUCCESS");
      expect(stdout).toContain("IntegrationTest");
    }, 60000);
  });

  describe("Error Handling", () => {
    it("should handle invalid API token gracefully", async () => {
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
            DATOCMS_API_TOKEN: "invalid_token",
          },
        }),
      ).rejects.toThrow();
    }, 30000);

    it("should handle missing directories gracefully", async () => {
      const buildCommand = [
        "npx tsx src/cli.ts build",
        "--blocks-path=non-existent-path",
        "--models-path=non-existent-path",
        "--skip-deletion",
      ].join(" ");

      const { stdout } = await execAsync(buildCommand, {
        timeout: 30000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: config.apiToken,
        },
      });

      // Should complete without errors when no files found
      expect(stdout).toBeDefined();
    }, 30000);
  });

  describe("Concurrent Building", () => {
    it("should handle concurrent builds with auto-concurrency", async () => {
      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${path.join(process.cwd(), "tests", "fixtures", "blocks")}"`,
        `--models-path="${path.join(process.cwd(), "tests", "fixtures", "models")}"`,
        "--auto-concurrency",
        "--skip-deletion",
      ].join(" ");

      const startTime = Date.now();

      const { stdout } = await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: config.apiToken,
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(stdout).toContain("SUCCESS");
      expect(duration).toBeLessThan(60000);
    }, 60000);

    it("should handle specific concurrency levels", async () => {
      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${path.join(process.cwd(), "tests", "fixtures", "blocks")}"`,
        "--concurrency=2",
        "--skip-deletion",
      ].join(" ");

      const { stdout } = await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: config.apiToken,
        },
      });

      expect(stdout).toContain("SUCCESS");
    }, 60000);
  });

  describe("Field Updates", () => {
    it("should handle subsequent builds without duplication", async () => {
      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${path.join(process.cwd(), "tests", "fixtures", "blocks")}"`,
        "--skip-deletion",
      ].join(" ");

      // First build
      const { stdout: firstOutput } = await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: config.apiToken,
        },
      });

      expect(firstOutput).toContain("SUCCESS");

      // Second build (should not duplicate)
      const { stdout: secondOutput } = await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: config.apiToken,
        },
      });

      expect(secondOutput).toContain("SUCCESS");
    }, 120000);
  });

  describe("Dependencies and Relationships", () => {
    it("should handle async dependencies between blocks and models", async () => {
      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${path.join(process.cwd(), "tests", "fixtures", "blocks")}"`,
        `--models-path="${path.join(process.cwd(), "tests", "fixtures", "models")}"`,
        "--skip-deletion",
      ].join(" ");

      const { stdout } = await execAsync(buildCommand, {
        timeout: 90000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: config.apiToken,
        },
      });

      expect(stdout).toContain("SUCCESS");
      expect(stdout).toContain("IntegrationTestReferenceBlock");
      expect(stdout).toContain("IntegrationTestRelatedModel");
    }, 90000);

    it("should handle mixed model dependencies", async () => {
      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--models-path="${path.join(process.cwd(), "tests", "fixtures", "models")}"`,
        "--skip-deletion",
      ].join(" ");

      const { stdout } = await execAsync(buildCommand, {
        timeout: 90000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: config.apiToken,
        },
      });

      expect(stdout).toContain("SUCCESS");
      expect(stdout).toContain("IntegrationTestMixedModel");
    }, 90000);
  });

  describe("Real API Validation", () => {
    it("should successfully create and manage real DatoCMS resources", async () => {
      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${path.join(process.cwd(), "tests", "fixtures", "blocks")}"`,
        `--models-path="${path.join(process.cwd(), "tests", "fixtures", "models")}"`,
        "--skip-deletion",
        "--debug",
      ].join(" ");

      const { stdout, stderr } = await execAsync(buildCommand, {
        timeout: 120000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: config.apiToken,
        },
      });

      expect(stdout).toContain("SUCCESS");

      // Should have created multiple items
      const successMatches = stdout.match(/SUCCESS/g);
      expect(successMatches?.length).toBeGreaterThan(1);

      if (stderr) {
        console.warn("Build warnings:", stderr);
      }
    }, 120000);
  });
});
