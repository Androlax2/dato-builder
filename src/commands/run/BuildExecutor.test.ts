import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createMockLogger } from "@tests/utils/mockLogger";
import { BuildExecutor } from "./BuildExecutor";
import type { ItemBuilder } from "./ItemBuilder";
import type { FileInfo } from "./types";

// Mock ItemBuilder
const mockItemBuilder = {
  buildItem: jest.fn(),
} as unknown as jest.Mocked<ItemBuilder>;

const mockLogger = createMockLogger();

describe("BuildExecutor", () => {
  let buildExecutor: BuildExecutor;

  beforeEach(() => {
    buildExecutor = new BuildExecutor(mockItemBuilder, mockLogger);
    jest.clearAllMocks();
  });

  describe("executeBuild", () => {
    it("should execute build for all items in order", async () => {
      const fileMap = new Map<string, FileInfo>([
        [
          "block:item1",
          {
            name: "item1",
            type: "block",
            filePath: "/path/to/item1.ts",
            dependencies: new Set(),
          },
        ],
        [
          "model:item2",
          {
            name: "item2",
            type: "model",
            filePath: "/path/to/item2.ts",
            dependencies: new Set(),
          },
        ],
      ]);

      const buildOrder = ["block:item1", "model:item2"];

      mockItemBuilder.buildItem.mockResolvedValueOnce({
        id: "id1",
        fromCache: false,
      });
      mockItemBuilder.buildItem.mockResolvedValueOnce({
        id: "id2",
        fromCache: true,
      });

      const results = await buildExecutor.executeBuild(fileMap, buildOrder);

      expect(results).toEqual([
        {
          name: "item1",
          type: "block",
          fromCache: false,
          success: true,
        },
        {
          name: "item2",
          type: "model",
          fromCache: true,
          success: true,
        },
      ]);

      expect(mockItemBuilder.buildItem).toHaveBeenCalledTimes(2);
    });

    it("should handle build errors gracefully", async () => {
      const fileMap = new Map<string, FileInfo>([
        [
          "block:item1",
          {
            name: "item1",
            type: "block",
            filePath: "/path/to/item1.ts",
            dependencies: new Set(),
          },
        ],
      ]);

      const buildOrder = ["block:item1"];
      const buildError = new Error("Build failed");

      mockItemBuilder.buildItem.mockRejectedValueOnce(buildError);

      const results = await buildExecutor.executeBuild(fileMap, buildOrder);

      expect(results).toEqual([
        {
          name: "item1",
          type: "block",
          fromCache: false,
          success: false,
          error: buildError,
        },
      ]);
    });

    it("should throw error when file info is not found", async () => {
      const fileMap = new Map<string, FileInfo>();
      const buildOrder = ["block:missing"];

      await expect(
        buildExecutor.executeBuild(fileMap, buildOrder),
      ).rejects.toThrow("File info not found for: block:missing");
    });

    it("should handle empty file map and build order", async () => {
      const fileMap = new Map<string, FileInfo>();
      const buildOrder: string[] = [];

      const results = await buildExecutor.executeBuild(fileMap, buildOrder);

      expect(results).toEqual([]);
      expect(mockItemBuilder.buildItem).not.toHaveBeenCalled();
    });
  });

  describe("getOrBuildItem", () => {
    it("should build item when not in cache", async () => {
      const fileInfo: FileInfo = {
        name: "item1",
        type: "block",
        filePath: "/path/to/item1.ts",
        dependencies: new Set(),
      };

      const expectedResult = { id: "id1", fromCache: false };
      mockItemBuilder.buildItem.mockResolvedValueOnce(expectedResult);

      const result = await buildExecutor.getOrBuildItem(
        "block:item1",
        fileInfo,
      );

      expect(result).toBe(expectedResult);
      expect(mockItemBuilder.buildItem).toHaveBeenCalledWith(fileInfo);
    });

    it("should return existing promise if build is in progress", async () => {
      const fileInfo: FileInfo = {
        name: "item1",
        type: "block",
        filePath: "/path/to/item1.ts",
        dependencies: new Set(),
      };

      const expectedResult = { id: "id1", fromCache: false };
      mockItemBuilder.buildItem.mockResolvedValueOnce(expectedResult);

      // Start first build
      const firstBuildPromise = buildExecutor.getOrBuildItem(
        "block:item1",
        fileInfo,
      );

      // Start second build for same item
      const secondBuildPromise = buildExecutor.getOrBuildItem(
        "block:item1",
        fileInfo,
      );

      const [firstResult, secondResult] = await Promise.all([
        firstBuildPromise,
        secondBuildPromise,
      ]);

      expect(firstResult).toBe(expectedResult);
      expect(secondResult).toBe(expectedResult);
      // Should only call buildItem once, not twice
      expect(mockItemBuilder.buildItem).toHaveBeenCalledTimes(1);
    });

    it("should clean up promise after completion", async () => {
      const fileInfo: FileInfo = {
        name: "item1",
        type: "block",
        filePath: "/path/to/item1.ts",
        dependencies: new Set(),
      };

      const expectedResult = { id: "id1", fromCache: false };
      mockItemBuilder.buildItem.mockResolvedValueOnce(expectedResult);

      await buildExecutor.getOrBuildItem("block:item1", fileInfo);

      // Reset mock to track new calls
      mockItemBuilder.buildItem.mockClear();
      mockItemBuilder.buildItem.mockResolvedValueOnce(expectedResult);

      // Should create new promise, not reuse old one
      await buildExecutor.getOrBuildItem("block:item1", fileInfo);

      expect(mockItemBuilder.buildItem).toHaveBeenCalledTimes(1);
    });

    it("should clean up promise even when build fails", async () => {
      const fileInfo: FileInfo = {
        name: "item1",
        type: "block",
        filePath: "/path/to/item1.ts",
        dependencies: new Set(),
      };

      const buildError = new Error("Build failed");
      mockItemBuilder.buildItem.mockRejectedValueOnce(buildError);

      await expect(
        buildExecutor.getOrBuildItem("block:item1", fileInfo),
      ).rejects.toThrow("Build failed");

      // Reset mock and try again
      mockItemBuilder.buildItem.mockClear();
      mockItemBuilder.buildItem.mockResolvedValueOnce({
        id: "id1",
        fromCache: false,
      });

      // Should create new promise after error
      await buildExecutor.getOrBuildItem("block:item1", fileInfo);

      expect(mockItemBuilder.buildItem).toHaveBeenCalledTimes(1);
    });
  });
});
