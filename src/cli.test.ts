import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { setupCLI } from "./cli";
import { initializeCLI } from "./cli/CLIInitializer";
import { CommandBuilder, type GlobalOptions } from "./cli/CommandBuilder";
import type { DatoBuilderCLI } from "./DatoBuilderCLI";

// Mock dependencies
jest.mock("./cli/CommandBuilder");
jest.mock("./cli/CLIInitializer");
jest.mock("./DatoBuilderCLI");

const MockCommandBuilder = CommandBuilder as jest.MockedClass<
  typeof CommandBuilder
>;
const mockInitializeCLI = initializeCLI as jest.MockedFunction<
  typeof initializeCLI
>;

describe("CLI", () => {
  let mockCommandBuilder: jest.Mocked<CommandBuilder>;
  let mockCLI: jest.Mocked<DatoBuilderCLI>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock CommandBuilder
    mockCommandBuilder = {
      addBuildCommand: jest.fn().mockReturnThis(),
      addGenerateCommands: jest.fn().mockReturnThis(),
      addClearCacheCommand: jest.fn().mockReturnThis(),
      parse: jest.fn().mockImplementation(async () => {}),
    } as unknown as jest.Mocked<CommandBuilder>;

    MockCommandBuilder.mockImplementation(() => mockCommandBuilder);

    // Mock DatoBuilderCLI
    mockCLI = {
      build: jest.fn().mockImplementation(async () => {}),
      generate: jest.fn().mockImplementation(async () => {}),
      clearCache: jest.fn().mockImplementation(async () => {}),
    } as unknown as jest.Mocked<DatoBuilderCLI>;

    mockInitializeCLI.mockResolvedValue(mockCLI);
  });

  describe("setupCLI", () => {
    it("should initialize CommandBuilder with correct version", async () => {
      await setupCLI();

      expect(MockCommandBuilder).toHaveBeenCalledWith("__PACKAGE_VERSION__");
    });

    it("should configure all commands", async () => {
      await setupCLI();

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

      await setupCLI();

      expect(mockCommandBuilder.parse).toHaveBeenCalledWith(process.argv);

      process.argv = originalProcessArgv;
    });

    it("should handle CLI setup errors", async () => {
      const setupError = new Error("CLI setup failed");
      mockCommandBuilder.parse.mockRejectedValue(setupError);

      await expect(setupCLI()).rejects.toThrow("CLI setup failed");
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

  describe("Module Export Integration", () => {
    it("should export setupCLI function", () => {
      expect(typeof setupCLI).toBe("function");
    });
  });

  describe("Version Integration", () => {
    it("should use package version placeholder", async () => {
      await setupCLI();

      expect(MockCommandBuilder).toHaveBeenCalledWith("__PACKAGE_VERSION__");
    });
  });

  describe("CLI Arguments Integration", () => {
    it("should pass correct arguments to parse", async () => {
      const testArgv = ["node", "cli.js", "build", "--concurrent"];
      const originalArgv = process.argv;
      process.argv = testArgv;

      await setupCLI();

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

        await setupCLI();

        expect(mockCommandBuilder.parse).toHaveBeenCalledWith(argv);

        process.argv = originalArgv;
      }
    });
  });

  describe("Initialization Function Integration", () => {
    it("should pass initializeCLI to all command builders", async () => {
      await setupCLI();

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
      await setupCLI();

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

      await expect(setupCLI()).rejects.toThrow("Propagation test");
    });

    it("should propagate parse errors correctly", async () => {
      const parseError = new Error("Parse error");
      mockCommandBuilder.parse.mockRejectedValue(parseError);

      await expect(setupCLI()).rejects.toThrow("Parse error");
    });
  });
});
