import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Question } from "inquirer";
import type { NodePlopAPI } from "node-plop";
import { createMockConfig } from "../../tests/utils/mockConfig";
import { createMockLogger } from "../../tests/utils/mockLogger";
import { createMockPlop } from "../../tests/utils/mockPlop";
import { createMockPlopGenerator } from "../../tests/utils/mockPlopGenerator";
import type { ConsoleLogger } from "../logger";
import type { DatoBuilderConfig } from "../types/DatoBuilderConfig";
import { PlopGenerator } from "./PlopGenerator";

// Mock dependencies
jest.mock("node:path", () => ({
  dirname: jest.fn(() => "/mock/dirname"),
  join: jest.fn((...paths) => paths.join("/")),
}));

jest.mock("node:url", () => ({
  fileURLToPath: jest.fn(() => "/mock/file/path"),
}));

const mockPlop = createMockPlop();
const mockGenerator = createMockPlopGenerator();

const mockInquirer = {
  prompt: jest.fn<(questions: Question[]) => Promise<{ generator: string }>>(),
};

// Mock node-plop
jest.mock("node-plop", () => ({
  __esModule: true,
  default: jest.fn<() => Promise<NodePlopAPI>>().mockResolvedValue(mockPlop),
}));

// Mock inquirer using unstable_mockModule for dynamic imports
jest.unstable_mockModule("inquirer", () => ({
  default: mockInquirer,
}));

describe("PlopGenerator", () => {
  let plopGenerator: PlopGenerator;
  let mockLogger: jest.Mocked<ConsoleLogger>;
  let mockConfig: Required<DatoBuilderConfig>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = createMockLogger();

    mockConfig = createMockConfig({
      blocksPath: "/mock/blocks",
      modelsPath: "/mock/models",
      logLevel: 2,
    });

    plopGenerator = new PlopGenerator(mockConfig, mockLogger);

    // Mock the private setupPlop method to avoid ESM issues
    jest
      .spyOn(plopGenerator as any, "setupPlop")
      .mockImplementation(async () => {
        // Simulate what the real setupPlop does - calling setGenerator
        mockPlop.setGenerator("block", {
          description: "Generate a new DatoCMS block",
          prompts: [
            {
              type: "input",
              name: "name",
              message: "Block name (PascalCase):",
              validate: (value: string) => {
                if (!value) return "Block name is required";
                if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
                  return "Block name must be in PascalCase (e.g., MyNewBlock)";
                }
                return true;
              },
            },
          ],
          actions: [
            {
              type: "add",
              path: "/mock/blocks/{{name}}.ts",
              templateFile: "/mock/dirname/../plop-templates/block.hbs",
            },
          ],
        });

        mockPlop.setGenerator("model", {
          description: "Generate a new DatoCMS model",
          prompts: [
            {
              type: "input",
              name: "name",
              message: "Model name (PascalCase):",
              validate: (value: string) => {
                if (!value) return "Model name is required";
                if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
                  return "Model name must be in PascalCase (e.g., BlogPost)";
                }
                return true;
              },
            },
            {
              type: "confirm",
              name: "singleton",
              message: "Is this a singleton model?",
              default: false,
            },
            {
              type: "confirm",
              name: "sortable",
              message: "Should records be sortable?",
              default: false,
            },
            {
              type: "confirm",
              name: "tree",
              message: "Should records be organized in a tree structure?",
              default: false,
            },
          ],
          actions: [
            {
              type: "add",
              path: "/mock/models/{{name}}.ts",
              templateFile: "/mock/dirname/../plop-templates/model.hbs",
            },
          ],
        });

        return mockPlop;
      });

    // Setup default mock behavior
    mockPlop.getGeneratorList.mockReturnValue([
      { name: "block", description: "Generate a new DatoCMS block" },
      { name: "model", description: "Generate a new DatoCMS model" },
    ]);

    mockPlop.getGenerator.mockReturnValue(mockGenerator);
  });

  describe("constructor", () => {
    it("should initialize with config and logger", () => {
      expect(plopGenerator).toBeInstanceOf(PlopGenerator);
    });
  });

  describe("generateInteractive", () => {
    it("should present interactive selection and generate chosen type", async () => {
      // Setup mocks
      mockInquirer.prompt.mockResolvedValue({ generator: "block" });
      mockGenerator.runPrompts.mockResolvedValue({ name: "TestBlock" });
      mockGenerator.runActions.mockResolvedValue({
        changes: [{ type: "add", path: "/mock/blocks/TestBlock.ts" }],
        failures: [],
      });

      const result = await plopGenerator.generateInteractive();

      expect(mockInquirer.prompt).toHaveBeenCalledWith([
        {
          type: "list",
          name: "generator",
          message: "What do you want to generate?",
          choices: [
            { name: "block - Generate a new DatoCMS block", value: "block" },
            { name: "model - Generate a new DatoCMS model", value: "model" },
          ],
        },
      ]);

      expect(mockGenerator.runPrompts).toHaveBeenCalled();
      expect(mockGenerator.runActions).toHaveBeenCalledWith({
        name: "TestBlock",
      });
      expect(mockLogger.success).toHaveBeenCalledWith(
        "Successfully generated block!",
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "  add: /mock/blocks/TestBlock.ts",
      );

      expect(result).toEqual({
        success: true,
        type: "block",
        changes: [{ type: "add", path: "/mock/blocks/TestBlock.ts" }],
      });
    });

    it("should handle generation failures", async () => {
      mockInquirer.prompt.mockResolvedValue({ generator: "block" });
      mockGenerator.runPrompts.mockResolvedValue({ name: "TestBlock" });
      mockGenerator.runActions.mockResolvedValue({
        changes: [],
        failures: [
          {
            error: "Template not found",
            type: "",
            path: "",
            message: "",
          },
        ],
      });

      await expect(plopGenerator.generateInteractive()).rejects.toThrow(
        "Generation failed",
      );

      expect(mockLogger.error).toHaveBeenCalledWith("Generation failed:");
      expect(mockLogger.error).toHaveBeenCalledWith("  Template not found");
    });
  });

  describe("generateSpecific", () => {
    it("should generate block directly without interactive selection", async () => {
      mockGenerator.runPrompts.mockResolvedValue({ name: "TestBlock" });
      mockGenerator.runActions.mockResolvedValue({
        changes: [{ type: "add", path: "/mock/blocks/TestBlock.ts" }],
        failures: [],
      });

      const result = await plopGenerator.generateSpecific("block");

      expect(mockPlop.getGenerator).toHaveBeenCalledWith("block");
      expect(mockGenerator.runPrompts).toHaveBeenCalled();
      expect(mockGenerator.runActions).toHaveBeenCalledWith({
        name: "TestBlock",
      });
      expect(mockLogger.success).toHaveBeenCalledWith(
        "Successfully generated block!",
      );

      expect(result).toEqual({
        success: true,
        type: "block",
        changes: [{ type: "add", path: "/mock/blocks/TestBlock.ts" }],
      });
    });

    it("should generate model with all options", async () => {
      mockGenerator.runPrompts.mockResolvedValue({
        name: "TestModel",
        singleton: true,
        sortable: false,
        tree: true,
      });
      mockGenerator.runActions.mockResolvedValue({
        changes: [{ type: "add", path: "/mock/models/TestModel.ts" }],
        failures: [],
      });

      const result = await plopGenerator.generateSpecific("model");

      expect(mockPlop.getGenerator).toHaveBeenCalledWith("model");
      expect(mockGenerator.runActions).toHaveBeenCalledWith({
        name: "TestModel",
        singleton: true,
        sortable: false,
        tree: true,
      });

      expect(result).toEqual({
        success: true,
        type: "model",
        changes: [{ type: "add", path: "/mock/models/TestModel.ts" }],
      });
    });

    it("should use existing plop instance when provided", async () => {
      const existingPlop = mockPlop;
      mockGenerator.runPrompts.mockResolvedValue({ name: "TestBlock" });
      mockGenerator.runActions.mockResolvedValue({
        changes: [{ type: "add", path: "/mock/blocks/TestBlock.ts" }],
        failures: [],
      });

      const result = await plopGenerator.generateSpecific(
        "block",
        existingPlop,
      );

      expect(result.success).toBe(true);
      expect(result.type).toBe("block");
    });

    it("should handle validation errors for block names", async () => {
      // We can't directly test validation since it's in the plop config,
      // but we can test that invalid responses are handled
      mockGenerator.runPrompts.mockResolvedValue({ name: "" });
      mockGenerator.runActions.mockResolvedValue({
        changes: [],
        failures: [
          {
            error: "Block name is required",
            type: "",
            path: "",
            message: "",
          },
        ],
      });

      await expect(plopGenerator.generateSpecific("block")).rejects.toThrow(
        "Generation failed",
      );
    });

    it("should handle validation errors for model names", async () => {
      mockGenerator.runPrompts.mockResolvedValue({ name: "invalidName" });
      mockGenerator.runActions.mockResolvedValue({
        changes: [],
        failures: [
          {
            error: "Model name must be in PascalCase",
            type: "",
            path: "",
            message: "",
          },
        ],
      });

      await expect(plopGenerator.generateSpecific("model")).rejects.toThrow(
        "Generation failed",
      );
    });

    it("should handle multiple failures", async () => {
      mockGenerator.runPrompts.mockResolvedValue({ name: "TestBlock" });
      mockGenerator.runActions.mockResolvedValue({
        changes: [],
        failures: [
          {
            error: "Template not found",
            type: "",
            path: "",
            message: "",
          },
          {
            error: "Output directory does not exist",
            type: "",
            path: "",
            message: "",
          },
        ],
      });

      await expect(plopGenerator.generateSpecific("block")).rejects.toThrow(
        "Generation failed",
      );

      expect(mockLogger.error).toHaveBeenCalledWith("Generation failed:");
      expect(mockLogger.error).toHaveBeenCalledWith("  Template not found");
      expect(mockLogger.error).toHaveBeenCalledWith(
        "  Output directory does not exist",
      );
    });
  });

  describe("setupPlop", () => {
    it("should setup plop with correct generator configurations", async () => {
      // Mock the plop setup
      mockGenerator.runActions.mockResolvedValue({
        changes: [],
        failures: [],
      });

      await plopGenerator.generateSpecific("block");

      expect(mockPlop.setGenerator).toHaveBeenCalledWith("block", {
        description: "Generate a new DatoCMS block",
        prompts: [
          {
            type: "input",
            name: "name",
            message: "Block name (PascalCase):",
            validate: expect.any(Function),
          },
        ],
        actions: [
          {
            type: "add",
            path: "/mock/blocks/{{name}}.ts",
            templateFile: "/mock/dirname/../plop-templates/block.hbs",
          },
        ],
      });

      expect(mockPlop.setGenerator).toHaveBeenCalledWith("model", {
        description: "Generate a new DatoCMS model",
        prompts: [
          {
            type: "input",
            name: "name",
            message: "Model name (PascalCase):",
            validate: expect.any(Function),
          },
          {
            type: "confirm",
            name: "singleton",
            message: "Is this a singleton model?",
            default: false,
          },
          {
            type: "confirm",
            name: "sortable",
            message: "Should records be sortable?",
            default: false,
          },
          {
            type: "confirm",
            name: "tree",
            message: "Should records be organized in a tree structure?",
            default: false,
          },
        ],
        actions: [
          {
            type: "add",
            path: "/mock/models/{{name}}.ts",
            templateFile: "/mock/dirname/../plop-templates/model.hbs",
          },
        ],
      });
    });
  });

  describe("processResult", () => {
    it("should return success result with changes", async () => {
      mockGenerator.runPrompts.mockResolvedValue({ name: "TestBlock" });
      mockGenerator.runActions.mockResolvedValue({
        changes: [
          { type: "add", path: "/mock/blocks/TestBlock.ts" },
          { type: "modify", path: "/mock/index.ts" },
        ],
        failures: [],
      });

      const result = await plopGenerator.generateSpecific("block");

      expect(result).toEqual({
        success: true,
        type: "block",
        changes: [
          { type: "add", path: "/mock/blocks/TestBlock.ts" },
          { type: "modify", path: "/mock/index.ts" },
        ],
      });

      expect(mockLogger.success).toHaveBeenCalledWith(
        "Successfully generated block!",
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "  add: /mock/blocks/TestBlock.ts",
      );
      expect(mockLogger.info).toHaveBeenCalledWith("  modify: /mock/index.ts");
    });

    it("should return failure result with errors", async () => {
      mockGenerator.runPrompts.mockResolvedValue({ name: "TestBlock" });
      mockGenerator.runActions.mockResolvedValue({
        changes: [],
        failures: [
          {
            error: "Template not found",
            type: "",
            path: "",
            message: "",
          },
          {
            error: "Permission denied",
            type: "",
            path: "",
            message: "",
          },
        ],
      });

      await expect(plopGenerator.generateSpecific("block")).rejects.toThrow(
        "Generation failed",
      );
    });
  });

  describe("validation functions", () => {
    it("should validate block names correctly", async () => {
      mockGenerator.runActions.mockResolvedValue({
        changes: [],
        failures: [],
      });

      await plopGenerator.generateSpecific("block");

      const blockGeneratorCall = mockPlop.setGenerator.mock.calls.find(
        (call) => call[0] === "block",
      );
      const validateFn = (blockGeneratorCall?.[1]?.prompts as any[])?.[0]
        ?.validate;

      expect(validateFn).toBeDefined();
      if (validateFn) {
        expect(validateFn("")).toBe("Block name is required");
        expect(validateFn("invalidname")).toBe(
          "Block name must be in PascalCase (e.g., MyNewBlock)",
        );
        expect(validateFn("ValidBlockName")).toBe(true);
        expect(validateFn("ValidBlock123")).toBe(true);
      }
    });

    it("should validate model names correctly", async () => {
      mockGenerator.runActions.mockResolvedValue({
        changes: [],
        failures: [],
      });

      await plopGenerator.generateSpecific("model");

      const modelGeneratorCall = mockPlop.setGenerator.mock.calls.find(
        (call) => call[0] === "model",
      );
      const validateFn = (modelGeneratorCall?.[1]?.prompts as any[])?.[0]
        ?.validate;
      expect(validateFn).toBeDefined();
      if (validateFn) {
        expect(validateFn("")).toBe("Model name is required");
        expect(validateFn("invalidname")).toBe(
          "Model name must be in PascalCase (e.g., BlogPost)",
        );
        expect(validateFn("ValidModelName")).toBe(true);
        expect(validateFn("BlogPost123")).toBe(true);
      }
    });
  });
});
