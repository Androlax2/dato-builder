import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createMockLogger } from "@tests/utils/mockLogger";
import { ConfigParser } from "@/config/ConfigParser";
import type { DatoBuilderConfig } from "../../src";

// Mock fs and path modules
jest.mock("node:fs");
jest.mock("node:path");

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
    mockPath.resolve.mockImplementation((...args) => args.join("/"));

    // Mock process.cwd()
    jest.spyOn(process, "cwd").mockReturnValue("/mock/cwd");

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

      // Mock the module before the dynamic import
      jest.doMock("/mock/cwd/dato-builder.config.js", () => mockConfig, {
        virtual: true,
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

      // Clean up
      jest.dontMock("/mock/cwd/dato-builder.config.js");
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

      // Mock the module before the dynamic import
      jest.doMock("/mock/cwd/dato-builder.config.ts", () => mockConfig, {
        virtual: true,
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

      // Clean up
      jest.dontMock("/mock/cwd/dato-builder.config.ts");
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

      // Clean up
      jest.dontMock("/mock/cwd/dato-builder.config.js");
    });

    it("should throw error when config file has no default export", async () => {
      // Mock fs.existsSync to return true for .js file
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.js";
      });

      jest.doMock(
        "/mock/cwd/dato-builder.config.js",
        () => {
          return {
            __esModule: true,
          }; // No default export
        },
        {
          virtual: true,
        },
      );

      await expect(configParser.loadConfig()).rejects.toThrow(
        "Unable to load dato-builder config file",
      );

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );

      await expect(configParser.loadConfig()).rejects.toThrow(
        "Unable to load dato-builder config file",
      );

      // Clean up
      jest.dontMock("/mock/cwd/dato-builder.config.js");
    });

    it("should throw error when config file has undefined default export", async () => {
      // Mock fs.existsSync to return true for .js file
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.js";
      });

      jest.doMock(
        "/mock/cwd/dato-builder.config.js",
        () => {
          return {
            __esModule: true,
            default: undefined, // Explicitly undefined
          };
        },
        {
          virtual: true,
        },
      );

      await expect(configParser.loadConfig()).rejects.toThrow(
        "Unable to load dato-builder config file",
      );

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );

      // Clean up
      jest.dontMock("/mock/cwd/dato-builder.config.js");
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

      // Mock the dynamic import
      jest.doMock(
        "/mock/cwd/dato-builder.config.js",
        () => {
          return {
            default: mockConfig,
          };
        },
        {
          virtual: true,
        },
      );

      await expect(configParser.loadConfig()).rejects.toThrow(
        "Validation error: Missing apiToken",
      );

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );

      // Clean up
      jest.dontMock("/mock/cwd/dato-builder.config.js");
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

      // Mock the dynamic import
      jest.doMock(
        "/mock/cwd/dato-builder.config.js",
        () => {
          return {
            default: mockConfig,
          };
        },
        {
          virtual: true,
        },
      );

      await expect(configParser.loadConfig()).rejects.toThrow(
        "Validation error: Missing apiToken",
      );

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );

      // Clean up
      jest.dontMock("/mock/cwd/dato-builder.config.js");
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

      // Mock the module before the dynamic import
      jest.doMock("/mock/cwd/dato-builder.config.js", () => mockConfig, {
        virtual: true,
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

      // Clean up
      jest.dontMock("/mock/cwd/dato-builder.config.js");
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

      // Mock the module before the dynamic import
      jest.doMock("/mock/cwd/dato-builder.config.js", () => mockConfig, {
        virtual: true,
      });

      const result = await configParser.loadConfig();

      expect(result).toEqual(mockConfig);

      // Clean up
      jest.dontMock("/mock/cwd/dato-builder.config.js");
    });

    it("should prefer .js file over .ts file when both exist", async () => {
      const mockConfig: DatoBuilderConfig = {
        apiToken: "js-token",
      };

      // Mock fs.existsSync to return true for both files
      mockFs.existsSync.mockReturnValue(true);

      // Mock the module before the dynamic import
      jest.doMock("/mock/cwd/dato-builder.config.ts", () => mockConfig, {
        virtual: true,
      });

      // Mock the module before the dynamic import
      jest.doMock("/mock/cwd/dato-builder.config.js", () => mockConfig, {
        virtual: true,
      });

      await configParser.loadConfig();

      expect(mockFs.existsSync).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );
      expect(mockFs.existsSync).not.toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.ts",
      );

      // Clean up
      jest.dontMock("/mock/cwd/dato-builder.config.js");
      jest.dontMock("/mock/cwd/dato-builder.config.ts");
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
      const mockConfig = null;

      // Mock fs.existsSync to return true for .js file
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.js";
      });

      // Mock the dynamic import
      jest.doMock("/mock/cwd/dato-builder.config.js", () => mockConfig, {
        virtual: true,
      });

      await expect(configParser.loadConfig()).rejects.toThrow(
        "Unable to load dato-builder config file",
      );

      // Clean up
      jest.dontMock("/mock/cwd/dato-builder.config.js");
    });
  });

  describe("path validation security", () => {
    it("should reject config files that resolve outside project directory", async () => {
      // Mock fs.existsSync to return true for the config file
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.js";
      });

      // Mock fs.promises.realpath to simulate a symlink pointing outside the project
      const realPathMock = jest
        .fn<(path: string) => Promise<string>>()
        .mockResolvedValue("/etc/passwd");
      (mockFs as any).promises = { realpath: realPathMock };

      await expect(configParser.loadConfig()).rejects.toThrow(
        "Configuration file path resolves outside project directory",
      );

      expect(realPathMock).toHaveBeenCalledWith(
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
      const realPathMock = jest
        .fn<(path: string) => Promise<string>>()
        .mockResolvedValue("/mock/cwd/dato-builder.config.js");
      (mockFs as any).promises = { realpath: realPathMock };

      // Mock the config file import
      jest.doMock(
        "/mock/cwd/dato-builder.config.js",
        () => ({
          default: mockConfig,
        }),
        { virtual: true },
      );

      const result = await configParser.loadConfig();

      expect(result.apiToken).toBe("valid-token");
      expect(realPathMock).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );

      jest.dontMock("/mock/cwd/dato-builder.config.js");
    });

    it("should reject paths with directory traversal patterns", async () => {
      // Mock fs.existsSync to return true for the config file
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.js";
      });

      // Mock fs.promises.realpath to resolve to outside project directory
      const realPathMock = jest
        .fn<(path: string) => Promise<string>>()
        .mockResolvedValue("/etc/passwd");
      (mockFs as any).promises = { realpath: realPathMock };

      await expect(configParser.loadConfig()).rejects.toThrow(
        "Configuration file path resolves outside project directory",
      );

      expect(realPathMock).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.js",
      );
    });

    it("should validate both .js and .ts config file paths", async () => {
      // Mock fs.existsSync to return false for .js but true for .ts
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === "/mock/cwd/dato-builder.config.ts";
      });

      // Mock fs.promises.realpath to return path outside project for .ts file
      const realPathMock = jest
        .fn<(path: string) => Promise<string>>()
        .mockResolvedValue("/tmp/malicious.ts");
      (mockFs as any).promises = { realpath: realPathMock };

      await expect(configParser.loadConfig()).rejects.toThrow(
        "Configuration file path resolves outside project directory",
      );

      expect(realPathMock).toHaveBeenCalledWith(
        "/mock/cwd/dato-builder.config.ts",
      );
    });
  });
});
