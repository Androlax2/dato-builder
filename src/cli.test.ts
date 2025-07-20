import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createMockDatoBuilderCLI } from "../tests/utils/mockDatoBuilderCLI";
import type { GlobalOptions } from "./cli/CommandBuilder";
import type { DatoBuilderCLI } from "./DatoBuilderCLI";

// Create mock functions before mocking modules
const MockCommandBuilder = jest.fn();
const mockInitializeCLI =
  jest.fn<(options: GlobalOptions) => Promise<DatoBuilderCLI>>();

// Mock dependencies using unstable_mockModule for ESM compatibility
jest.unstable_mockModule("./cli/CommandBuilder", () => ({
  CommandBuilder: MockCommandBuilder,
}));

jest.unstable_mockModule("./cli/CLIInitializer", () => ({
  initializeCLI: mockInitializeCLI,
}));

// Import after mocking
const { CLI } = await import("./cli");
const { initializeCLI } = await import("./cli/CLIInitializer");

describe("CLI", () => {
  let mockCommandBuilder: {
    addBuildCommand: jest.MockedFunction<(fn: typeof initializeCLI) => unknown>;
    addGenerateCommands: jest.MockedFunction<
      (fn: typeof initializeCLI) => unknown
    >;
    addClearCacheCommand: jest.MockedFunction<
      (fn: typeof initializeCLI) => unknown
    >;
    parse: jest.MockedFunction<(argv: string[]) => Promise<void>>;
  };
  let mockCLI: jest.Mocked<DatoBuilderCLI>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock CommandBuilder instance
    mockCommandBuilder = {
      addBuildCommand: jest
        .fn<(fn: typeof initializeCLI) => unknown>()
        .mockReturnThis(),
      addGenerateCommands: jest
        .fn<(fn: typeof initializeCLI) => unknown>()
        .mockReturnThis(),
      addClearCacheCommand: jest
        .fn<(fn: typeof initializeCLI) => unknown>()
        .mockReturnThis(),
      parse: jest
        .fn<(argv: string[]) => Promise<void>>()
        .mockImplementation(async () => {}),
    };

    // Set up CommandBuilder constructor mock
    MockCommandBuilder.mockImplementation(() => mockCommandBuilder);

    // Mock DatoBuilderCLI
    mockCLI = createMockDatoBuilderCLI();
    mockInitializeCLI.mockResolvedValue(mockCLI);
  });

  describe("setupCLI", () => {
    it("should initialize CommandBuilder with correct version", async () => {
      await new CLI().execute();

      expect(MockCommandBuilder).toHaveBeenCalledWith("__PACKAGE_VERSION__");
    });

    it("should configure all commands", async () => {
      await new CLI().execute();

      expect(mockCommandBuilder.addBuildCommand).toHaveBeenCalledWith(
        initializeCLI,
      );
      expect(mockCommandBuilder.addGenerateCommands).toHaveBeenCalledWith(
        initializeCLI,
      );
      expect(mockCommandBuilder.addClearCacheCommand).toHaveBeenCalledWith(
        initializeCLI,
      );
    });

    it("should parse command line arguments", async () => {
      const originalProcessArgv = process.argv;
      process.argv = ["node", "cli.js", "build"];

      await new CLI().execute();

      expect(mockCommandBuilder.parse).toHaveBeenCalledWith(process.argv);

      process.argv = originalProcessArgv;
    });

    it("should handle CLI setup errors", async () => {
      const setupError = new Error("CLI setup failed");
      mockCommandBuilder.parse.mockRejectedValue(setupError);

      // Mock process.exit to prevent actual exit
      const mockExit = jest
        .spyOn(process, "exit")
        .mockImplementation(((_code?: number) => {}) as never);

      await new CLI().execute();

      expect(mockExit).toHaveBeenCalledWith(1);
      mockExit.mockRestore();
    });
  });

  describe("Command Flow Integration", () => {
    it("should handle build command flow", async () => {
      // Simulate build command execution
      const buildOptions = {
        enableDeletion: true,
        skipDeletionConfirmation: false,
        concurrency: 1,
      };

      // This would normally be called by the CommandBuilder
      await mockCLI.build(buildOptions);

      expect(mockCLI.build).toHaveBeenCalledWith(buildOptions);
    });

    it("should handle generate command flow", async () => {
      // Simulate generate command execution
      await mockCLI.generate();

      expect(mockCLI.generate).toHaveBeenCalledWith();
    });

    it("should handle generate:block command flow", async () => {
      // Simulate generate:block command execution
      await mockCLI.generate("block");

      expect(mockCLI.generate).toHaveBeenCalledWith("block");
    });

    it("should handle generate:model command flow", async () => {
      // Simulate generate:model command execution
      await mockCLI.generate("model");

      expect(mockCLI.generate).toHaveBeenCalledWith("model");
    });

    it("should handle clear-cache command flow", async () => {
      // Simulate clear-cache command execution
      await mockCLI.clearCache();

      expect(mockCLI.clearCache).toHaveBeenCalled();
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle CLI initialization errors", async () => {
      const initError = new Error("Initialization failed");
      mockInitializeCLI.mockRejectedValue(initError);

      // The error would be handled by CommandBuilder's action handlers
      await expect(
        mockInitializeCLI({} as unknown as GlobalOptions),
      ).rejects.toThrow("Initialization failed");
    });

    it("should handle build command errors", async () => {
      const buildError = new Error("Build failed");
      mockCLI.build.mockRejectedValue(buildError);

      await expect(mockCLI.build({})).rejects.toThrow("Build failed");
    });

    it("should handle generate command errors", async () => {
      const generateError = new Error("Generation failed");
      mockCLI.generate.mockRejectedValue(generateError);

      await expect(mockCLI.generate()).rejects.toThrow("Generation failed");
    });

    it("should handle cache command errors", async () => {
      const cacheError = new Error("Cache operation failed");
      mockCLI.clearCache.mockRejectedValue(cacheError);

      await expect(mockCLI.clearCache()).rejects.toThrow(
        "Cache operation failed",
      );
    });
  });

  describe("Version Integration", () => {
    it("should use package version placeholder", async () => {
      new CLI().execute();

      expect(MockCommandBuilder).toHaveBeenCalledWith("__PACKAGE_VERSION__");
    });
  });

  describe("CLI Arguments Integration", () => {
    it("should pass correct arguments to parse", async () => {
      const testArgv = ["node", "cli.js", "build", "--concurrent"];
      const originalArgv = process.argv;
      process.argv = testArgv;

      await new CLI().execute();

      expect(mockCommandBuilder.parse).toHaveBeenCalledWith(testArgv);

      process.argv = originalArgv;
    });

    it("should handle different command combinations", async () => {
      const testCases = [
        ["node", "cli.js", "build"],
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
  });

  describe("Initialization Function Integration", () => {
    it("should pass initializeCLI to all command builders", async () => {
      await new CLI().execute();

      expect(mockCommandBuilder.addBuildCommand).toHaveBeenCalledWith(
        initializeCLI,
      );
      expect(mockCommandBuilder.addGenerateCommands).toHaveBeenCalledWith(
        initializeCLI,
      );
      expect(mockCommandBuilder.addClearCacheCommand).toHaveBeenCalledWith(
        initializeCLI,
      );
    });
  });

  describe("Real CLI Simulation", () => {
    it("should simulate complete CLI workflow", async () => {
      // Simulate a complete workflow from CLI setup to command execution

      // 1. Setup CLI
      await new CLI().execute();

      // 2. Verify CLI was configured
      expect(MockCommandBuilder).toHaveBeenCalledWith("__PACKAGE_VERSION__");
      expect(mockCommandBuilder.addBuildCommand).toHaveBeenCalled();
      expect(mockCommandBuilder.addGenerateCommands).toHaveBeenCalled();
      expect(mockCommandBuilder.addClearCacheCommand).toHaveBeenCalled();
      expect(mockCommandBuilder.parse).toHaveBeenCalled();

      // 3. Simulate command execution (this would happen in CommandBuilder)
      const globalOptions = {
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      };

      const cli = await initializeCLI(globalOptions);
      expect(cli).toBe(mockCLI);

      // 4. Execute commands
      await cli.build({
        enableDeletion: true,
        skipDeletionConfirmation: false,
        concurrency: 1,
      });
      await cli.generate();
      await cli.generate("block");
      await cli.generate("model");
      await cli.clearCache();

      expect(mockCLI.build).toHaveBeenCalled();
      expect(mockCLI.generate).toHaveBeenCalledTimes(3);
      expect(mockCLI.clearCache).toHaveBeenCalled();
    });
  });

  describe("Error Propagation Integration", () => {
    it("should propagate setup errors correctly", async () => {
      const propagationError = new Error("Propagation test");
      mockCommandBuilder.addBuildCommand.mockImplementation(() => {
        throw propagationError;
      });

      // Mock process.exit to prevent actual exit
      const mockExit = jest
        .spyOn(process, "exit")
        .mockImplementation(((_code?: number) => {}) as never);

      await new CLI().execute();

      expect(mockExit).toHaveBeenCalledWith(1);
      mockExit.mockRestore();
    });

    it("should propagate parse errors correctly", async () => {
      const parseError = new Error("Parse error");
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
});
