import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createMockCache } from "@tests/utils/mockCache";
import { createMockLogger } from "@tests/utils/mockLogger";
import { DeletionDetector } from "./DeletionDetector";
import type { FileInfo } from "./types";

const mockCacheManager = createMockCache();
const mockLogger = createMockLogger();

describe("DeletionDetector", () => {
  let deletionDetector: DeletionDetector;

  beforeEach(() => {
    deletionDetector = new DeletionDetector(mockCacheManager, mockLogger);
    jest.clearAllMocks();
  });

  describe("detectDeletions", () => {
    it("should detect deletions when cache has extra keys", () => {
      const fileMap = new Map<string, FileInfo>([
        [
          "fileA",
          {
            name: "fileA",
            type: "block",
            filePath: "/path/to/fileA",
            dependencies: new Set(),
          },
        ],
      ]);

      mockCacheManager.keys.mockReturnValue([
        "fileA",
        "block:block1",
        "model:model1",
      ]);
      mockCacheManager.get.mockImplementation((key) =>
        key === "block:block1"
          ? { id: "dummy-id", hash: "dummy-hash" }
          : key === "model:model1"
            ? { id: "dummy-id", hash: "dummy-hash" }
            : undefined,
      );

      const summary = deletionDetector.detectDeletions(fileMap);

      expect(summary.total).toBe(2);
      expect(summary.blocks).toHaveLength(1);
      expect(summary.models).toHaveLength(1);
    });

    it("should return empty summary when no deletions found", () => {
      const fileMap = new Map<string, FileInfo>([
        [
          "fileA",
          {
            name: "fileA",
            type: "block",
            filePath: "/path/to/fileA",
            dependencies: new Set(),
          },
        ],
      ]);

      mockCacheManager.keys.mockReturnValue(["fileA"]);

      const summary = deletionDetector.detectDeletions(fileMap);

      expect(summary.total).toBe(0);
    });
  });

  describe("canSafelyDelete", () => {
    it("should detect safe deletions", () => {
      const fileMap = new Map<string, FileInfo>();
      const candidate = {
        key: "block:block1",
        type: "block" as const,
        name: "block1",
        id: "dummy-id",
        hash: "dummy-hash",
      };

      const result = deletionDetector.canSafelyDelete(candidate, fileMap);

      expect(result.canDelete).toBe(true);
      expect(result.usedBy).toEqual([]);
    });

    it("should detect unsafe deletions", () => {
      const fileMap = new Map<string, FileInfo>([
        [
          "fileA",
          {
            name: "fileA",
            type: "block",
            filePath: "/path/to/fileA",
            dependencies: new Set(["block:block1"]),
          },
        ],
      ]);
      const candidate = {
        key: "block:block1",
        type: "block" as const,
        name: "block1",
        id: "dummy-id",
        hash: "dummy-hash",
      };

      const result = deletionDetector.canSafelyDelete(candidate, fileMap);

      expect(result.canDelete).toBe(false);
      expect(result.usedBy).toEqual(["fileA"]);
    });
  });

  describe("filterSafeDeletions", () => {
    it("should filter safe and unsafe deletions", () => {
      const fileMap = new Map<string, FileInfo>([
        [
          "fileA",
          {
            name: "fileA",
            type: "block",
            filePath: "/path/to/fileA",
            dependencies: new Set(["block:block1"]),
          },
        ],
      ]);
      const candidates = [
        {
          key: "block:block1",
          type: "block" as const,
          name: "block1",
          id: "dummy-id",
          hash: "dummy-hash",
        },
        {
          key: "model:model1",
          type: "model" as const,
          name: "model1",
          id: "dummy-id",
          hash: "dummy-hash",
        },
      ];

      const { safe, unsafe } = deletionDetector.filterSafeDeletions(
        candidates,
        fileMap,
      );

      expect(safe).toHaveLength(1);
      expect(safe[0]?.name).toBe("model1");
      expect(unsafe).toHaveLength(1);
      expect(unsafe[0]?.name).toBe("block1");
      expect(unsafe[0]?.usedBy).toEqual(["fileA"]);
    });
  });
});
