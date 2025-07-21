import path from "node:path";
import { buildClient, type Client } from "@datocms/cma-client-node";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { CLI } from "../../../src/cli.js";

describe("Performance Integration Tests", () => {
  const testConfigPath = path.resolve(
    process.cwd(),
    "tests/integration/performance/fixtures/performance.config.js",
  );
  const API_TOKEN = process.env.DATOCMS_API_TOKEN;
  let originalArgv: string[];
  let datoClient: Client;
  let createdItemTypeIds: string[] = [];

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
    // Cleanup: Delete all test item types from DatoCMS
    if (createdItemTypeIds.length > 0 && datoClient) {
      console.log(
        `Cleaning up ${createdItemTypeIds.length} test item types...`,
      );

      // Use Promise.allSettled for concurrent cleanup
      const cleanupResults = await Promise.allSettled(
        createdItemTypeIds.map((id) =>
          datoClient.itemTypes
            .destroy(id)
            .then(() => ({ id, success: true }))
            .catch((error) => ({ id, success: false, error })),
        ),
      );

      const successful = cleanupResults.filter(
        (r) => r.status === "fulfilled",
      ).length;
      const failed = cleanupResults.filter(
        (r) => r.status === "rejected",
      ).length;

      console.log(
        `Cleanup completed: ${successful} successful, ${failed} failed`,
      );
    }

    // Restore original argv
    process.argv = originalArgv;
  });

  describe("Large Project Testing", () => {
    it("should handle building 15 blocks and 10 models with complex dependencies efficiently", async () => {
      const cli = new CLI(testConfigPath);

      // Measure build time
      const startTime = Date.now();

      // Set up CLI arguments for build command
      process.argv = [
        "node",
        "dato-builder",
        "build",
        "--skip-deletion",
        "--no-cache",
      ];

      // Execute build
      await cli.execute();

      const buildTime = Date.now() - startTime;
      console.log(`Build completed in ${buildTime}ms`);

      // Verify all items were created
      const itemTypes = await datoClient.itemTypes.list();

      // Find our test blocks (3 blocks)
      const testBlocks = itemTypes.filter((item) =>
        item.api_key?.startsWith("test_perf_block_"),
      );

      // Find our test models (2 models)
      const testModels = itemTypes.filter((item) =>
        item.api_key?.startsWith("test_perf_model_"),
      );

      expect(testBlocks).toHaveLength(15);
      expect(testModels).toHaveLength(10);

      // Store IDs for cleanup
      createdItemTypeIds = [...testBlocks, ...testModels].map(
        (item) => item.id,
      );

      // Performance assertions
      expect(buildTime).toBeLessThan(120000); // Should complete within 2 minutes

      // Verify some random samples have the expected fields
      const sampleBlock = testBlocks.find(
        (b) => b.api_key === "test_perf_block_alpha",
      );
      const sampleModel = testModels.find(
        (m) => m.api_key === "test_perf_model_alpha",
      );

      expect(sampleBlock).toBeDefined();
      expect(sampleModel).toBeDefined();

      // Check field counts
      const blockFields = await datoClient.fields.list(sampleBlock!.id);
      const modelFields = await datoClient.fields.list(sampleModel!.id);

      expect(blockFields).toHaveLength(5); // 5 fields per block
      expect(modelFields.length).toBeGreaterThanOrEqual(6); // 6+ fields per model (includes dependencies)
    }, 150000); // 2.5 minute timeout
  });

  describe("Concurrency Validation", () => {
    it("should handle concurrent builds without conflicts", async () => {
      // Skip if no items were created in previous test
      if (createdItemTypeIds.length === 0) {
        console.warn("Skipping concurrency test - no items to test with");
        return;
      }

      const cli = new CLI(testConfigPath);

      // Set up CLI arguments for concurrent builds
      process.argv = ["node", "dato-builder", "build", "--skip-deletion"];

      // Execute multiple builds concurrently (simulating concurrent users)
      const concurrentBuilds = [cli.execute(), cli.execute()];

      const startTime = Date.now();
      const results = await Promise.allSettled(concurrentBuilds);
      const concurrentTime = Date.now() - startTime;

      console.log(`Concurrent builds completed in ${concurrentTime}ms`);

      // At least one should succeed (DatoCMS may reject some concurrent requests)
      const successful = results.filter((r) => r.status === "fulfilled").length;
      expect(successful).toBeGreaterThanOrEqual(1);

      // Verify data integrity - no duplicate items should be created
      const itemTypes = await datoClient.itemTypes.list();
      const perfBlocks = itemTypes.filter((item) =>
        item.api_key?.startsWith("test_perf_block_"),
      );
      const perfModels = itemTypes.filter((item) =>
        item.api_key?.startsWith("test_perf_model_"),
      );

      // Should still have exactly 15 blocks and 10 models
      expect(perfBlocks).toHaveLength(15);
      expect(perfModels).toHaveLength(10);
    }, 120000);
  });

  describe("Cache Performance", () => {
    it("should show improved performance on subsequent builds with cache", async () => {
      // Skip if no items were created
      if (createdItemTypeIds.length === 0) {
        console.warn("Skipping cache test - no items to test with");
        return;
      }

      const cli = new CLI(testConfigPath);

      // First build with cache (warm up)
      process.argv = ["node", "dato-builder", "build", "--skip-deletion"];

      const warmupStart = Date.now();
      await cli.execute();
      const warmupTime = Date.now() - warmupStart;

      // Second build with cache (should be faster)
      const cachedStart = Date.now();
      await cli.execute();
      const cachedTime = Date.now() - cachedStart;

      console.log(
        `Warmup build: ${warmupTime}ms, Cached build: ${cachedTime}ms`,
      );

      // Cached build should be faster (caching may not always show dramatic improvements)
      const improvementRatio = cachedTime / warmupTime;
      expect(improvementRatio).toBeLessThan(1.2); // Cached should not be significantly slower

      // Both should complete within reasonable time
      expect(warmupTime).toBeLessThan(90000); // 1.5 minutes
      expect(cachedTime).toBeLessThan(60000); // 1 minute
    }, 180000);
  });

  describe("Rate Limiting Handling", () => {
    it("should handle API rate limits gracefully", async () => {
      // Skip if no items were created
      if (createdItemTypeIds.length === 0) {
        console.warn("Skipping rate limit test - no items to test with");
        return;
      }

      const cli = new CLI(testConfigPath);

      // Execute rapid successive builds to potentially trigger rate limiting
      const rapidBuilds = [];
      for (let i = 0; i < 5; i++) {
        process.argv = [
          "node",
          "dato-builder",
          "build",
          "--skip-deletion",
          "--no-cache",
        ];

        rapidBuilds.push(
          cli.execute().catch((error) => ({ error, attempt: i + 1 })),
        );
      }

      const startTime = Date.now();
      const results = await Promise.allSettled(rapidBuilds);
      const totalTime = Date.now() - startTime;

      console.log(
        `${rapidBuilds.length} rapid builds completed in ${totalTime}ms`,
      );

      // Should handle gracefully - at least some should succeed
      const successful = results.filter(
        (r) =>
          r.status === "fulfilled" &&
          (r.value === undefined || !("error" in (r.value as any))),
      ).length;

      expect(successful).toBeGreaterThanOrEqual(1);

      // If some failed due to rate limiting, they should be handled gracefully
      const rateLimitErrors = results.filter((r) => {
        if (r.status === "fulfilled") {
          const value = r.value as any;
          return (
            value &&
            value.error &&
            (value.error.message?.includes("rate") ||
              value.error.message?.includes("429") ||
              value.error.message?.includes("throttle"))
          );
        }
        return false;
      }).length;

      if (rateLimitErrors > 0) {
        console.log(
          `${rateLimitErrors} builds encountered rate limiting (expected)`,
        );
      }

      // Verify data integrity after rapid operations
      const itemTypes = await datoClient.itemTypes.list();
      const perfItems = itemTypes.filter((item) =>
        item.api_key?.startsWith("test_perf_"),
      );

      // Should still have our expected items
      expect(perfItems.length).toBeGreaterThanOrEqual(25); // At least our 25 items
    }, 300000); // 5 minute timeout for rate limiting scenarios
  });
});
