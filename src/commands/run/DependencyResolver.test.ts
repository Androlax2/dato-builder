import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createMockLogger } from "../../../tests/utils/mockLogger";
import { DependencyResolver } from "./DependencyResolver";
import type { FileInfo } from "./types";

const mockLogger = createMockLogger();

describe("DependencyResolver", () => {
  let resolver: DependencyResolver;

  beforeEach(() => {
    resolver = new DependencyResolver(mockLogger);
    jest.clearAllMocks();
  });

  describe("topologicalSort", () => {
    it("should handle empty file map", () => {
      const fileMap = new Map<string, FileInfo>();
      const result = resolver.topologicalSort(fileMap);
      expect(result).toEqual([]);
    });

    it("should handle single file with no dependencies", () => {
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
      const result = resolver.topologicalSort(fileMap);
      expect(result).toEqual(["fileA"]);
    });

    it("should handle multiple files with no dependencies", () => {
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
        [
          "fileB",
          {
            name: "fileB",
            type: "model",
            filePath: "/path/to/fileB",
            dependencies: new Set(),
          },
        ],
        [
          "fileC",
          {
            name: "fileC",
            type: "block",
            filePath: "/path/to/fileC",
            dependencies: new Set(),
          },
        ],
      ]);
      const result = resolver.topologicalSort(fileMap);
      expect(result).toHaveLength(3);
      expect(result).toContain("fileA");
      expect(result).toContain("fileB");
      expect(result).toContain("fileC");
    });

    it("should handle simple linear dependency chain", () => {
      const fileMap = new Map<string, FileInfo>([
        [
          "fileA",
          {
            name: "fileA",
            type: "block",
            filePath: "/path/to/fileA",
            dependencies: new Set(["fileB"]),
          },
        ],
        [
          "fileB",
          {
            name: "fileB",
            type: "model",
            filePath: "/path/to/fileB",
            dependencies: new Set(["fileC"]),
          },
        ],
        [
          "fileC",
          {
            name: "fileC",
            type: "block",
            filePath: "/path/to/fileC",
            dependencies: new Set(),
          },
        ],
      ]);
      const result = resolver.topologicalSort(fileMap);
      expect(result).toEqual(["fileC", "fileB", "fileA"]);
    });

    it("should handle complex dependency graph", () => {
      const fileMap = new Map<string, FileInfo>([
        [
          "fileA",
          {
            name: "fileA",
            type: "block",
            filePath: "/path/to/fileA",
            dependencies: new Set(["fileB", "fileC"]),
          },
        ],
        [
          "fileB",
          {
            name: "fileB",
            type: "model",
            filePath: "/path/to/fileB",
            dependencies: new Set(["fileD"]),
          },
        ],
        [
          "fileC",
          {
            name: "fileC",
            type: "block",
            filePath: "/path/to/fileC",
            dependencies: new Set(["fileD"]),
          },
        ],
        [
          "fileD",
          {
            name: "fileD",
            type: "model",
            filePath: "/path/to/fileD",
            dependencies: new Set(),
          },
        ],
        [
          "fileE",
          {
            name: "fileE",
            type: "block",
            filePath: "/path/to/fileE",
            dependencies: new Set(),
          },
        ],
      ]);
      const result = resolver.topologicalSort(fileMap);

      // Check that dependencies come before dependents
      expect(result.indexOf("fileD")).toBeLessThan(result.indexOf("fileB"));
      expect(result.indexOf("fileD")).toBeLessThan(result.indexOf("fileC"));
      expect(result.indexOf("fileB")).toBeLessThan(result.indexOf("fileA"));
      expect(result.indexOf("fileC")).toBeLessThan(result.indexOf("fileA"));
      expect(result).toContain("fileE");
      expect(result).toHaveLength(5);
    });

    it("should handle files with dependencies not in the file map", () => {
      const fileMap = new Map<string, FileInfo>([
        [
          "fileA",
          {
            name: "fileA",
            type: "block",
            filePath: "/path/to/fileA",
            dependencies: new Set(["fileB", "externalDep"]),
          },
        ],
        [
          "fileB",
          {
            name: "fileB",
            type: "model",
            filePath: "/path/to/fileB",
            dependencies: new Set(),
          },
        ],
      ]);
      const result = resolver.topologicalSort(fileMap);
      expect(result).toEqual(["fileB", "fileA"]);
    });

    it("should detect circular dependencies - simple cycle", () => {
      const fileMap = new Map<string, FileInfo>([
        [
          "fileA",
          {
            name: "fileA",
            type: "block",
            filePath: "/path/to/fileA",
            dependencies: new Set(["fileB"]),
          },
        ],
        [
          "fileB",
          {
            name: "fileB",
            type: "model",
            filePath: "/path/to/fileB",
            dependencies: new Set(["fileA"]),
          },
        ],
      ]);

      expect(() => resolver.topologicalSort(fileMap)).toThrow(
        "Circular dependency detected involving: fileA",
      );
    });

    it("should detect circular dependencies - complex cycle", () => {
      const fileMap = new Map<string, FileInfo>([
        [
          "fileA",
          {
            name: "fileA",
            type: "block",
            filePath: "/path/to/fileA",
            dependencies: new Set(["fileB"]),
          },
        ],
        [
          "fileB",
          {
            name: "fileB",
            type: "model",
            filePath: "/path/to/fileB",
            dependencies: new Set(["fileC"]),
          },
        ],
        [
          "fileC",
          {
            name: "fileC",
            type: "block",
            filePath: "/path/to/fileC",
            dependencies: new Set(["fileA"]),
          },
        ],
      ]);

      expect(() => resolver.topologicalSort(fileMap)).toThrow(
        "Circular dependency detected involving: fileA",
      );
    });

    it("should detect self-referencing dependency", () => {
      const fileMap = new Map<string, FileInfo>([
        [
          "fileA",
          {
            name: "fileA",
            type: "block",
            filePath: "/path/to/fileA",
            dependencies: new Set(["fileA"]),
          },
        ],
      ]);

      expect(() => resolver.topologicalSort(fileMap)).toThrow(
        "Circular dependency detected involving: fileA",
      );
    });

    it("should handle mixed scenario with cycles and non-cycles", () => {
      const fileMap = new Map<string, FileInfo>([
        [
          "fileA",
          {
            name: "fileA",
            type: "block",
            filePath: "/path/to/fileA",
            dependencies: new Set(["fileB"]),
          },
        ],
        [
          "fileB",
          {
            name: "fileB",
            type: "model",
            filePath: "/path/to/fileB",
            dependencies: new Set(["fileC"]),
          },
        ],
        [
          "fileC",
          {
            name: "fileC",
            type: "block",
            filePath: "/path/to/fileC",
            dependencies: new Set(["fileA"]),
          },
        ],
        [
          "fileD",
          {
            name: "fileD",
            type: "model",
            filePath: "/path/to/fileD",
            dependencies: new Set(),
          },
        ],
      ]);

      expect(() => resolver.topologicalSort(fileMap)).toThrow(
        "Circular dependency detected involving: fileA",
      );
    });

    it("should handle diamond dependency pattern", () => {
      const fileMap = new Map<string, FileInfo>([
        [
          "fileA",
          {
            name: "fileA",
            type: "block",
            filePath: "/path/to/fileA",
            dependencies: new Set(["fileB", "fileC"]),
          },
        ],
        [
          "fileB",
          {
            name: "fileB",
            type: "model",
            filePath: "/path/to/fileB",
            dependencies: new Set(["fileD"]),
          },
        ],
        [
          "fileC",
          {
            name: "fileC",
            type: "block",
            filePath: "/path/to/fileC",
            dependencies: new Set(["fileD"]),
          },
        ],
        [
          "fileD",
          {
            name: "fileD",
            type: "model",
            filePath: "/path/to/fileD",
            dependencies: new Set(),
          },
        ],
      ]);

      const result = resolver.topologicalSort(fileMap);

      // fileD should come first
      expect(result.indexOf("fileD")).toBe(0);
      // fileB and fileC should come after fileD but before fileA
      expect(result.indexOf("fileB")).toBeGreaterThan(result.indexOf("fileD"));
      expect(result.indexOf("fileC")).toBeGreaterThan(result.indexOf("fileD"));
      expect(result.indexOf("fileA")).toBeGreaterThan(result.indexOf("fileB"));
      expect(result.indexOf("fileA")).toBeGreaterThan(result.indexOf("fileC"));
      expect(result).toHaveLength(4);
    });

    it("should handle files with missing file info", () => {
      const fileMap = new Map<string, FileInfo>([
        [
          "fileA",
          {
            name: "fileA",
            type: "block",
            filePath: "/path/to/fileA",
            dependencies: new Set(["fileB"]),
          },
        ],
        [
          "fileB",
          {
            name: "fileB",
            type: "model",
            filePath: "/path/to/fileB",
            dependencies: new Set(),
          },
        ],
      ]);
      // Delete fileB's info to simulate missing file info
      fileMap.delete("fileB");

      const result = resolver.topologicalSort(fileMap);
      expect(result).toContain("fileA");
      expect(result).not.toContain("fileB"); // fileB should not be in result since it's missing
    });
  });
});
