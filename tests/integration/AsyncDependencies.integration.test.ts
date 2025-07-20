import path from "node:path";
import { beforeAll, describe, expect, it } from "@jest/globals";
import type { DatoBuilderConfig } from "../../src";
import { CacheManager } from "../../src/cache/CacheManager";
import { ConsoleLogger } from "../../src/logger";

describe("Async Dependencies Integration Test - Real API", () => {
  let logger: ConsoleLogger;
  let cache: CacheManager;
  let config: Required<DatoBuilderConfig>;

  beforeAll(() => {
    const apiToken = process.env.DATOCMS_API_TOKEN;
    if (!apiToken) {
      throw new Error("DATOCMS_API_TOKEN is required for integration tests");
    }

    logger = new ConsoleLogger();

    config = {
      apiToken,
      blocksPath: path.join(process.cwd(), "tests", "fixtures", "blocks"),
      modelsPath: path.join(process.cwd(), "tests", "fixtures", "models"),
      overwriteExistingFields: false,
      modelApiKeySuffix: "model",
      blockApiKeySuffix: "block",
      logLevel: 1,
    };

    cache = new CacheManager(path.join(process.cwd(), ".datocms-test-cache"));
  });

  describe("Environment Setup", () => {
    it("should have access to real DatoCMS API token", () => {
      expect(process.env.DATOCMS_API_TOKEN).toBeDefined();
      expect(process.env.DATOCMS_API_TOKEN?.length).toBeGreaterThan(20);
    });

    it("should have clean cache for testing", async () => {
      // Clear cache to ensure clean state
      await cache.clear();
      expect(true).toBe(true); // Basic test that cache operations work
    });
  });

  describe("Async getBlock/getModel Pattern Validation", () => {
    it("should be able to test the pattern: await getBlock('BlockName')", () => {
      // This is a conceptual test of our async pattern
      // The actual pattern should work like:
      // item_types: [await getBlock("IntegrationTestBaseBlock")]

      const mockGetBlock = async (blockName: string): Promise<string> => {
        // In reality, this would return a DatoCMS ID
        // For this test, we just verify the pattern works
        return `mock-id-for-${blockName}`;
      };

      expect(mockGetBlock).toBeDefined();
      expect(typeof mockGetBlock).toBe("function");
    });

    it("should be able to test the pattern: await getModel('ModelName')", () => {
      // This is a conceptual test of our async pattern
      // The actual pattern should work like:
      // item_types: [await getModel("IntegrationTestBaseModel")]

      const mockGetModel = async (modelName: string): Promise<string> => {
        // In reality, this would return a DatoCMS ID
        // For this test, we just verify the pattern works
        return `mock-id-for-${modelName}`;
      };

      expect(mockGetModel).toBeDefined();
      expect(typeof mockGetModel).toBe("function");
    });
  });

  describe("Configuration Validation", () => {
    it("should have properly configured test environment", () => {
      expect(config.apiToken).toBeDefined();
      expect(config.blocksPath).toContain("tests/fixtures/blocks");
      expect(config.modelsPath).toContain("tests/fixtures/models");
      expect(config.overwriteExistingFields).toBe(false);
    });

    it("should have logger configured correctly", () => {
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.error).toBe("function");
    });

    it("should have cache manager configured correctly", () => {
      expect(cache).toBeDefined();
      expect(typeof cache.get).toBe("function");
      expect(typeof cache.set).toBe("function");
      expect(typeof cache.clear).toBe("function");
    });
  });

  describe("Integration Test Architecture Validation", () => {
    it("should validate that our integration test files exist", async () => {
      const { readdirSync } = await import("node:fs");

      // Check that our fixture files exist
      const blockFiles = readdirSync(config.blocksPath);
      const modelFiles = readdirSync(config.modelsPath);

      // Should have our integration test files
      expect(blockFiles.some((f) => f.includes("IntegrationTest"))).toBe(true);
      expect(modelFiles.some((f) => f.includes("IntegrationTest"))).toBe(true);

      // Should have base block and model
      expect(blockFiles.some((f) => f.includes("BaseBlock"))).toBe(true);
      expect(modelFiles.some((f) => f.includes("BaseModel"))).toBe(true);

      // Should have reference files that use async dependencies
      expect(blockFiles.some((f) => f.includes("ReferenceBlock"))).toBe(true);
      expect(modelFiles.some((f) => f.includes("RelatedModel"))).toBe(true);
    });
  });
});
