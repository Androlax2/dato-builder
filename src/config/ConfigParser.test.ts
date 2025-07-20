import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { DatoBuilderConfig } from "../../src/index.js";
import { createMockLogger } from "../../tests/utils/mockLogger";
import { ConfigParser } from "./ConfigParser";

// Mock fs and path modules
jest.mock("node:fs", () => ({
  existsSync: jest.fn(),
  promises: {
    realpath: jest.fn(),
  },
}));
jest.mock("node:path", () => ({
  resolve: jest.fn(),
}));

describe("ConfigParser", () => {
  let configParser: ConfigParser;
  let mockFs: jest.Mocked<typeof fs>;
  let mockPath: jest.Mocked<typeof path>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    jest.resetModules();

    // Setup mocked modules
    mockFs = fs as jest.Mocked<typeof fs>;
    mockPath = path as jest.Mocked<typeof path>;

    // Setup path.resolve mock to return predictable paths
    mockPath.resolve = jest.fn((...args: string[]) => args.join("/"));

    // Mock process.cwd()
    jest.spyOn(process, "cwd").mockReturnValue("/mock/cwd");

    // Setup fs mocks
    mockFs.existsSync = jest.fn();
    (mockFs.promises as any).realpath = jest
      .fn()
      .mockImplementation((path: unknown) => Promise.resolve(path as string));

    configParser = new ConfigParser(createMockLogger());
  });

  describe("loadConfig", () => {
    it("should load config from .js file when it exists", async () => {
      const mockConfig: DatoBuilderConfig = {
        apiToken: "test-token",
        overwriteExistingFields: true,
        modelApiKeySuffix: "custom-model",
      };

      // Mock fs.existsSync to return true for .js file
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.js";
      });

      // Mock the importConfig method
      jest.spyOn(configParser as any, "importConfig").mockResolvedValue({
        default: mockConfig,
      });

      const result = await configParser.loadConfig();

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );
      expect(result).toEqual({
        apiToken: "test-token",
        overwriteExistingFields: true,
        modelApiKeySuffix: "custom-model",
        blockApiKeySuffix: "block",
        blocksPath: "/mock/cwd/datocms/blocks",
        modelsPath: "/mock/cwd/datocms/models",
        logLevel: 2,
      });
    });

    it("should load config from .ts file when .js doesn't exist", async () => {
      const mockConfig: DatoBuilderConfig = {
        apiToken: "test-token-ts",
        logLevel: 3,
      };

      // Mock fs.existsSync to return false for .js but true for .ts
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.ts";
      });

      // Mock the importConfig method
      jest.spyOn(configParser as any, "importConfig").mockResolvedValue({
        default: mockConfig,
      });

      const result = await configParser.loadConfig();

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.ts",
      );
      expect(result).toEqual({
        apiToken: "test-token-ts",
        overwriteExistingFields: false,
        modelApiKeySuffix: "model",
        blockApiKeySuffix: "block",
        blocksPath: "/mock/cwd/datocms/blocks",
        modelsPath: "/mock/cwd/datocms/models",
        logLevel: 3,
      });
    });

    it("should throw error when no config file exists", async () => {
      // Mock fs.existsSync to return false for both files
      mockFs.existsSync.mockReturnValue(false);

      await expect(configParser.loadConfig()).rejects.toThrow(
        "No dato-builder config file found",
      );

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );
      expect(mockFs.existsSync).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.ts",
      );
    });

    it("should throw error when config file has no default export", async () => {
      // Mock fs.existsSync to return true for .js file
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.js";
      });

      // Mock the importConfig method to return no default export
      jest.spyOn(configParser as any, "importConfig").mockResolvedValue({
        // No default export
      });

      await expect(configParser.loadConfig()).rejects.toThrow(
        "Unable to load dato-builder config file",
      );

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );
    });

    it("should throw error when config file has undefined default export", async () => {
      // Mock fs.existsSync to return true for .js file
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.js";
      });

      // Mock the importConfig method to return undefined default export
      jest.spyOn(configParser as any, "importConfig").mockResolvedValue({
        default: undefined,
      });

      await expect(configParser.loadConfig()).rejects.toThrow(
        "Unable to load dato-builder config file",
      );

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );
    });

    it("should throw error when apiToken is missing", async () => {
      const mockConfig: Partial<DatoBuilderConfig> = {
        overwriteExistingFields: true,
        // Missing apiToken
      };

      // Mock fs.existsSync to return true for .js file
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.js";
      });

      // Mock the importConfig method
      jest.spyOn(configParser as any, "importConfig").mockResolvedValue({
        default: mockConfig,
      });

      await expect(configParser.loadConfig()).rejects.toThrow(
        "Validation error: Missing apiToken",
      );

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );
    });

    it("should throw error when apiToken is empty string", async () => {
      const mockConfig: DatoBuilderConfig = {
        apiToken: "",
        overwriteExistingFields: true,
      };

      // Mock fs.existsSync to return true for .js file
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.js";
      });

      // Mock the importConfig method
      jest.spyOn(configParser as any, "importConfig").mockResolvedValue({
        default: mockConfig,
      });

      await expect(configParser.loadConfig()).rejects.toThrow(
        "Validation error: Missing apiToken",
      );

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );
    });

    it("should merge user config with defaults correctly", async () => {
      const mockConfig: DatoBuilderConfig = {
        apiToken: "test-token",
        blocksPath: "/custom/blocks/path",
        // Other fields should use defaults
      };

      // Mock fs.existsSync to return true for .js file
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.js";
      });

      // Mock the importConfig method
      jest.spyOn(configParser as any, "importConfig").mockResolvedValue({
        default: mockConfig,
      });

      const result = await configParser.loadConfig();

      expect(result).toEqual({
        apiToken: "test-token",
        overwriteExistingFields: false, // default
        modelApiKeySuffix: "model", // default
        blockApiKeySuffix: "block", // default
        blocksPath: "/custom/blocks/path", // user override
        modelsPath: "/mock/cwd/datocms/models", // default
        logLevel: 2, // default
      });
    });

    it("should handle all custom configuration options", async () => {
      const mockConfig: DatoBuilderConfig = {
        apiToken: "custom-token",
        overwriteExistingFields: true,
        modelApiKeySuffix: "custom-model",
        blockApiKeySuffix: "custom-block",
        blocksPath: "/custom/blocks",
        modelsPath: "/custom/models",
        logLevel: 0,
      };

      // Mock fs.existsSync to return true for .js file
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.js";
      });

      // Mock the importConfig method
      jest.spyOn(configParser as any, "importConfig").mockResolvedValue({
        default: mockConfig,
      });

      const result = await configParser.loadConfig();

      expect(result).toEqual(mockConfig);
    });

    it("should prefer .js file over .ts file when both exist", async () => {
      const mockConfig: DatoBuilderConfig = {
        apiToken: "js-token",
      };

      // Mock fs.existsSync to return true for both files
      mockFs.existsSync.mockReturnValue(true);

      // Mock the importConfig method
      jest.spyOn(configParser as any, "importConfig").mockResolvedValue({
        default: mockConfig,
      });

      await configParser.loadConfig();

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );
      expect(mockFs.existsSync).not.toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.ts",
      );
    });
  });

  describe("error handling", () => {
    it("should handle filesystem errors when checking file existence", async () => {
      // Mock fs.existsSync to throw an error
      mockFs.existsSync.mockImplementation(() => {
        throw new Error("Filesystem error");
      });

      await expect(configParser.loadConfig()).rejects.toThrow(
        "Filesystem error",
      );

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );
    });

    it("should handle malformed config objects", async () => {
      // Mock fs.existsSync to return true for .js file
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.js";
      });

      // Mock the importConfig method to return malformed config
      jest.spyOn(configParser as any, "importConfig").mockResolvedValue({
        default: null,
      });

      await expect(configParser.loadConfig()).rejects.toThrow(
        "Unable to load dato-builder config file",
      );
    });
  });

  describe("path validation security", () => {
    it("should reject config files that resolve outside project directory", async () => {
      // Mock fs.existsSync to return true for the config file
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.js";
      });

      // Mock fs.promises.realpath to simulate a symlink pointing outside the project
      (mockFs.promises.realpath as any).mockResolvedValueOnce("/etc/passwd");

      await expect(configParser.loadConfig()).rejects.toThrow(
        "Configuration file path resolves outside project directory",
      );

      expect(mockFs.promises.realpath).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );
    });

    it("should allow config files that resolve within project directory", async () => {
      const mockConfig: DatoBuilderConfig = {
        apiToken: "valid-token",
      };

      // Mock fs.existsSync to return true for the config file
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.js";
      });

      // Mock fs.promises.realpath to return a path within the project directory
      (mockFs.promises.realpath as any).mockResolvedValueOnce(
        "/mock/cwd/dato-builder.config.js",
      );

      // Mock the importConfig method
      jest.spyOn(configParser as any, "importConfig").mockResolvedValue({
        default: mockConfig,
      });

      const result = await configParser.loadConfig();

      expect(result.apiToken).toBe("valid-token");
      expect(mockFs.promises.realpath).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );
    });

    it("should reject paths with directory traversal patterns", async () => {
      // Mock fs.existsSync to return true for the config file
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.js";
      });

      // Mock fs.promises.realpath to resolve to outside project directory
      (mockFs.promises.realpath as any).mockResolvedValueOnce("/etc/passwd");

      await expect(configParser.loadConfig()).rejects.toThrow(
        "Configuration file path resolves outside project directory",
      );

      expect(mockFs.promises.realpath).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );
    });

    it("should validate both .js and .ts config file paths", async () => {
      // Mock fs.existsSync to return false for .js but true for .ts
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.ts";
      });

      // Mock fs.promises.realpath to return path outside project for .ts file
      (mockFs.promises.realpath as any).mockResolvedValueOnce(
        "/tmp/malicious.ts",
      );

      await expect(configParser.loadConfig()).rejects.toThrow(
        "Configuration file path resolves outside project directory",
      );

      expect(mockFs.promises.realpath).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.ts",
      );
    });
  });

  describe("custom config path", () => {
    it("should use custom config path when provided", async () => {
      const customConfigPath = "/custom/path/config.js";
      const mockConfig: DatoBuilderConfig = {
        apiToken: "custom-token",
        overwriteExistingFields: true,
      };

      // Create parser with custom config path
      const customConfigParser = new ConfigParser(
        createMockLogger(),
        customConfigPath,
      );

      // Mock fs.existsSync to return true for custom path
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === customConfigPath;
      });

      // Mock fs.promises.realpath to return valid path within project
      (mockFs.promises.realpath as any).mockResolvedValueOnce(
        "/mock/cwd/custom/path/config.js",
      );

      // Mock the importConfig method
      jest.spyOn(customConfigParser as any, "importConfig").mockResolvedValue({
        default: mockConfig,
      });

      const result = await customConfigParser.loadConfig();

      expect(mockFs.existsSync).toHaveBeenCalledWith(customConfigPath);
      expect(result.apiToken).toBe("custom-token");
      expect(result.overwriteExistingFields).toBe(true);
    });

    it("should throw error when custom config path does not exist", async () => {
      const customConfigPath = "/nonexistent/config.js";

      // Create parser with custom config path
      const customConfigParser = new ConfigParser(
        createMockLogger(),
        customConfigPath,
      );

      // Mock fs.existsSync to return false for custom path
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath !== customConfigPath;
      });

      await expect(customConfigParser.loadConfig()).rejects.toThrow(
        `Config file not found: ${customConfigPath}`,
      );

      expect(mockFs.existsSync).toHaveBeenCalledWith(customConfigPath);
      // Should not check default paths when custom path is provided
      expect(mockFs.existsSync).not.toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );
    });

    it("should validate security of custom config path", async () => {
      const customConfigPath = "/custom/path/config.js";

      // Create parser with custom config path
      const customConfigParser = new ConfigParser(
        createMockLogger(),
        customConfigPath,
      );

      // Mock fs.existsSync to return true for custom path
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === customConfigPath;
      });

      // Mock fs.promises.realpath to return path outside project directory
      (mockFs.promises.realpath as any).mockResolvedValueOnce("/etc/passwd");

      await expect(customConfigParser.loadConfig()).rejects.toThrow(
        "Configuration file path resolves outside project directory",
      );

      expect(mockFs.promises.realpath).toHaveBeenCalledWith(customConfigPath);
    });

    it("should use default behavior when no custom config path provided", async () => {
      const mockConfig: DatoBuilderConfig = {
        apiToken: "default-token",
      };

      // Create parser without custom config path (should use default behavior)
      const defaultConfigParser = new ConfigParser(createMockLogger());

      // Mock fs.existsSync to return true for default .js file
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.js";
      });

      // Mock the importConfig method
      jest.spyOn(defaultConfigParser as any, "importConfig").mockResolvedValue({
        default: mockConfig,
      });

      const result = await defaultConfigParser.loadConfig();

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );
      expect(result.apiToken).toBe("default-token");
    });
  });
});
