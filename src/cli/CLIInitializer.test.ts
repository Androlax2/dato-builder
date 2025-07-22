import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createMockCache } from "../../tests/utils/mockCache";
import { createMockConfig } from "../../tests/utils/mockConfig";
import { createMockLogger } from "../../tests/utils/mockLogger";
import type { ResolvedDatoBuilderConfig } from "../types/DatoBuilderConfig";
import type { GlobalOptions } from "./CommandBuilder";

// Create mock functions and classes before mocking modules
const mockJoin = jest.fn() as jest.MockedFunction<
  (...paths: string[]) => string
>;

const MockCacheManager = jest.fn();
const MockConfigParser = jest.fn();
const MockDatoBuilderCLI = jest.fn();
const MockConsoleLogger = jest.fn();

// Mock all modules using unstable_mockModule for ESM compatibility
jest.unstable_mockModule("node:path", () => {
  const mockPath = {
    join: mockJoin,
  };
  return {
    default: mockPath,
    join: mockJoin,
  };
});

jest.unstable_mockModule("../cache/CacheManager", () => ({
  CacheManager: MockCacheManager,
}));

jest.unstable_mockModule("../config/ConfigParser", () => ({
  ConfigParser: MockConfigParser,
}));

jest.unstable_mockModule("../DatoBuilderCLI", () => ({
  DatoBuilderCLI: MockDatoBuilderCLI,
}));

jest.unstable_mockModule("../logger", () => ({
  ConsoleLogger: MockConsoleLogger,
  LogLevel: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
    TRACE: 4,
  },
}));

// Import after mocking
const { getLogLevelFromOptions, initializeCLI } = await import(
  "./CLIInitializer"
);
const { LogLevel } = await import("../logger");

describe("CLIInitializer", () => {
  let mockLogger: any;
  let mockConfigParser: any;
  let mockCache: any;
  let mockCLI: any;
  let mockConfig: ResolvedDatoBuilderConfig;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock path.join
    mockJoin.mockImplementation((...paths) => paths.join("/"));

    // Mock process.cwd
    jest.spyOn(process, "cwd").mockReturnValue("/mock/cwd");

    // Mock logger
    mockLogger = createMockLogger();
    MockConsoleLogger.mockImplementation(() => mockLogger);

    // Mock config
    mockConfig = createMockConfig({
      logLevel: LogLevel.INFO,
      blocksPath: "/mock/blocks",
      modelsPath: "/mock/models",
    });

    // Mock config parser
    mockConfigParser = {
      loadConfig: jest
        .fn<() => Promise<ResolvedDatoBuilderConfig>>()
        .mockResolvedValue(mockConfig),
    };
    MockConfigParser.mockImplementation(() => mockConfigParser);

    // Mock cache manager
    mockCache = createMockCache();
    MockCacheManager.mockImplementation(() => mockCache);

    // Mock DatoBuilderCLI
    mockCLI = {};
    MockDatoBuilderCLI.mockImplementation(() => mockCLI);
  });

  describe("getLogLevelFromOptions", () => {
    it("should return DEBUG for debug option", () => {
      const options: GlobalOptions = {
        debug: true,
        verbose: false,
        quiet: false,
        cache: true,
      };

      const result = getLogLevelFromOptions(options);

      expect(result).toBe(LogLevel.DEBUG);
    });

    it("should return ERROR for quiet option", () => {
      const options: GlobalOptions = {
        debug: false,
        verbose: false,
        quiet: true,
        cache: true,
      };

      const result = getLogLevelFromOptions(options);

      expect(result).toBe(LogLevel.ERROR);
    });

    it("should return TRACE for verbose option", () => {
      const options: GlobalOptions = {
        debug: false,
        verbose: true,
        quiet: false,
        cache: true,
      };

      const result = getLogLevelFromOptions(options);

      expect(result).toBe(LogLevel.TRACE);
    });

    it("should return INFO for default options", () => {
      const options: GlobalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };

      const result = getLogLevelFromOptions(options);

      expect(result).toBe(LogLevel.INFO);
    });

    it("should prioritize debug over other options", () => {
      const options: GlobalOptions = {
        debug: true,
        verbose: true,
        quiet: true,
        cache: true,
      };

      const result = getLogLevelFromOptions(options);

      expect(result).toBe(LogLevel.DEBUG);
    });

    it("should prioritize quiet over verbose when debug is false", () => {
      const options: GlobalOptions = {
        debug: false,
        verbose: true,
        quiet: true,
        cache: true,
      };

      const result = getLogLevelFromOptions(options);

      expect(result).toBe(LogLevel.ERROR);
    });
  });

  describe("initializeCLI", () => {
    it("should initialize CLI with default options", async () => {
      const options: GlobalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };

      const result = await initializeCLI(options);

      expect(MockConsoleLogger).toHaveBeenCalledWith(
        LogLevel.INFO,
        {},
        {
          timestamp: false,
          prefix: undefined,
          prettyJson: true,
        },
      );

      expect(MockConfigParser).toHaveBeenCalledWith(mockLogger, undefined);
      expect(mockConfigParser.loadConfig).toHaveBeenCalled();

      expect(MockCacheManager).toHaveBeenCalledWith(
        "/mock/cwd/.dato-builder-cache/item-types.json",
        {
          skipReads: false,
        },
      );

      expect(mockCache.initialize).toHaveBeenCalled();

      expect(MockDatoBuilderCLI).toHaveBeenCalledWith({
        config: mockConfig,
        cache: mockCache,
        logger: mockLogger,
      });

      expect(result).toBe(mockCLI);
    });

    it("should initialize CLI with custom config path", async () => {
      const options: GlobalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };
      const customConfigPath = "/test/fixtures/custom-config.js";

      const result = await initializeCLI(options, customConfigPath);

      expect(MockConfigParser).toHaveBeenCalledWith(
        mockLogger,
        customConfigPath,
      );
      expect(result).toBe(mockCLI);
    });

    it("should initialize CLI with debug options", async () => {
      const options: GlobalOptions = {
        debug: true,
        verbose: false,
        quiet: false,
        cache: true,
      };

      await initializeCLI(options);

      expect(MockConsoleLogger).toHaveBeenCalledWith(
        LogLevel.DEBUG,
        {},
        {
          timestamp: false,
          prefix: undefined,
          prettyJson: true,
        },
      );

      expect(mockLogger.setLevel).toHaveBeenCalledWith(LogLevel.DEBUG);
      expect(mockConfig.logLevel).toBe(LogLevel.DEBUG);
    });

    it("should initialize CLI with verbose options", async () => {
      const options: GlobalOptions = {
        debug: false,
        verbose: true,
        quiet: false,
        cache: true,
      };

      await initializeCLI(options);

      expect(MockConsoleLogger).toHaveBeenCalledWith(
        LogLevel.TRACE,
        {},
        {
          timestamp: true,
          prefix: "dato-builder",
          prettyJson: true,
        },
      );

      expect(mockLogger.setLevel).toHaveBeenCalledWith(LogLevel.TRACE);
      expect(mockConfig.logLevel).toBe(LogLevel.TRACE);
    });

    it("should initialize CLI with quiet options", async () => {
      const options: GlobalOptions = {
        debug: false,
        verbose: false,
        quiet: true,
        cache: true,
      };

      await initializeCLI(options);

      expect(MockConsoleLogger).toHaveBeenCalledWith(
        LogLevel.ERROR,
        {},
        {
          timestamp: false,
          prefix: undefined,
          prettyJson: true,
        },
      );

      expect(mockLogger.setLevel).toHaveBeenCalledWith(LogLevel.ERROR);
      expect(mockConfig.logLevel).toBe(LogLevel.ERROR);
    });

    it("should initialize CLI with no-cache option", async () => {
      const options: GlobalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: false,
      };

      await initializeCLI(options);

      expect(MockCacheManager).toHaveBeenCalledWith(
        "/mock/cwd/.dato-builder-cache/item-types.json",
        {
          skipReads: true,
        },
      );
    });

    it("should use config log level when no CLI options provided", async () => {
      const options: GlobalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };

      mockConfig.logLevel = LogLevel.DEBUG;

      await initializeCLI(options);

      expect(mockLogger.setLevel).toHaveBeenCalledWith(LogLevel.DEBUG);
      expect(mockConfig.logLevel).toBe(LogLevel.DEBUG);
    });

    it("should override config log level when CLI options provided", async () => {
      const options: GlobalOptions = {
        debug: true,
        verbose: false,
        quiet: false,
        cache: true,
      };

      mockConfig.logLevel = LogLevel.INFO;

      await initializeCLI(options);

      expect(mockLogger.setLevel).toHaveBeenCalledWith(LogLevel.DEBUG);
      expect(mockConfig.logLevel).toBe(LogLevel.DEBUG);
    });

    it("should handle custom config path with debug options", async () => {
      const options: GlobalOptions = {
        debug: true,
        verbose: false,
        quiet: false,
        cache: true,
      };
      const customConfigPath = "/test/fixtures/debug-config.js";

      await initializeCLI(options, customConfigPath);

      expect(MockConfigParser).toHaveBeenCalledWith(
        mockLogger,
        customConfigPath,
      );
      expect(mockLogger.setLevel).toHaveBeenCalledWith(LogLevel.DEBUG);
    });

    it("should handle empty string as custom config path", async () => {
      const options: GlobalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };

      await initializeCLI(options, "");

      expect(MockConfigParser).toHaveBeenCalledWith(mockLogger, "");
    });

    it("should handle config loading errors", async () => {
      const options: GlobalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };

      const configError = new Error("Config not found");
      mockConfigParser.loadConfig.mockRejectedValue(configError);

      await expect(initializeCLI(options)).rejects.toThrow("Config not found");
    });

    it("should handle config loading errors with custom path", async () => {
      const options: GlobalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };
      const customConfigPath = "/nonexistent/config.js";

      const configError = new Error("Custom config not found");
      mockConfigParser.loadConfig.mockRejectedValue(configError);

      await expect(initializeCLI(options, customConfigPath)).rejects.toThrow(
        "Custom config not found",
      );
      expect(MockConfigParser).toHaveBeenCalledWith(
        mockLogger,
        customConfigPath,
      );
    });

    it("should handle cache initialization errors", async () => {
      const options: GlobalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };

      const cacheError = new Error("Cache initialization failed");
      mockCache.initialize.mockRejectedValue(cacheError);

      await expect(initializeCLI(options)).rejects.toThrow(
        "Cache initialization failed",
      );
    });

    it("should create correct cache path", async () => {
      const options: GlobalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };

      await initializeCLI(options);

      // Verify cache manager is created with expected path
      expect(MockCacheManager).toHaveBeenCalledWith(
        "/mock/cwd/.dato-builder-cache/item-types.json",
        {
          skipReads: false,
        },
      );
    });

    it("should pass correct parameters to DatoBuilderCLI", async () => {
      const options: GlobalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };

      const customConfig = createMockConfig({
        logLevel: LogLevel.WARN,
        blocksPath: "/custom/blocks",
        modelsPath: "/custom/models",
      });
      mockConfigParser.loadConfig.mockResolvedValue(customConfig);

      await initializeCLI(options);

      expect(MockDatoBuilderCLI).toHaveBeenCalledWith({
        config: customConfig,
        cache: mockCache,
        logger: mockLogger,
      });
    });

    it("should handle logger creation with custom configuration", async () => {
      const options: GlobalOptions = {
        debug: false,
        verbose: true,
        quiet: false,
        cache: true,
      };

      await initializeCLI(options);

      expect(MockConsoleLogger).toHaveBeenCalledWith(
        LogLevel.TRACE,
        {},
        {
          timestamp: true,
          prefix: "dato-builder",
          prettyJson: true,
        },
      );
    });

    it("should handle all combinations of global options", async () => {
      const testCases = [
        { debug: true, verbose: true, quiet: true, expected: LogLevel.DEBUG },
        { debug: false, verbose: true, quiet: true, expected: LogLevel.ERROR },
        { debug: false, verbose: true, quiet: false, expected: LogLevel.TRACE },
        { debug: false, verbose: false, quiet: true, expected: LogLevel.ERROR },
        { debug: false, verbose: false, quiet: false, expected: LogLevel.INFO },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();

        const options: GlobalOptions = {
          ...testCase,
          cache: true,
        };

        await initializeCLI(options);

        expect(MockConsoleLogger).toHaveBeenCalledWith(
          testCase.expected,
          {},
          expect.any(Object),
        );
      }
    });

    it("should handle process.cwd() errors", async () => {
      const cwdError = new Error("Process cwd failed");
      jest.spyOn(process, "cwd").mockImplementation(() => {
        throw cwdError;
      });

      const options: GlobalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };

      await expect(initializeCLI(options)).rejects.toThrow(
        "Process cwd failed",
      );
    });
  });

  describe("integration", () => {
    it("should use the correct log level based on options priority", async () => {
      const testData = [
        {
          input: { debug: true, verbose: true, quiet: true },
          expected: LogLevel.DEBUG,
        },
        {
          input: { debug: false, verbose: true, quiet: true },
          expected: LogLevel.ERROR,
        },
        {
          input: { debug: false, verbose: true, quiet: false },
          expected: LogLevel.TRACE,
        },
        {
          input: { debug: false, verbose: false, quiet: true },
          expected: LogLevel.ERROR,
        },
        {
          input: { debug: false, verbose: false, quiet: false },
          expected: LogLevel.INFO,
        },
      ];

      for (const { input, expected } of testData) {
        const options: GlobalOptions = { ...input, cache: true };
        const logLevel = getLogLevelFromOptions(options);

        expect(logLevel).toBe(expected);
      }
    });

    it("should create unique instances for each initialization", async () => {
      const options: GlobalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };

      await initializeCLI(options);
      await initializeCLI(options);

      expect(MockDatoBuilderCLI).toHaveBeenCalledTimes(2);
      expect(MockConsoleLogger).toHaveBeenCalledTimes(2);
      expect(MockConfigParser).toHaveBeenCalledTimes(2);
      expect(MockCacheManager).toHaveBeenCalledTimes(2);
    });
  });
});
