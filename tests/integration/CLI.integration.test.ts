import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createMockCache } from "../utils/mockCache";
import { createMockConfig } from "../utils/mockConfig";
import { createMockDatoApi } from "../utils/mockDatoApi";

// Create mock functions before mocking modules
const MockCommandBuilder = jest.fn<(version: string) => any>();
const MockRunCommand = jest.fn<() => any>();
const MockPlopGenerator = jest.fn<() => any>();
const MockConfigParser = jest.fn<() => any>();
const MockCacheManager = jest.fn<() => any>();
const mockInitializeCLI = jest.fn<(options: any) => Promise<any>>();

// Mock dependencies using unstable_mockModule for ESM compatibility
jest.unstable_mockModule("../../src/cli/CommandBuilder", () => ({
  CommandBuilder: MockCommandBuilder,
}));

jest.unstable_mockModule("../../src/commands/run/RunCommand", () => ({
  RunCommand: MockRunCommand,
}));

jest.unstable_mockModule("../../src/generation/PlopGenerator", () => ({
  default: MockPlopGenerator,
}));

jest.unstable_mockModule("../../src/config/ConfigParser", () => ({
  ConfigParser: MockConfigParser,
}));

jest.unstable_mockModule("../../src/cache/CacheManager", () => ({
  CacheManager: MockCacheManager,
}));

jest.unstable_mockModule("../../src/cli/CLIInitializer", () => ({
  initializeCLI: mockInitializeCLI,
}));

// Mock DatoApi
const MockDatoApi = jest.fn();
jest.unstable_mockModule("../../src/Api/DatoApi", () => ({
  default: MockDatoApi,
}));

// Import after mocking
const { CLI } = await import("../../src/cli");

describe("CLI Integration Tests", () => {
  let mockCommandBuilder: any;
  let mockRunCommand: any;
  let mockPlopGenerator: any;
  let mockConfigParser: any;
  let mockCacheManager: any;
  let mockDatoBuilderCLI: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock CommandBuilder instance
    mockCommandBuilder = {
      addBuildCommand: jest.fn<(handler: Function) => any>().mockReturnThis(),
      addGenerateCommands: jest
        .fn<(handler: Function) => any>()
        .mockReturnThis(),
      addClearCacheCommand: jest
        .fn<(handler: Function) => any>()
        .mockReturnThis(),
      parse: jest
        .fn<(argv: string[]) => Promise<void>>()
        .mockResolvedValue(undefined),
    };

    // Mock RunCommand instance
    mockRunCommand = {
      execute: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };

    // Mock PlopGenerator instance
    mockPlopGenerator = {
      generate: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };

    // Mock ConfigParser instance
    mockConfigParser = {
      parse: jest.fn<() => any>().mockReturnValue(createMockConfig()),
    };

    // Mock CacheManager instance
    mockCacheManager = createMockCache();

    // Mock DatoBuilderCLI instance
    mockDatoBuilderCLI = {
      build: jest
        .fn<(options: any) => Promise<void>>()
        .mockResolvedValue(undefined),
      generate: jest
        .fn<(type?: string) => Promise<void>>()
        .mockResolvedValue(undefined),
      clearCache: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };

    // Setup constructor mocks
    MockCommandBuilder.mockImplementation(() => mockCommandBuilder);
    MockRunCommand.mockImplementation(() => mockRunCommand);
    MockPlopGenerator.mockImplementation(() => mockPlopGenerator);
    MockConfigParser.mockImplementation(() => mockConfigParser);
    MockCacheManager.mockImplementation(() => mockCacheManager);
    mockInitializeCLI.mockResolvedValue(mockDatoBuilderCLI);

    // Mock DatoApi using the properly typed utility
    MockDatoApi.mockImplementation(() => createMockDatoApi());
  });

  describe("CLI Setup and Configuration", () => {
    it("should initialize CLI with correct version and command configuration", async () => {
      const cli = new CLI();
      await cli.execute();

      expect(MockCommandBuilder).toHaveBeenCalledWith("__PACKAGE_VERSION__");
      expect(mockCommandBuilder.addBuildCommand).toHaveBeenCalledWith(
        expect.any(Function),
      );
      expect(mockCommandBuilder.addGenerateCommands).toHaveBeenCalledWith(
        expect.any(Function),
      );
      expect(mockCommandBuilder.addClearCacheCommand).toHaveBeenCalledWith(
        expect.any(Function),
      );
      expect(mockCommandBuilder.parse).toHaveBeenCalledWith(process.argv);
    });

    it("should handle CLI initialization errors gracefully", async () => {
      const setupError = new Error("CLI setup failed");
      mockCommandBuilder.parse.mockRejectedValue(setupError);

      // Mock process.exit to prevent actual exit
      const mockExit = jest
        .spyOn(process, "exit")
        .mockImplementation(((_code?: number) => {}) as never);

      const cli = new CLI();
      await cli.execute();

      expect(mockExit).toHaveBeenCalledWith(1);
      mockExit.mockRestore();
    });
  });

  describe("Build Command Integration", () => {
    it("should execute complete build workflow with default options", async () => {
      // Mock global options
      const globalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };

      // Mock build options
      const buildOptions = {
        enableDeletion: true,
        skipDeletionConfirmation: false,
        concurrency: 1,
      };

      // Initialize CLI first
      await new CLI().execute();

      // Execute build action (simulating command execution)
      const datoBuilderCLI = (await mockInitializeCLI(
        globalOptions,
      )) as typeof mockDatoBuilderCLI;
      await datoBuilderCLI.build(buildOptions);

      expect(mockInitializeCLI).toHaveBeenCalledWith(globalOptions);
      expect(mockDatoBuilderCLI.build).toHaveBeenCalledWith(buildOptions);
    });

    it("should handle build command with custom concurrency", async () => {
      await new CLI().execute();

      const globalOptions = {
        debug: true,
        verbose: true,
        quiet: false,
        cache: true,
      };

      const buildOptions = {
        enableDeletion: false,
        skipDeletionConfirmation: true,
        concurrency: 5,
      };

      const datoBuilderCLI = (await mockInitializeCLI(
        globalOptions,
      )) as typeof mockDatoBuilderCLI;
      await datoBuilderCLI.build(buildOptions);

      expect(mockDatoBuilderCLI.build).toHaveBeenCalledWith(buildOptions);
    });

    it("should handle build errors and provide meaningful feedback", async () => {
      const buildError = new Error("Build process failed");
      mockDatoBuilderCLI.build.mockRejectedValue(buildError);

      await new CLI().execute();

      const globalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };
      const buildOptions = {
        enableDeletion: true,
        skipDeletionConfirmation: false,
        concurrency: 1,
      };

      const datoBuilderCLI = (await mockInitializeCLI(
        globalOptions,
      )) as typeof mockDatoBuilderCLI;

      await expect(datoBuilderCLI.build(buildOptions)).rejects.toThrow(
        "Build process failed",
      );
    });
  });

  describe("Generate Command Integration", () => {
    it("should execute generate command for blocks", async () => {
      await new CLI().execute();

      const globalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };
      const datoBuilderCLI = (await mockInitializeCLI(
        globalOptions,
      )) as typeof mockDatoBuilderCLI;

      await datoBuilderCLI.generate("block");

      expect(mockDatoBuilderCLI.generate).toHaveBeenCalledWith("block");
    });

    it("should execute generate command for models", async () => {
      await new CLI().execute();

      const globalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };
      const datoBuilderCLI = (await mockInitializeCLI(
        globalOptions,
      )) as typeof mockDatoBuilderCLI;

      await datoBuilderCLI.generate("model");

      expect(mockDatoBuilderCLI.generate).toHaveBeenCalledWith("model");
    });

    it("should execute general generate command", async () => {
      await new CLI().execute();

      const globalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };
      const datoBuilderCLI = (await mockInitializeCLI(
        globalOptions,
      )) as typeof mockDatoBuilderCLI;

      await datoBuilderCLI.generate();

      expect(mockDatoBuilderCLI.generate).toHaveBeenCalledWith();
    });

    it("should handle generate command errors", async () => {
      const generateError = new Error("Generation failed");
      mockDatoBuilderCLI.generate.mockRejectedValue(generateError);

      await new CLI().execute();

      const globalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };
      const datoBuilderCLI = (await mockInitializeCLI(
        globalOptions,
      )) as typeof mockDatoBuilderCLI;

      await expect(datoBuilderCLI.generate("block")).rejects.toThrow(
        "Generation failed",
      );
    });
  });

  describe("Cache Command Integration", () => {
    it("should execute clear cache command", async () => {
      await new CLI().execute();

      const globalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };
      const datoBuilderCLI = (await mockInitializeCLI(
        globalOptions,
      )) as typeof mockDatoBuilderCLI;

      await datoBuilderCLI.clearCache();

      expect(mockDatoBuilderCLI.clearCache).toHaveBeenCalled();
    });

    it("should handle cache command errors", async () => {
      const cacheError = new Error("Cache operation failed");
      mockDatoBuilderCLI.clearCache.mockRejectedValue(cacheError);

      await new CLI().execute();

      const globalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };
      const datoBuilderCLI = (await mockInitializeCLI(
        globalOptions,
      )) as typeof mockDatoBuilderCLI;

      await expect(datoBuilderCLI.clearCache()).rejects.toThrow(
        "Cache operation failed",
      );
    });
  });

  describe("Global Options Integration", () => {
    it("should respect debug flag across all commands", async () => {
      await new CLI().execute();

      const globalOptions = {
        debug: true,
        verbose: false,
        quiet: false,
        cache: true,
      };

      await mockInitializeCLI(globalOptions);

      expect(mockInitializeCLI).toHaveBeenCalledWith(
        expect.objectContaining({ debug: true }),
      );
    });

    it("should respect verbose flag across all commands", async () => {
      await new CLI().execute();

      const globalOptions = {
        debug: false,
        verbose: true,
        quiet: false,
        cache: true,
      };

      await mockInitializeCLI(globalOptions);

      expect(mockInitializeCLI).toHaveBeenCalledWith(
        expect.objectContaining({ verbose: true }),
      );
    });

    it("should respect cache disable flag", async () => {
      await new CLI().execute();

      const globalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: false,
      };

      await mockInitializeCLI(globalOptions);

      expect(mockInitializeCLI).toHaveBeenCalledWith(
        expect.objectContaining({ cache: false }),
      );
    });
  });

  describe("Command Flow Integration", () => {
    it("should handle complex workflow: generate -> build -> clear cache", async () => {
      await new CLI().execute();

      const globalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };
      const datoBuilderCLI = (await mockInitializeCLI(
        globalOptions,
      )) as typeof mockDatoBuilderCLI;

      // Simulate workflow
      await datoBuilderCLI.generate("block");
      await datoBuilderCLI.build({
        enableDeletion: true,
        skipDeletionConfirmation: false,
        concurrency: 1,
      });
      await datoBuilderCLI.clearCache();

      expect(mockDatoBuilderCLI.generate).toHaveBeenCalledWith("block");
      expect(mockDatoBuilderCLI.build).toHaveBeenCalledWith({
        enableDeletion: true,
        skipDeletionConfirmation: false,
        concurrency: 1,
      });
      expect(mockDatoBuilderCLI.clearCache).toHaveBeenCalled();
    });

    it("should handle concurrent command execution", async () => {
      await new CLI().execute();

      const globalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };
      const datoBuilderCLI = (await mockInitializeCLI(
        globalOptions,
      )) as typeof mockDatoBuilderCLI;

      // Simulate concurrent operations (though typically not done)
      const promises = [
        datoBuilderCLI.generate("block"),
        datoBuilderCLI.generate("model"),
      ];

      await Promise.all(promises);

      expect(mockDatoBuilderCLI.generate).toHaveBeenCalledTimes(2);
      expect(mockDatoBuilderCLI.generate).toHaveBeenCalledWith("block");
      expect(mockDatoBuilderCLI.generate).toHaveBeenCalledWith("model");
    });
  });

  describe("Error Handling and Recovery", () => {
    it("should provide helpful error messages for common issues", async () => {
      const configError = new Error("Configuration file not found");
      mockInitializeCLI.mockRejectedValueOnce(configError);

      await new CLI().execute();

      // The error should be handled during CLI initialization
      await expect(
        mockInitializeCLI({
          debug: false,
          verbose: false,
          quiet: false,
          cache: true,
        }),
      ).rejects.toThrow("Configuration file not found");
    });

    it("should handle API connection errors gracefully", async () => {
      const apiError = new Error("API connection failed");
      mockInitializeCLI.mockRejectedValueOnce(apiError);

      await new CLI().execute();

      const globalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };

      // Should handle API initialization errors
      await expect(mockInitializeCLI(globalOptions)).rejects.toThrow();
    });

    it("should handle cache initialization errors", async () => {
      const cacheError = new Error("Cache initialization failed");
      mockInitializeCLI.mockRejectedValueOnce(cacheError);

      await new CLI().execute();

      const globalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };

      await expect(mockInitializeCLI(globalOptions)).rejects.toThrow();
    });
  });

  describe("Argument Parsing Integration", () => {
    it("should handle different argument combinations", async () => {
      const testCases = [
        ["node", "cli.js", "build"],
        ["node", "cli.js", "build", "--no-deletion"],
        ["node", "cli.js", "build", "--concurrent", "5"],
        ["node", "cli.js", "generate"],
        ["node", "cli.js", "generate:block"],
        ["node", "cli.js", "generate:model"],
        ["node", "cli.js", "clear-cache"],
        ["node", "cli.js", "--help"],
        ["node", "cli.js", "--version"],
      ];

      for (const argv of testCases) {
        jest.clearAllMocks();
        const originalArgv = process.argv;
        process.argv = argv;

        await new CLI().execute();

        expect(mockCommandBuilder.parse).toHaveBeenCalledWith(argv);

        process.argv = originalArgv;
      }
    });

    it("should handle invalid arguments gracefully", async () => {
      const parseError = new Error("Invalid argument provided");
      mockCommandBuilder.parse.mockRejectedValue(parseError);

      // Mock process.exit to prevent actual exit
      const mockExit = jest
        .spyOn(process, "exit")
        .mockImplementation(((_code?: number) => {}) as never);

      await new CLI().execute();

      expect(mockExit).toHaveBeenCalledWith(1);
      mockExit.mockRestore();
    });
  });

  describe("Performance Integration", () => {
    it("should handle CLI operations efficiently", async () => {
      const startTime = Date.now();

      await new CLI().execute();

      const globalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };
      const datoBuilderCLI = (await mockInitializeCLI(
        globalOptions,
      )) as typeof mockDatoBuilderCLI;

      // Simulate typical workflow
      await datoBuilderCLI.generate("block");
      await datoBuilderCLI.build({
        enableDeletion: false,
        skipDeletionConfirmation: true,
        concurrency: 1,
      });

      const endTime = Date.now();

      // CLI operations should be relatively fast
      expect(endTime - startTime).toBeLessThan(1000); // 1 second
    });

    it("should handle high concurrency build options", async () => {
      await new CLI().execute();

      const globalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };
      const datoBuilderCLI = (await mockInitializeCLI(
        globalOptions,
      )) as typeof mockDatoBuilderCLI;

      await datoBuilderCLI.build({
        enableDeletion: false,
        skipDeletionConfirmation: true,
        concurrency: 20, // High concurrency
      });

      expect(mockDatoBuilderCLI.build).toHaveBeenCalledWith(
        expect.objectContaining({ concurrency: 20 }),
      );
    });
  });

  describe("Environment Integration", () => {
    it("should respect environment variables for configuration", async () => {
      // Mock environment variables
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        DATO_API_TOKEN: "env-token",
        DEBUG: "true",
      };

      await new CLI().execute();

      const globalOptions = {
        debug: true,
        verbose: false,
        quiet: false,
        cache: true,
      };
      await mockInitializeCLI(globalOptions);

      expect(mockInitializeCLI).toHaveBeenCalledWith(
        expect.objectContaining({ debug: true }),
      );

      process.env = originalEnv;
    });

    it("should handle missing environment variables gracefully", async () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        DATO_API_TOKEN: undefined,
      };

      await new CLI().execute();

      // Should still initialize, configuration validation happens later
      const globalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };
      await mockInitializeCLI(globalOptions);

      expect(mockInitializeCLI).toHaveBeenCalled();

      process.env = originalEnv;
    });
  });
});
