import path from "node:path";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { glob } from "glob";
import { createMockLogger } from "../../../tests/utils/mockLogger";
import { FileDiscoverer } from "./FileDiscoverer";

// Mock the glob module
jest.mock("glob", () => ({
  glob: jest.fn(),
}));

// Mock the path module
jest.mock("node:path", () => ({
  basename: jest.fn(),
  extname: jest.fn(),
  resolve: jest.fn(),
}));

describe("FileDiscoverer", () => {
  let fileDiscoverer: FileDiscoverer;
  let mockGlob: jest.MockedFunction<typeof glob>;
  let mockPath: jest.Mocked<typeof path>;

  const blocksPath = "/test/blocks";
  const modelsPath = "/test/models";

  beforeEach(() => {
    // Setup mocks
    mockGlob = glob as jest.MockedFunction<typeof glob>;
    mockPath = path as jest.Mocked<typeof path>;

    // Create FileDiscoverer instance
    fileDiscoverer = new FileDiscoverer(
      blocksPath,
      modelsPath,
      createMockLogger(),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("discoverFiles", () => {
    it("should discover both block and model files successfully", async () => {
      // Mock file paths
      const blockFiles = ["/test/blocks/block1.ts", "/test/blocks/block2.js"];
      const modelFiles = ["/test/models/model1.ts", "/test/models/model2.js"];

      // Mock glob responses
      mockGlob
        .mockResolvedValueOnce(blockFiles)
        .mockResolvedValueOnce(modelFiles);

      // Mock path operations
      mockPath.basename
        .mockReturnValueOnce("block1")
        .mockReturnValueOnce("block2")
        .mockReturnValueOnce("model1")
        .mockReturnValueOnce("model2");

      mockPath.extname
        .mockReturnValueOnce(".ts")
        .mockReturnValueOnce(".js")
        .mockReturnValueOnce(".ts")
        .mockReturnValueOnce(".js");

      mockPath.resolve
        .mockReturnValueOnce("/resolved/blocks/block1.ts")
        .mockReturnValueOnce("/resolved/blocks/block2.js")
        .mockReturnValueOnce("/resolved/models/model1.ts")
        .mockReturnValueOnce("/resolved/models/model2.js");

      const result = await fileDiscoverer.discoverFiles();

      // Verify glob calls
      expect(mockGlob).toHaveBeenCalledTimes(2);
      expect(mockGlob).toHaveBeenCalledWith(`${blocksPath}/**/*.{ts,js}`);
      expect(mockGlob).toHaveBeenCalledWith(`${modelsPath}/**/*.{ts,js}`);

      // Verify result
      expect(result.size).toBe(4);
      expect(result.has("block:block1")).toBe(true);
      expect(result.has("block:block2")).toBe(true);
      expect(result.has("model:model1")).toBe(true);
      expect(result.has("model:model2")).toBe(true);

      // Verify file info structure
      const blockInfo = result.get("block:block1");
      expect(blockInfo).toEqual({
        name: "block1",
        type: "block",
        filePath: "/resolved/blocks/block1.ts",
        dependencies: new Set(),
      });

      const modelInfo = result.get("model:model1");
      expect(modelInfo).toEqual({
        name: "model1",
        type: "model",
        filePath: "/resolved/models/model1.ts",
        dependencies: new Set(),
      });
    });

    it("should handle empty block directory", async () => {
      const blockFiles: string[] = [];
      const modelFiles = ["/test/models/model1.ts"];

      mockGlob
        .mockResolvedValueOnce(blockFiles)
        .mockResolvedValueOnce(modelFiles);

      mockPath.basename.mockReturnValueOnce("model1");
      mockPath.extname.mockReturnValueOnce(".ts");
      mockPath.resolve.mockReturnValueOnce("/resolved/models/model1.ts");

      const result = await fileDiscoverer.discoverFiles();

      expect(result.size).toBe(1);
      expect(result.has("model:model1")).toBe(true);
    });

    it("should handle empty model directory", async () => {
      const blockFiles = ["/test/blocks/block1.ts"];
      const modelFiles: string[] = [];

      mockGlob
        .mockResolvedValueOnce(blockFiles)
        .mockResolvedValueOnce(modelFiles);

      mockPath.basename.mockReturnValueOnce("block1");
      mockPath.extname.mockReturnValueOnce(".ts");
      mockPath.resolve.mockReturnValueOnce("/resolved/blocks/block1.ts");

      const result = await fileDiscoverer.discoverFiles();

      expect(result.size).toBe(1);
      expect(result.has("block:block1")).toBe(true);
    });

    it("should handle no files found in either directory", async () => {
      const blockFiles: string[] = [];
      const modelFiles: string[] = [];

      mockGlob
        .mockResolvedValueOnce(blockFiles)
        .mockResolvedValueOnce(modelFiles);

      const result = await fileDiscoverer.discoverFiles();

      expect(result.size).toBe(0);
    });

    it("should handle glob errors gracefully", async () => {
      const error = new Error("Glob error");
      mockGlob.mockRejectedValueOnce(error);

      await expect(fileDiscoverer.discoverFiles()).rejects.toThrow(
        "Glob error",
      );
    });

    it("should handle files with different extensions", async () => {
      const blockFiles = ["/test/blocks/block1.ts", "/test/blocks/block2.js"];
      const modelFiles: string[] = [];

      mockGlob
        .mockResolvedValueOnce(blockFiles)
        .mockResolvedValueOnce(modelFiles);

      mockPath.basename
        .mockReturnValueOnce("block1")
        .mockReturnValueOnce("block2");
      mockPath.extname.mockReturnValueOnce(".ts").mockReturnValueOnce(".js");
      mockPath.resolve
        .mockReturnValueOnce("/resolved/blocks/block1.ts")
        .mockReturnValueOnce("/resolved/blocks/block2.js");

      const result = await fileDiscoverer.discoverFiles();

      expect(result.size).toBe(2);
      expect(result.has("block:block1")).toBe(true);
      expect(result.has("block:block2")).toBe(true);

      const block1Info = result.get("block:block1");
      expect(block1Info?.filePath).toBe("/resolved/blocks/block1.ts");

      const block2Info = result.get("block:block2");
      expect(block2Info?.filePath).toBe("/resolved/blocks/block2.js");
    });
  });
});
