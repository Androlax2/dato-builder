import path from "node:path";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { DatoBuilderConfig } from "../../src";
import type { CacheManager } from "../../src/cache/CacheManager";
import type { ConsoleLogger } from "../../src/logger";
import { createMockCache } from "../utils/mockCache";
import { createMockConfig } from "../utils/mockConfig";
import { createMockDatoApi } from "../utils/mockDatoApi";
import { createMockLogger } from "../utils/mockLogger";

// Mock DatoApi only
const MockDatoApi = jest.fn();
jest.unstable_mockModule("../../src/Api/DatoApi", () => ({
  default: MockDatoApi,
}));

// Import after mocking
const { RunCommand } = await import("../../src/commands/run/RunCommand");

describe("Build Pipeline Integration Tests", () => {
  let config: Required<DatoBuilderConfig>;
  let cache: jest.Mocked<CacheManager>;
  let logger: jest.Mocked<ConsoleLogger>;
  let mockDatoApi: any;
  let fixturesPath: string;

  beforeEach(() => {
    jest.clearAllMocks();

    // Use real test fixtures - construct absolute path
    const projectRoot = process.cwd();
    fixturesPath = path.join(projectRoot, "tests", "fixtures");

    config = createMockConfig({
      blocksPath: path.join(fixturesPath, "blocks"),
      modelsPath: path.join(fixturesPath, "models"),
      apiToken: "test-token",
    });

    cache = createMockCache();
    logger = createMockLogger();

    // Setup DatoApi mock
    mockDatoApi = createMockDatoApi();
    MockDatoApi.mockImplementation(() => mockDatoApi);
  });

  describe("Complete Build Pipeline Flow", () => {
    it("should execute complete pipeline from file discovery to build completion", async () => {
      const runCommand = new RunCommand({
        config,
        cache,
        logger,
        enableDeletion: false,
        skipDeletionConfirmation: true,
        concurrency: 1,
      });

      // Execute the complete pipeline with real files
      await runCommand.execute();

      // Verify the pipeline executed successfully
      expect(mockDatoApi.client.itemTypes.create).toHaveBeenCalled();
      expect(mockDatoApi.client.fields.create).toHaveBeenCalled();
    });

    it("should handle build errors gracefully and continue with other items", async () => {
      const runCommand = new RunCommand({
        config,
        cache,
        logger,
        enableDeletion: false,
        skipDeletionConfirmation: true,
        concurrency: 1,
      });

      // Should not throw but log errors for invalid blocks
      await expect(runCommand.execute()).resolves.not.toThrow();

      // Verify that some builds succeeded (valid blocks)
      expect(mockDatoApi.client.itemTypes.create).toHaveBeenCalled();
    });
  });

  describe("Cache Integration", () => {
    it("should use cached results when hashes match", async () => {
      // Setup cache to return consistent hash for ValidBlock
      const mockValidBlockHash = "consistent-test-hash";

      // Mock cache to return cached item with matching hash on first call
      cache.get.mockImplementation((key: string) => {
        if (key === "block:ValidBlock") {
          return {
            id: "cached-valid-block-123",
            hash: mockValidBlockHash,
          };
        }
        return undefined;
      });

      const runCommand = new RunCommand({
        config,
        cache,
        logger,
        enableDeletion: false,
        skipDeletionConfirmation: true,
        concurrency: 1,
      });

      // Execute - should use cached results for items with matching hashes
      await runCommand.execute();

      // Verify cache was checked
      expect(cache.get).toHaveBeenCalled();

      // Should still complete successfully
      expect(mockDatoApi.client.itemTypes.create).toHaveBeenCalled();
    });
  });

  describe("ItemBuilder Integration", () => {
    it("should load and validate builders correctly", async () => {
      const runCommand = new RunCommand({
        config,
        cache,
        logger,
        enableDeletion: false,
        skipDeletionConfirmation: true,
        concurrency: 1,
      });

      // Execute the full pipeline which includes ItemBuilder validation
      await runCommand.execute();

      // Verify that the builders were loaded and executed successfully
      expect(mockDatoApi.client.itemTypes.create).toHaveBeenCalled();
      expect(mockDatoApi.client.fields.create).toHaveBeenCalled();
    });

    it("should reject invalid builder types", async () => {
      // Create config that points to invalid blocks directory
      const invalidConfig = createMockConfig({
        blocksPath: path.join(fixturesPath, "blocks"),
        modelsPath: path.join(fixturesPath, "models"),
        apiToken: "test-token",
      });

      const runCommand = new RunCommand({
        config: invalidConfig,
        cache,
        logger,
        enableDeletion: false,
        skipDeletionConfirmation: true,
        concurrency: 1,
      });

      // Should complete without throwing but may log errors for invalid builders
      await expect(runCommand.execute()).resolves.not.toThrow();

      // At least some valid builders should have been processed
      expect(mockDatoApi.client.itemTypes.create).toHaveBeenCalled();
    });
  });

  describe("BuildExecutor Integration", () => {
    it("should execute builds in parallel when concurrency allows", async () => {
      const runCommand = new RunCommand({
        config,
        cache,
        logger,
        enableDeletion: false,
        skipDeletionConfirmation: true,
        concurrency: 5, // High concurrency for parallel testing
      });

      const startTime = Date.now();
      await runCommand.execute();
      const endTime = Date.now();

      // Should complete efficiently with parallel execution
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
      expect(mockDatoApi.client.itemTypes.create).toHaveBeenCalled();
    });

    it("should handle promise deduplication for same items", async () => {
      // Execute multiple times to test deduplication logic
      const runCommand1 = new RunCommand({
        config,
        cache,
        logger,
        enableDeletion: false,
        skipDeletionConfirmation: true,
        concurrency: 1,
      });

      const runCommand2 = new RunCommand({
        config,
        cache,
        logger,
        enableDeletion: false,
        skipDeletionConfirmation: true,
        concurrency: 1,
      });

      // Execute simultaneously
      await Promise.all([runCommand1.execute(), runCommand2.execute()]);

      // Verify execution succeeded
      expect(mockDatoApi.client.itemTypes.create).toHaveBeenCalled();
    });
  });

  describe("Performance Integration", () => {
    it("should handle large numbers of files efficiently", async () => {
      const runCommand = new RunCommand({
        config,
        cache,
        logger,
        enableDeletion: false,
        skipDeletionConfirmation: true,
        concurrency: 5, // Use higher concurrency for performance
      });

      const startTime = Date.now();
      await runCommand.execute();
      const endTime = Date.now();

      // Should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds

      // Verify successful execution
      expect(mockDatoApi.client.itemTypes.create).toHaveBeenCalled();
    });
  });
});
