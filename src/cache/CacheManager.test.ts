import { promises as fs } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CacheManager } from "./CacheManager";

// Mock fs module
jest.mock("node:fs", () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
  },
}));

// Mock path module
jest.mock("node:path", () => ({
  dirname: jest.fn(),
}));

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

describe("CacheManager", () => {
  const cachePath = "/test/cache.json";
  const cacheDir = "/test";

  beforeEach(() => {
    jest.clearAllMocks();
    mockPath.dirname.mockReturnValue(cacheDir);
  });

  describe("constructor", () => {
    it("should create instance with default options", () => {
      const cache = new CacheManager(cachePath);
      expect(cache.isSkippingReads()).toBe(false);
    });

    it("should create instance with skipReads option", () => {
      const cache = new CacheManager(cachePath, { skipReads: true });
      expect(cache.isSkippingReads()).toBe(true);
    });
  });

  describe("initialize", () => {
    it("should skip initialization when skipReads is true", async () => {
      const cache = new CacheManager(cachePath, { skipReads: true });
      await cache.initialize();

      expect(mockFs.mkdir).not.toHaveBeenCalled();
      expect(mockFs.readFile).not.toHaveBeenCalled();
    });

    it("should create cache directory and load from file", async () => {
      const cache = new CacheManager(cachePath);
      const cacheData = [["key1", { hash: "hash1", id: "id1" }]];

      mockFs.readFile.mockResolvedValue(JSON.stringify(cacheData));

      await cache.initialize();

      expect(mockFs.mkdir).toHaveBeenCalledWith(cacheDir, { recursive: true });
      expect(mockFs.readFile).toHaveBeenCalledWith(cachePath, "utf8");
      expect(cache.get("key1")).toEqual({ hash: "hash1", id: "id1" });
    });

    it("should handle missing cache file", async () => {
      const cache = new CacheManager(cachePath);
      const error = new Error("File not found") as any;
      error.code = "ENOENT";

      mockFs.readFile.mockRejectedValue(error);

      await cache.initialize();

      expect(cache.size()).toBe(0);
    });

    it("should handle corrupted cache file", async () => {
      const cache = new CacheManager(cachePath);

      mockFs.readFile.mockResolvedValue("invalid json");

      await cache.initialize();

      expect(cache.size()).toBe(0);
    });

    it("should handle object format cache data", async () => {
      const cache = new CacheManager(cachePath);
      const cacheData = { key1: { hash: "hash1", id: "id1" } };

      mockFs.readFile.mockResolvedValue(JSON.stringify(cacheData));

      await cache.initialize();

      expect(cache.get("key1")).toEqual({ hash: "hash1", id: "id1" });
    });
  });

  describe("get", () => {
    it("should return undefined when skipReads is true", async () => {
      const cache = new CacheManager(cachePath, { skipReads: true });
      expect(cache.get("key1")).toBeUndefined();
    });

    it("should return cached item", async () => {
      const cache = new CacheManager(cachePath);
      const cacheData = [["key1", { hash: "hash1", id: "id1" }]];

      mockFs.readFile.mockResolvedValue(JSON.stringify(cacheData));
      await cache.initialize();

      expect(cache.get("key1")).toEqual({ hash: "hash1", id: "id1" });
    });

    it("should return undefined for non-existent key", async () => {
      const cache = new CacheManager(cachePath);
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));
      await cache.initialize();

      expect(cache.get("nonexistent")).toBeUndefined();
    });
  });

  describe("set", () => {
    it("should be op when skipReads is true", async () => {
      const cache = new CacheManager(cachePath, { skipReads: true });
      await cache.set("key1", { hash: "hash1", id: "id1" });

      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(cache.get("key1")).toEqual({ hash: "hash1", id: "id1" });
    });

    it("should set item and persist to file", async () => {
      const cache = new CacheManager(cachePath);
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));
      await cache.initialize();

      await cache.set("key1", { hash: "hash1", id: "id1" });

      expect(cache.get("key1")).toEqual({ hash: "hash1", id: "id1" });
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        cachePath,
        JSON.stringify([["key1", { hash: "hash1", id: "id1" }]], null, 2),
        "utf8",
      );
    });

    it("should handle multiple concurrent writes", async () => {
      const cache = new CacheManager(cachePath);
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));
      await cache.initialize();

      // Start multiple set operations concurrently
      const promises = [
        cache.set("key1", { hash: "hash1", id: "id1" }),
        cache.set("key2", { hash: "hash2", id: "id2" }),
        cache.set("key3", { hash: "hash3", id: "id3" }),
      ];

      await Promise.all(promises);

      expect(cache.size()).toBe(3);
      expect(mockFs.writeFile).toHaveBeenCalled();
    });
  });

  describe("has", () => {
    it("should return false when skipReads is true", async () => {
      const cache = new CacheManager(cachePath, { skipReads: true });
      expect(cache.has("key1")).toBe(false);
    });

    it("should return true for existing key", async () => {
      const cache = new CacheManager(cachePath);
      const cacheData = [["key1", { hash: "hash1", id: "id1" }]];

      mockFs.readFile.mockResolvedValue(JSON.stringify(cacheData));
      await cache.initialize();

      expect(cache.has("key1")).toBe(true);
    });

    it("should return false for non-existent key", async () => {
      const cache = new CacheManager(cachePath);
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));
      await cache.initialize();

      expect(cache.has("nonexistent")).toBe(false);
    });
  });

  describe("delete", () => {
    it("should return false when skipReads is true", async () => {
      const cache = new CacheManager(cachePath, { skipReads: true });
      const result = await cache.delete("key1");
      expect(result).toBe(false);
    });

    it("should delete existing key and persist", async () => {
      const cache = new CacheManager(cachePath);
      const cacheData = [["key1", { hash: "hash1", id: "id1" }]];

      mockFs.readFile.mockResolvedValue(JSON.stringify(cacheData));
      await cache.initialize();

      const result = await cache.delete("key1");

      expect(result).toBe(true);
      expect(cache.has("key1")).toBe(false);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        cachePath,
        JSON.stringify([], null, 2),
        "utf8",
      );
    });

    it("should return false for non-existent key", async () => {
      const cache = new CacheManager(cachePath);
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));
      await cache.initialize();

      const result = await cache.delete("nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("clear", () => {
    it("should op when skipReads is true", async () => {
      const cache = new CacheManager(cachePath, { skipReads: true });
      await cache.clear();

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        cachePath,
        JSON.stringify([], null, 2),
        "utf8",
      );
      expect(cache.size()).toBe(0);
    });

    it("should clear all items and persist", async () => {
      const cache = new CacheManager(cachePath);
      const cacheData = [
        ["key1", { hash: "hash1", id: "id1" }],
        ["key2", { hash: "hash2", id: "id2" }],
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(cacheData));
      await cache.initialize();

      await cache.clear();

      expect(cache.size()).toBe(0);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        cachePath,
        JSON.stringify([], null, 2),
        "utf8",
      );
    });
  });

  describe("keys", () => {
    it("should return empty array when skipReads is true", () => {
      const cache = new CacheManager(cachePath, { skipReads: true });
      expect(cache.keys()).toEqual([]);
    });

    it("should return all keys", async () => {
      const cache = new CacheManager(cachePath);
      const cacheData = [
        ["key1", { hash: "hash1", id: "id1" }],
        ["key2", { hash: "hash2", id: "id2" }],
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(cacheData));
      await cache.initialize();

      expect(cache.keys()).toEqual(["key1", "key2"]);
    });
  });

  describe("values", () => {
    it("should return empty array when skipReads is true", () => {
      const cache = new CacheManager(cachePath, { skipReads: true });
      expect(cache.values()).toEqual([]);
    });

    it("should return all values", async () => {
      const cache = new CacheManager(cachePath);
      const cacheData = [
        ["key1", { hash: "hash1", id: "id1" }],
        ["key2", { hash: "hash2", id: "id2" }],
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(cacheData));
      await cache.initialize();

      expect(cache.values()).toEqual([
        { hash: "hash1", id: "id1" },
        { hash: "hash2", id: "id2" },
      ]);
    });
  });

  describe("size", () => {
    it("should return 0 when skipReads is true", () => {
      const cache = new CacheManager(cachePath, { skipReads: true });
      expect(cache.size()).toBe(0);
    });

    it("should return correct size", async () => {
      const cache = new CacheManager(cachePath);
      const cacheData = [
        ["key1", { hash: "hash1", id: "id1" }],
        ["key2", { hash: "hash2", id: "id2" }],
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(cacheData));
      await cache.initialize();

      expect(cache.size()).toBe(2);
    });
  });

  describe("entries", () => {
    it("should return empty array when skipReads is true", () => {
      const cache = new CacheManager(cachePath, { skipReads: true });
      expect(cache.entries()).toEqual([]);
    });

    it("should return all entries", async () => {
      const cache = new CacheManager(cachePath);
      const cacheData = [
        ["key1", { hash: "hash1", id: "id1" }],
        ["key2", { hash: "hash2", id: "id2" }],
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(cacheData));
      await cache.initialize();

      expect(cache.entries()).toEqual([
        ["key1", { hash: "hash1", id: "id1" }],
        ["key2", { hash: "hash2", id: "id2" }],
      ]);
    });
  });

  describe("findByHash", () => {
    it("should return empty array when skipReads is true", () => {
      const cache = new CacheManager(cachePath, { skipReads: true });
      expect(cache.findByHash("hash1")).toEqual([]);
    });

    it("should find items by hash", async () => {
      const cache = new CacheManager(cachePath);
      const cacheData = [
        ["key1", { hash: "hash1", id: "id1" }],
        ["key2", { hash: "hash1", id: "id2" }],
        ["key3", { hash: "hash2", id: "id3" }],
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(cacheData));
      await cache.initialize();

      const result = cache.findByHash("hash1");
      expect(result).toEqual([
        { hash: "hash1", id: "id1" },
        { hash: "hash1", id: "id2" },
      ]);
    });
  });

  describe("findById", () => {
    it("should return undefined when skipReads is true", () => {
      const cache = new CacheManager(cachePath, { skipReads: true });
      expect(cache.findById("id1")).toBeUndefined();
    });

    it("should find item by id", async () => {
      const cache = new CacheManager(cachePath);
      const cacheData = [
        ["key1", { hash: "hash1", id: "id1" }],
        ["key2", { hash: "hash2", id: "id2" }],
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(cacheData));
      await cache.initialize();

      expect(cache.findById("id2")).toEqual({ hash: "hash2", id: "id2" });
    });

    it("should return undefined for non-existent id", async () => {
      const cache = new CacheManager(cachePath);
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));
      await cache.initialize();

      expect(cache.findById("nonexistent")).toBeUndefined();
    });
  });

  describe("getActualSize", () => {
    it("should return 0 when skipReads is true", () => {
      const cache = new CacheManager(cachePath, { skipReads: true });
      expect(cache.getActualSize()).toBe(0);
    });

    it("should return actual size", async () => {
      const cache = new CacheManager(cachePath);
      const cacheData = [
        ["key1", { hash: "hash1", id: "id1" }],
        ["key2", { hash: "hash2", id: "id2" }],
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(cacheData));
      await cache.initialize();

      expect(cache.getActualSize()).toBe(2);
    });
  });

  describe("processWriteQueue race conditions", () => {
    beforeEach(() => {
      // Reset mock implementations
      jest.clearAllMocks();
    });

    it("should prevent concurrent processWriteQueue executions", async () => {
      const cache = new CacheManager(cachePath);
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));
      await cache.initialize();

      // Mock writeFile to track call count and add delay
      let writeCallCount = 0;
      mockFs.writeFile.mockImplementation(() => {
        writeCallCount++;
        return new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Start multiple writes concurrently
      const promises = [
        await cache.set("key1", { hash: "hash1", id: "id1" }),
        await cache.set("key2", { hash: "hash2", id: "id2" }),
        await cache.set("key3", { hash: "hash3", id: "id3" }),
      ];

      await Promise.all(promises);

      // Should only call writeFile once due to queue batching
      expect(writeCallCount).toBe(1);
      expect(cache.size()).toBe(3);
    });

    it("should process all queued items when new items added during write", async () => {
      const cache = new CacheManager(cachePath);
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));
      await cache.initialize();

      let resolveFirstWrite: () => void;
      const firstWritePromise = new Promise<void>((resolve) => {
        resolveFirstWrite = resolve;
      });

      let writeCallCount = 0;
      mockFs.writeFile.mockImplementation(() => {
        writeCallCount++;
        if (writeCallCount === 1) {
          return firstWritePromise;
        }
        return Promise.resolve();
      });

      // Start first write - this will set isWriting = true
      const firstWrite = cache.set("key1", { hash: "hash1", id: "id1" });

      // Wait a bit to ensure the first write has started and isWriting is true
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Add more items while isWriting is true
      // These should be queued and processed after the first write completes
      const secondWrite = cache.set("key2", { hash: "hash2", id: "id2" });
      const thirdWrite = cache.set("key3", { hash: "hash3", id: "id3" });

      // Complete the first write
      resolveFirstWrite!();

      // Wait for all operations to complete
      await Promise.all([firstWrite, secondWrite, thirdWrite]);

      // All items should be in memory
      expect(cache.size()).toBe(3);
      expect(cache.get("key1")).toBeDefined();
      expect(cache.get("key2")).toBeDefined();
      expect(cache.get("key3")).toBeDefined();

      // All items should be written to file - either batched or separately
      expect(writeCallCount).toBeGreaterThanOrEqual(1);

      expect(mockFs.writeFile.mock.calls.length).toBeGreaterThan(0);

      // Check if all items are in the final write or multiple writes
      const allWrittenItems: any[] = [];
      for (const call of mockFs.writeFile.mock.calls) {
        const writeData = JSON.parse(call[1] as string);
        // Merge all written items (handling potential multiple writes)
        for (const item of writeData) {
          if (!allWrittenItems.find((existing) => existing[0] === item[0])) {
            allWrittenItems.push(item);
          }
        }
      }

      expect(allWrittenItems).toHaveLength(3);
    });

    it("should properly resolve all promises when write succeeds", async () => {
      const cache = new CacheManager(cachePath);
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));
      await cache.initialize();

      const promises = [
        await cache.set("key1", { hash: "hash1", id: "id1" }),
        await cache.set("key2", { hash: "hash2", id: "id2" }),
        await cache.set("key3", { hash: "hash3", id: "id3" }),
      ];

      // All promises should resolve without throwing
      await expect(Promise.all(promises)).resolves.toEqual([
        undefined,
        undefined,
        undefined,
      ]);
    });

    it("should properly reject all promises when write fails", async () => {
      const cache = new CacheManager(cachePath);
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));
      await cache.initialize();

      const writeError = new Error("Write failed");
      mockFs.writeFile.mockRejectedValue(writeError);

      const promises = [
        await cache.set("key1", { hash: "hash1", id: "id1" }),
        await cache.set("key2", { hash: "hash2", id: "id2" }),
        await cache.set("key3", { hash: "hash3", id: "id3" }),
      ];

      // All promises should reject with the same error
      await expect(Promise.all(promises)).rejects.toThrow("Write failed");
    });

    it("should ensure all queued items are eventually written to disk", async () => {
      const cache = new CacheManager(cachePath);
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));
      await cache.initialize();

      let resolveFirstWrite: (() => void) | undefined;
      let writeCallCount = 0;

      mockFs.writeFile.mockImplementation(() => {
        writeCallCount++;
        if (writeCallCount === 1) {
          // First write takes time - we control when it completes
          return new Promise<void>((resolve) => {
            resolveFirstWrite = resolve;
          });
        }
        // Subsequent writes complete immediately
        return Promise.resolve();
      });

      // Start first operation - this will start writing and set isWriting = true
      const firstPromise = cache.set("key1", { hash: "hash1", id: "id1" });

      // Small delay to ensure first write has started
      await new Promise((resolve) => setTimeout(resolve, 5));

      // Add more items while the first write is in progress
      // These should be queued and processed after the first write
      const secondPromise = cache.set("key2", { hash: "hash2", id: "id2" });
      const thirdPromise = cache.set("key3", { hash: "hash3", id: "id3" });

      // Complete the first write to trigger queue processing
      if (resolveFirstWrite) {
        resolveFirstWrite();
      }

      // Wait for all operations to complete
      await Promise.all([firstPromise, secondPromise, thirdPromise]);

      // All items should be in memory
      expect(cache.size()).toBe(3);

      // Ensure recursive queue processing works properly - all items should be written
      expect(writeCallCount).toBeGreaterThanOrEqual(1);

      const allWriteCalls = mockFs.writeFile.mock.calls;
      const allPersistedItems: any[] = [];

      // Collect all items from all write operations
      for (const call of allWriteCalls) {
        const writeData = JSON.parse(call[1] as string);
        for (const item of writeData) {
          if (!allPersistedItems.find((existing) => existing[0] === item[0])) {
            allPersistedItems.push(item);
          }
        }
      }

      expect(allPersistedItems).toHaveLength(3);

      // Verify all expected items are present
      const persistedKeys = allPersistedItems.map(
        (item: [string, any]) => item[0],
      );
      expect(persistedKeys).toContain("key1");
      expect(persistedKeys).toContain("key2"); // This will fail due to race condition
      expect(persistedKeys).toContain("key3"); // This will fail due to race condition
    });

    it("should handle concurrent operations without losing data", async () => {
      const cache = new CacheManager(cachePath);
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));
      await cache.initialize();

      let writeInProgress = false;
      let resolveFirstWrite: (() => void) | undefined;

      mockFs.writeFile.mockImplementation(() => {
        if (!writeInProgress) {
          writeInProgress = true;
          return new Promise<void>((resolve) => {
            resolveFirstWrite = resolve;
          });
        }
        return Promise.resolve();
      });

      // Start the first operation
      const firstPromise = cache.set("key1", { hash: "hash1", id: "id1" });

      // Wait for write to start
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Add items while write is in progress - these will be queued
      const secondPromise = cache.set("key2", { hash: "hash2", id: "id2" });
      const thirdPromise = cache.set("key3", { hash: "hash3", id: "id3" });

      // Complete the first write to allow queue processing
      if (resolveFirstWrite) {
        resolveFirstWrite();
      }

      // Wait for all operations to complete
      await Promise.all([firstPromise, secondPromise, thirdPromise]);

      // Wait for any remaining async operations
      await new Promise((resolve) => setTimeout(resolve, 50));

      // All items should be in memory
      expect(cache.size()).toBe(3);

      // Verify all items are accessible
      expect(cache.get("key1")).toEqual({ hash: "hash1", id: "id1" });
      expect(cache.get("key2")).toEqual({ hash: "hash2", id: "id2" });
      expect(cache.get("key3")).toEqual({ hash: "hash3", id: "id3" });

      // Verify data was written to disk (regression test for race condition)
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it("should maintain queue state consistency during errors", async () => {
      const cache = new CacheManager(cachePath);
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));
      await cache.initialize();

      // First write succeeds
      mockFs.writeFile.mockResolvedValueOnce(undefined);
      await cache.set("key1", { hash: "hash1", id: "id1" });

      // Second batch fails
      const writeError = new Error("Write failed");
      mockFs.writeFile.mockRejectedValueOnce(writeError);

      const failingPromises = [
        await cache.set("key2", { hash: "hash2", id: "id2" }),
        await cache.set("key3", { hash: "hash3", id: "id3" }),
      ];

      await expect(Promise.all(failingPromises)).rejects.toThrow(
        "Write failed",
      );

      // Third write should work again (queue should be cleared)
      mockFs.writeFile.mockResolvedValueOnce(undefined);
      await cache.set("key4", { hash: "hash4", id: "id4" });

      expect(cache.size()).toBe(4); // All items should be in memory
    });

    it("should handle isWriting flag correctly", async () => {
      const cache = new CacheManager(cachePath);
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));
      await cache.initialize();

      let resolveFirstWrite: () => void;
      const firstWritePromise = new Promise<void>((resolve) => {
        resolveFirstWrite = resolve;
      });

      let writeCallCount = 0;
      mockFs.writeFile.mockImplementation(() => {
        writeCallCount++;
        if (writeCallCount === 1) {
          return firstWritePromise;
        }
        return Promise.resolve();
      });

      // Start multiple operations
      const firstOp = cache.set("key1", { hash: "hash1", id: "id1" });

      // Allow first write to start
      await new Promise((resolve) => setTimeout(resolve, 10));

      const secondOp = cache.set("key2", { hash: "hash2", id: "id2" });

      // First write should have started
      expect(writeCallCount).toBe(1);

      resolveFirstWrite!();
      await Promise.all([firstOp, secondOp]);

      // Should have the correct number of writes (batching may occur)
      expect(writeCallCount).toBeGreaterThanOrEqual(1);
      expect(cache.size()).toBe(2);
    });

    it("should handle empty queue scenario correctly", async () => {
      const cache = new CacheManager(cachePath);
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));
      await cache.initialize();

      // Call processWriteQueue directly when queue is empty (shouldn't crash)
      // This simulates the private method being called - we can't call it directly,
      // but we can verify the behavior by ensuring no writes happen when no items are queued

      // Initially no operations
      expect(mockFs.writeFile).not.toHaveBeenCalled();

      // Add and complete an operation
      await cache.set("key1", { hash: "hash1", id: "id1" });

      // Verify write happened
      expect(mockFs.writeFile).toHaveBeenCalledTimes(1);

      // No additional writes should happen after queue is empty
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(mockFs.writeFile).toHaveBeenCalledTimes(1);
    });
  });

  describe("error handling", () => {
    it("should handle write errors in queue", async () => {
      const cache = new CacheManager(cachePath);
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));
      await cache.initialize();

      const writeError = new Error("Write failed");
      mockFs.writeFile.mockRejectedValue(writeError);

      await expect(
        cache.set("key1", { hash: "hash1", id: "id1" }),
      ).rejects.toThrow("Write failed");
    });

    it("should handle invalid cache file format", async () => {
      const cache = new CacheManager(cachePath);
      mockFs.readFile.mockResolvedValue(JSON.stringify("invalid"));

      await cache.initialize();

      expect(cache.size()).toBe(0);
    });
  });
});
