import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createMockDatoBuilderCLI } from "../../tests/utils/mockDatoBuilderCLI";
import type { DatoBuilderCLI } from "../DatoBuilderCLI";
import type { BuildOptions, GlobalOptions } from "./CommandBuilder";

// Create mock functions before mocking modules
const mockCpus = jest.fn();
const MockCommand = jest.fn();

// Mock dependencies using unstable_mockModule for ESM compatibility
jest.unstable_mockModule("node:os", () => ({
  default: {
    cpus: mockCpus,
  },
  cpus: mockCpus,
}));

jest.unstable_mockModule("@commander-js/extra-typings", () => ({
  Command: MockCommand,
}));

// Import after mocking
const { CommandBuilder } = await import("./CommandBuilder");
type CommandBuilderType = InstanceType<typeof CommandBuilder>;

describe("CommandBuilder", () => {
  let commandBuilder: CommandBuilderType;
  let mockProgram: any;
  let mockCommand: any;
  let mockInitializeCLI: jest.MockedFunction<
    (
      options: GlobalOptions,
      customConfigPath?: string,
    ) => Promise<DatoBuilderCLI>
  >;
  let mockCLI: jest.Mocked<DatoBuilderCLI>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    mockCpus.mockReset();

    // Mock Command instance
    mockProgram = {
      name: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      version: jest.fn().mockReturnThis(),
      option: jest.fn().mockReturnThis(),
      command: jest.fn().mockReturnThis(),
      action: jest.fn().mockReturnThis(),
      parseAsync: jest.fn().mockImplementation(async () => {}),
    };

    mockCommand = {
      description: jest.fn().mockReturnThis(),
      option: jest.fn().mockReturnThis(),
      action: jest.fn().mockReturnThis(),
      optsWithGlobals: jest.fn().mockReturnValue({
        debug: false,
        verbose: false,
        quiet: false,
        cache: true,
      }),
    };

    MockCommand.mockImplementation(() => mockProgram);
    mockProgram.command.mockReturnValue(mockCommand);

    mockCLI = createMockDatoBuilderCLI();
    mockInitializeCLI = jest
      .fn<
        (
          options: GlobalOptions,
          customConfigPath?: string,
        ) => Promise<DatoBuilderCLI>
      >()
      .mockResolvedValue(mockCLI);

    commandBuilder = new CommandBuilder("1.0.0");
  });

  describe("constructor", () => {
    it("should initialize Commander program with correct configuration", () => {
      expect(MockCommand).toHaveBeenCalled();
      expect(mockProgram.name).toHaveBeenCalledWith("dato-builder");
      expect(mockProgram.description).toHaveBeenCalledWith(
        "DatoCMS Builder CLI",
      );
      expect(mockProgram.version).toHaveBeenCalledWith("1.0.0");
      expect(mockProgram.option).toHaveBeenCalledWith(
        "-n, --no-cache",
        "Disable cache usage",
      );
      expect(mockProgram.option).toHaveBeenCalledWith(
        "-d, --debug",
        "Output information useful for debugging.",
        false,
      );
      expect(mockProgram.option).toHaveBeenCalledWith(
        "-v, --verbose",
        "Display even finer-grained trace logs.",
        false,
      );
      expect(mockProgram.option).toHaveBeenCalledWith(
        "-q, --quiet",
        "Only display errors.",
        false,
      );
    });

    it("should store custom config path when provided", () => {
      const customConfigPath = "/test/custom-config.js";
      const commandBuilder = new CommandBuilder("1.0.0", customConfigPath);

      // Verify the instance was created (the path is private, but we'll test its usage in action methods)
      expect(commandBuilder).toBeInstanceOf(CommandBuilder);
    });

    it("should handle undefined custom config path", () => {
      const commandBuilder = new CommandBuilder("1.0.0", undefined);

      expect(commandBuilder).toBeInstanceOf(CommandBuilder);
    });
  });

  describe("addBuildCommand", () => {
    it("should configure build command with all options", () => {
      commandBuilder.addBuildCommand(mockInitializeCLI);

      expect(mockProgram.command).toHaveBeenCalledWith("build");
      expect(mockCommand.description).toHaveBeenCalledWith(
        "Build DatoCMS types and blocks",
      );
      expect(mockCommand.option).toHaveBeenCalledWith(
        "--skip-deletion",
        "Skip deletion detection and removal of orphaned items",
        false,
      );
      expect(mockCommand.option).toHaveBeenCalledWith(
        "--skip-deletion-confirmation",
        "Skip confirmation prompts for deletions",
        false,
      );
      expect(mockCommand.option).toHaveBeenCalledWith(
        "--concurrent",
        "Enable concurrent builds (default concurrency: 3)",
        false,
      );
      expect(mockCommand.option).toHaveBeenCalledWith(
        "--concurrency <number>",
        "Set the concurrency level for builds (implies --concurrent)",
        parseInt,
      );
      expect(mockCommand.option).toHaveBeenCalledWith(
        "--auto-concurrency",
        "Automatically determine and set concurrency based on CPU cores",
        false,
      );
      expect(mockCommand.action).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should return this for method chaining", () => {
      const result = commandBuilder.addBuildCommand(mockInitializeCLI);
      expect(result).toBe(commandBuilder);
    });

    it("should handle build command execution with default options", async () => {
      commandBuilder.addBuildCommand(mockInitializeCLI);

      if (!mockCommand.action?.mock?.calls?.[0]) {
        throw new Error(
          "Expected mockCommand.action to have been called at least once.",
        );
      }
      const actionHandler = mockCommand.action.mock.calls[0][0];

      const buildOptions: BuildOptions = {
        skipDeletion: false,
        skipDeletionConfirmation: false,
      };

      await actionHandler.call(mockCommand, buildOptions, mockCommand);

      expect(mockInitializeCLI).toHaveBeenCalledWith(
        {
          debug: false,
          verbose: false,
          quiet: false,
          cache: true,
        },
        undefined,
      );
      expect(mockCLI.build).toHaveBeenCalledWith({
        enableDeletion: true,
        skipDeletionConfirmation: false,
        concurrency: 1,
      });
    });

    it("should pass custom config path to initializeCLI", async () => {
      const customConfigPath = "/test/fixtures/test-config.js";
      const customCommandBuilder = new CommandBuilder(
        "1.0.0",
        customConfigPath,
      );
      customCommandBuilder.addBuildCommand(mockInitializeCLI);

      if (!mockCommand.action?.mock?.calls?.[0]) {
        throw new Error(
          "Expected mockCommand.action to have been called at least once.",
        );
      }
      const actionHandler = mockCommand.action.mock.calls[0][0];

      const buildOptions: BuildOptions = {
        skipDeletion: false,
        skipDeletionConfirmation: false,
      };

      await actionHandler.call(mockCommand, buildOptions, mockCommand);

      expect(mockInitializeCLI).toHaveBeenCalledWith(
        {
          debug: false,
          verbose: false,
          quiet: false,
          cache: true,
        },
        customConfigPath,
      );
    });

    it("should handle build command with auto-concurrency", async () => {
      const cpuCount = 8;
      mockCpus.mockReturnValue(new Array(cpuCount));
      commandBuilder.addBuildCommand(mockInitializeCLI);

      if (!mockCommand.action?.mock?.calls?.[0]) {
        throw new Error(
          "Expected mockCommand.action to have been called at least once.",
        );
      }
      const actionHandler = mockCommand.action.mock.calls[0][0];

      const buildOptions: BuildOptions = {
        skipDeletion: false,
        skipDeletionConfirmation: false,
        autoConcurrency: true,
      };

      await actionHandler.call(mockCommand, buildOptions, mockCommand);

      expect(mockCLI.build).toHaveBeenCalledWith({
        enableDeletion: true,
        skipDeletionConfirmation: false,
        concurrency: Math.max(1, cpuCount - 1), // CPU count - 1, minimum 1
      });
    });

    it("should handle build command with concurrent flag", async () => {
      commandBuilder.addBuildCommand(mockInitializeCLI);

      if (!mockCommand.action?.mock?.calls?.[0]) {
        throw new Error(
          "Expected mockCommand.action to have been called at least once.",
        );
      }
      const actionHandler = mockCommand.action.mock.calls[0][0];

      const buildOptions: BuildOptions = {
        skipDeletion: false,
        skipDeletionConfirmation: false,
        concurrent: true,
      };

      await actionHandler.call(mockCommand, buildOptions, mockCommand);

      expect(mockCLI.build).toHaveBeenCalledWith({
        enableDeletion: true,
        skipDeletionConfirmation: false,
        concurrency: 3,
      });
    });

    it("should handle build command with specific concurrency", async () => {
      commandBuilder.addBuildCommand(mockInitializeCLI);

      if (!mockCommand.action?.mock?.calls?.[0]) {
        throw new Error(
          "Expected mockCommand.action to have been called at least once.",
        );
      }
      const actionHandler = mockCommand.action.mock.calls[0][0];

      const buildOptions: BuildOptions = {
        skipDeletion: false,
        skipDeletionConfirmation: false,
        concurrency: 5,
      };

      await actionHandler.call(mockCommand, buildOptions, mockCommand);

      expect(mockCLI.build).toHaveBeenCalledWith({
        enableDeletion: true,
        skipDeletionConfirmation: false,
        concurrency: 5,
      });
    });

    it("should handle build command errors", async () => {
      const mockError = new Error("Build failed");
      mockCLI.build.mockRejectedValue(mockError);

      const mockExit = jest
        .spyOn(process, "exit")
        .mockImplementation(((_code?: number) => {}) as never);
      commandBuilder.addBuildCommand(mockInitializeCLI);

      if (!mockCommand.action?.mock?.calls?.[0]) {
        throw new Error(
          "Expected mockCommand.action to have been called at least once.",
        );
      }
      const actionHandler = mockCommand.action.mock.calls[0][0];

      const buildOptions: BuildOptions = {
        skipDeletion: false,
        skipDeletionConfirmation: false,
      };

      await actionHandler.call(mockCommand, buildOptions, mockCommand);

      expect(mockExit).toHaveBeenCalledWith(1);
      mockExit.mockRestore();
    });
  });

  describe("addGenerateCommands", () => {
    it("should configure all generate commands", () => {
      commandBuilder.addGenerateCommands(mockInitializeCLI);

      expect(mockProgram.command).toHaveBeenCalledWith("generate");
      expect(mockProgram.command).toHaveBeenCalledWith("generate:block");
      expect(mockProgram.command).toHaveBeenCalledWith("generate:model");
    });

    it("should handle generate command execution", async () => {
      commandBuilder.addGenerateCommands(mockInitializeCLI);

      // Find the generate command action
      const generateCall = mockCommand.action.mock.calls.find(
        (_: unknown, index: number) => {
          return (
            mockProgram.command.mock.calls[index] &&
            mockProgram.command.mock.calls[index][0] === "generate"
          );
        },
      );

      expect(generateCall).toBeDefined();

      if (!generateCall) {
        throw new Error("Expected generate command to be defined.");
      }

      const actionHandler = generateCall[0];

      await actionHandler.call(mockCommand, {}, mockCommand);

      expect(mockInitializeCLI).toHaveBeenCalled();
      expect(mockCLI.generate).toHaveBeenCalledWith();
    });

    it("should pass custom config path to generate command", async () => {
      const customConfigPath = "/test/fixtures/generate-config.js";
      const customCommandBuilder = new CommandBuilder(
        "1.0.0",
        customConfigPath,
      );
      customCommandBuilder.addGenerateCommands(mockInitializeCLI);

      // Find the generate command action
      const generateCall = mockCommand.action.mock.calls.find(
        (_: unknown, index: number) => {
          return (
            mockProgram.command.mock.calls[index] &&
            mockProgram.command.mock.calls[index][0] === "generate"
          );
        },
      );

      expect(generateCall).toBeDefined();

      if (!generateCall) {
        throw new Error("Expected generate command to be defined.");
      }

      const actionHandler = generateCall[0];

      await actionHandler.call(mockCommand, {}, mockCommand);

      expect(mockInitializeCLI).toHaveBeenCalledWith(
        {
          debug: false,
          verbose: false,
          quiet: false,
          cache: true,
        },
        customConfigPath,
      );
    });

    it("should handle generate:block command execution", async () => {
      commandBuilder.addGenerateCommands(mockInitializeCLI);

      // Find the generate:block command action
      const blockCall = mockCommand.action.mock.calls.find(
        (_: unknown, index: number) => {
          return (
            mockProgram.command.mock.calls[index] &&
            mockProgram.command.mock.calls[index][0] === "generate:block"
          );
        },
      );

      expect(blockCall).toBeDefined();

      if (!blockCall) {
        throw new Error("Expected generate:block command to be defined.");
      }

      const actionHandler = blockCall[0];

      await actionHandler.call(mockCommand, {}, mockCommand);

      expect(mockInitializeCLI).toHaveBeenCalled();
      expect(mockCLI.generate).toHaveBeenCalledWith("block");
    });

    it("should handle generate:model command execution", async () => {
      commandBuilder.addGenerateCommands(mockInitializeCLI);

      // Find the generate:model command action
      const modelCall = mockCommand.action.mock.calls.find(
        (_: unknown, index: number) => {
          return (
            mockProgram.command.mock.calls[index] &&
            mockProgram.command.mock.calls[index][0] === "generate:model"
          );
        },
      );

      expect(modelCall).toBeDefined();
      if (!modelCall) {
        throw new Error("Expected generate:model command to be defined.");
      }

      const actionHandler = modelCall[0];

      await actionHandler.call(mockCommand, {}, mockCommand);

      expect(mockInitializeCLI).toHaveBeenCalled();
      expect(mockCLI.generate).toHaveBeenCalledWith("model");
    });

    it("should handle generate command errors", async () => {
      const mockError = new Error("Generation failed");
      mockCLI.generate.mockRejectedValue(mockError);

      const mockExit = jest
        .spyOn(process, "exit")
        .mockImplementation(((_code?: number) => {}) as never);
      commandBuilder.addGenerateCommands(mockInitializeCLI);

      const generateCall = mockCommand.action.mock.calls.find(
        (_: unknown, index: number) => {
          return (
            mockProgram.command.mock.calls[index] &&
            mockProgram.command.mock.calls[index][0] === "generate"
          );
        },
      );

      if (!generateCall) {
        throw new Error("Expected generate command to be defined.");
      }

      const actionHandler = generateCall[0];

      await actionHandler.call(mockCommand, {}, mockCommand);

      expect(mockExit).toHaveBeenCalledWith(1);
      mockExit.mockRestore();
    });
  });

  describe("addClearCacheCommand", () => {
    it("should configure clear cache command", () => {
      commandBuilder.addClearCacheCommand(mockInitializeCLI);

      expect(mockProgram.command).toHaveBeenCalledWith("clear-cache");
      expect(mockCommand.description).toHaveBeenCalledWith("Clear all caches");
      expect(mockCommand.action).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should handle clear cache command execution", async () => {
      commandBuilder.addClearCacheCommand(mockInitializeCLI);

      if (!mockCommand.action?.mock?.calls?.[0]) {
        throw new Error(
          "Expected mockCommand.action to have been called at least once.",
        );
      }

      const actionHandler = mockCommand.action.mock.calls[0][0];
      await actionHandler.call(mockCommand, {}, mockCommand);

      expect(mockInitializeCLI).toHaveBeenCalled();
      expect(mockCLI.clearCache).toHaveBeenCalled();
    });

    it("should pass custom config path to clear cache command", async () => {
      const customConfigPath = "/test/fixtures/cache-config.js";
      const customCommandBuilder = new CommandBuilder(
        "1.0.0",
        customConfigPath,
      );
      customCommandBuilder.addClearCacheCommand(mockInitializeCLI);

      if (!mockCommand.action?.mock?.calls?.[0]) {
        throw new Error(
          "Expected mockCommand.action to have been called at least once.",
        );
      }

      const actionHandler = mockCommand.action.mock.calls[0][0];
      await actionHandler.call(mockCommand, {}, mockCommand);

      expect(mockInitializeCLI).toHaveBeenCalledWith(
        {
          debug: false,
          verbose: false,
          quiet: false,
          cache: true,
        },
        customConfigPath,
      );
      expect(mockCLI.clearCache).toHaveBeenCalled();
    });

    it("should handle clear cache command errors", async () => {
      const mockError = new Error("Cache clear failed");
      mockCLI.clearCache.mockRejectedValue(mockError);

      const mockExit = jest
        .spyOn(process, "exit")
        .mockImplementation(((_code?: number) => {}) as never);
      commandBuilder.addClearCacheCommand(mockInitializeCLI);

      if (!mockCommand.action?.mock?.calls?.[0]) {
        throw new Error(
          "Expected mockCommand.action to have been called at least once.",
        );
      }

      const actionHandler = mockCommand.action.mock.calls[0][0];
      await actionHandler.call(mockCommand, {}, mockCommand);

      expect(mockExit).toHaveBeenCalledWith(1);
      mockExit.mockRestore();
    });
  });

  describe("parse", () => {
    it("should parse command line arguments", async () => {
      const argv = ["node", "cli.js", "build"];

      await commandBuilder.parse(argv);

      expect(mockProgram.parseAsync).toHaveBeenCalledWith(argv);
    });
  });

  describe("determineConcurrency", () => {
    beforeEach(() => {
      // Access private method through any for testing
      commandBuilder = commandBuilder as any;
    });

    it("should return auto-determined concurrency", () => {
      const options: BuildOptions = {
        skipDeletion: false,
        skipDeletionConfirmation: false,
        autoConcurrency: true,
      };

      const result = (commandBuilder as any).determineConcurrency(options);

      // Should return a positive number (actual CPU count - 1, minimum 1)
      expect(result).toBeGreaterThanOrEqual(1);
      expect(typeof result).toBe("number");
    });

    it("should return default concurrent level", () => {
      const options: BuildOptions = {
        skipDeletion: false,
        skipDeletionConfirmation: false,
        concurrent: true,
      };

      const result = (commandBuilder as any).determineConcurrency(options);

      expect(result).toBe(3);
    });

    it("should return specific concurrency", () => {
      const options: BuildOptions = {
        skipDeletion: false,
        skipDeletionConfirmation: false,
        concurrency: 8,
      };

      const result = (commandBuilder as any).determineConcurrency(options);

      expect(result).toBe(8);
    });

    it("should return sequential default", () => {
      const options: BuildOptions = {
        skipDeletion: false,
        skipDeletionConfirmation: false,
      };

      const result = (commandBuilder as any).determineConcurrency(options);

      expect(result).toBe(1);
    });

    it("should handle minimum concurrency with auto-determination", () => {
      const options: BuildOptions = {
        skipDeletion: false,
        skipDeletionConfirmation: false,
        autoConcurrency: true,
      };

      const result = (commandBuilder as any).determineConcurrency(options);

      // Auto-determined concurrency should always be at least 1
      expect(result).toBeGreaterThanOrEqual(1);
      expect(typeof result).toBe("number");
    });
  });

  describe("extractGlobalOptions", () => {
    it("should extract global options correctly", () => {
      mockCommand.optsWithGlobals.mockReturnValue({
        debug: true,
        verbose: false,
        quiet: false,
        cache: true,
        // Additional non-global options
        skipDeletion: true,
        concurrency: 5,
      });

      const result = (commandBuilder as any).extractGlobalOptions(mockCommand);

      expect(result).toEqual({
        debug: true,
        verbose: false,
        quiet: false,
        cache: true,
      });
    });

    it("should handle boolean conversion", () => {
      mockCommand.optsWithGlobals.mockReturnValue({
        debug: "true", // String that should be converted to boolean
        verbose: undefined,
        quiet: null,
        cache: 1,
      });

      const result = (commandBuilder as any).extractGlobalOptions(mockCommand);

      expect(result).toEqual({
        debug: true,
        verbose: false,
        quiet: false,
        cache: true,
      });
    });
  });
});
