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
