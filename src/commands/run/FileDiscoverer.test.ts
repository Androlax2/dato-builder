import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { createMockLogger } from "../../../tests/utils/mockLogger";

// Create mocks before any imports
const mockGlob = jest.fn() as jest.MockedFunction<
  (pattern: string) => Promise<string[]>
>;
const mockBasename = jest.fn() as jest.MockedFunction<
  (path: string, ext?: string) => string
>;
const mockExtname = jest.fn() as jest.MockedFunction<(path: string) => string>;
const mockResolve = jest.fn() as jest.MockedFunction<
  (...pathSegments: string[]) => string
>;

// Mock the modules
jest.unstable_mockModule("glob", () => ({
  glob: mockGlob,
}));

jest.unstable_mockModule("node:path", () => ({
  default: {
    basename: mockBasename,
    extname: mockExtname,
    resolve: mockResolve,
  },
  basename: mockBasename,
  extname: mockExtname,
  resolve: mockResolve,
}));

// Import after mocking
const { FileDiscoverer } = await import("./FileDiscoverer");

describe("FileDiscoverer", () => {
  let fileDiscoverer: InstanceType<typeof FileDiscoverer>;

  const blocksPath = "/test/blocks";
  const modelsPath = "/test/models";

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockGlob.mockReset();
    mockBasename.mockReset();
    mockExtname.mockReset();
    mockResolve.mockReset();

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
      mockBasename
        .mockReturnValueOnce("block1")
        .mockReturnValueOnce("block2")
        .mockReturnValueOnce("model1")
        .mockReturnValueOnce("model2");

      mockExtname
        .mockReturnValueOnce(".ts")
        .mockReturnValueOnce(".js")
        .mockReturnValueOnce(".ts")
        .mockReturnValueOnce(".js");

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
        filePath: "/test/blocks/block1.ts",
        dependencies: new Set(),
      });

      const modelInfo = result.get("model:model1");
      expect(modelInfo).toEqual({
        name: "model1",
        type: "model",
        filePath: "/test/models/model1.ts",
        dependencies: new Set(),
      });
    });

    it("should handle empty block directory", async () => {
      const blockFiles: string[] = [];
      const modelFiles = ["/test/models/model1.ts"];

      mockGlob
        .mockResolvedValueOnce(blockFiles)
        .mockResolvedValueOnce(modelFiles);

      mockBasename.mockReturnValueOnce("model1");
      mockExtname.mockReturnValueOnce(".ts");

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

      mockBasename.mockReturnValueOnce("block1");
      mockExtname.mockReturnValueOnce(".ts");

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

      mockBasename.mockReturnValueOnce("block1").mockReturnValueOnce("block2");
      mockExtname.mockReturnValueOnce(".ts").mockReturnValueOnce(".js");

      const result = await fileDiscoverer.discoverFiles();

      expect(result.size).toBe(2);
      expect(result.has("block:block1")).toBe(true);
      expect(result.has("block:block2")).toBe(true);

      const block1Info = result.get("block:block1");
      expect(block1Info?.filePath).toBe("/test/blocks/block1.ts");

      const block2Info = result.get("block:block2");
      expect(block2Info?.filePath).toBe("/test/blocks/block2.js");
    });
  });
});
