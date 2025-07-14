import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createMockCache } from "@tests/utils/mockCache";
import { createMockConfig } from "@tests/utils/mockConfig";
import { createMockLogger } from "@tests/utils/mockLogger";
import type { BuilderContext } from "@/types/BuilderContext";
import { ItemBuildError, ItemBuilder } from "./ItemBuilder";
import type { FileInfo } from "./types";

// Mock CacheManager
const mockCacheManager = createMockCache();
const mockLogger = createMockLogger();
const mockContext: BuilderContext = {
  config: createMockConfig(),
  getBlock: jest.fn<(name: string) => Promise<string>>((name: string) =>
    Promise.resolve(`block:${name}`),
  ),
  getModel: jest.fn<(name: string) => Promise<string>>((name: string) =>
    Promise.resolve(`model:${name}`),
  ),
};

const mockGetContext = jest
  .fn<() => BuilderContext>()
  .mockReturnValue(mockContext);

// Mock builder instances
const mockBlockBuilder = {
  upsert: jest.fn(),
  getHash: jest.fn(),
  constructor: { name: "BlockBuilder" },
};

const mockModelBuilder = {
  upsert: jest.fn(),
  getHash: jest.fn(),
  constructor: { name: "ModelBuilder" },
};

// Mock dynamic imports
jest.mock(
  "/path/to/block1.ts",
  () => jest.fn().mockImplementation(() => Promise.resolve(mockBlockBuilder)),
  { virtual: true },
);
jest.mock(
  "/path/to/model1.ts",
  () => jest.fn().mockImplementation(() => Promise.resolve(mockModelBuilder)),
  { virtual: true },
);
jest.mock(
  "/path/to/invalid.ts",
  () => jest.fn().mockImplementation(() => Promise.resolve("not-a-builder")),
  { virtual: true },
);
jest.mock(
  "/path/to/no-default.ts",
  () => ({
    __esModule: true,
  }),
  { virtual: true },
);

describe("ItemBuilder", () => {
  let itemBuilder: ItemBuilder;

  beforeEach(() => {
    itemBuilder = new ItemBuilder(mockCacheManager, mockLogger, mockGetContext);
    jest.clearAllMocks();
  });

  describe("buildItem", () => {
    it("should build item from cache when hash matches", async () => {
      const fileInfo: FileInfo = {
        name: "block1",
        type: "block",
        filePath: "/path/to/block1.ts",
        dependencies: new Set(),
      };

      const cachedData = { id: "cached-id", hash: "cached-hash" };
      mockCacheManager.get.mockReturnValue(cachedData);
      mockBlockBuilder.getHash.mockReturnValue("cached-hash");

      const result = await itemBuilder.buildItem(fileInfo);

      expect(result).toEqual({ id: "cached-id", fromCache: true });
      expect(mockBlockBuilder.upsert).not.toHaveBeenCalled();
    });

    it("should build item from source when not in cache", async () => {
      const fileInfo: FileInfo = {
        name: "block1",
        type: "block",
        filePath: "/path/to/block1.ts",
        dependencies: new Set(),
      };

      mockCacheManager.get.mockReturnValue(undefined);
      (mockBlockBuilder.upsert as any).mockResolvedValue("new-id");
      mockBlockBuilder.getHash.mockReturnValue("new-hash");

      const result = await itemBuilder.buildItem(fileInfo);

      expect(result).toEqual({ id: "new-id", fromCache: false });
      expect(mockBlockBuilder.upsert).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith("block:block1", {
        id: "new-id",
        hash: "new-hash",
      });
    });

    it("should build item from source when hash mismatch", async () => {
      const fileInfo: FileInfo = {
        name: "block1",
        type: "block",
        filePath: "/path/to/block1.ts",
        dependencies: new Set(),
      };

      const cachedData = { id: "cached-id", hash: "old-hash" };
      mockCacheManager.get.mockReturnValue(cachedData);
      mockBlockBuilder.getHash.mockReturnValue("new-hash");
      (mockBlockBuilder.upsert as any).mockResolvedValue("new-id");

      const result = await itemBuilder.buildItem(fileInfo);

      expect(result).toEqual({ id: "new-id", fromCache: false });
      expect(mockBlockBuilder.upsert).toHaveBeenCalled();
    });

    it("should handle model building", async () => {
      const fileInfo: FileInfo = {
        name: "model1",
        type: "model",
        filePath: "/path/to/model1.ts",
        dependencies: new Set(),
      };

      mockCacheManager.get.mockReturnValue(undefined);
      (mockModelBuilder.upsert as any).mockResolvedValue("model-id");
      mockModelBuilder.getHash.mockReturnValue("model-hash");

      const result = await itemBuilder.buildItem(fileInfo);

      expect(result).toEqual({ id: "model-id", fromCache: false });
      expect(mockModelBuilder.upsert).toHaveBeenCalled();
    });

    it("should throw ItemBuildError when module does not export default function", async () => {
      const fileInfo: FileInfo = {
        name: "no-default",
        type: "block",
        filePath: "/path/to/no-default.ts",
        dependencies: new Set(),
      };

      mockCacheManager.get.mockReturnValue(undefined);

      await expect(itemBuilder.buildItem(fileInfo)).rejects.toThrow(
        ItemBuildError,
      );
    });

    it("should throw ItemBuildError when builder is invalid", async () => {
      const fileInfo: FileInfo = {
        name: "invalid",
        type: "block",
        filePath: "/path/to/invalid.ts",
        dependencies: new Set(),
      };

      mockCacheManager.get.mockReturnValue(undefined);

      await expect(itemBuilder.buildItem(fileInfo)).rejects.toThrow(
        ItemBuildError,
      );
    });

    it("should throw ItemBuildError when build fails", async () => {
      const fileInfo: FileInfo = {
        name: "block1",
        type: "block",
        filePath: "/path/to/block1.ts",
        dependencies: new Set(),
      };

      mockCacheManager.get.mockReturnValue(undefined);
      (mockBlockBuilder.upsert as any).mockRejectedValue(
        new Error("Build failed"),
      );

      await expect(itemBuilder.buildItem(fileInfo)).rejects.toThrow(
        ItemBuildError,
      );
    });
  });
});
