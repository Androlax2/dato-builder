import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { createMockConfig } from "../../tests/utils/mockConfig";
import { createMockLogger } from "../../tests/utils/mockLogger";
import type { ConsoleLogger } from "../logger";
import type { DatoBuilderConfig } from "../types/DatoBuilderConfig";
import { PlopGenerator } from "./PlopGenerator";

// Mock inquirer to provide automatic answers for prompts
const mockInquirer = {
  prompt: jest.fn(),
};

jest.unstable_mockModule("inquirer", () => ({
  default: mockInquirer,
}));

describe("Generated Files Quality", () => {
  let mockConfig: Required<DatoBuilderConfig>;
  let mockLogger: jest.Mocked<ConsoleLogger>;
  let tempDir: string;
  let plopGenerator: PlopGenerator;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create temp directory for testing
    tempDir = resolve(process.cwd(), "temp-test-generated");
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    mkdirSync(tempDir, { recursive: true });

    mockLogger = createMockLogger();
    mockConfig = createMockConfig({
      blocksPath: resolve(tempDir, "blocks"),
      modelsPath: resolve(tempDir, "models"),
      logLevel: 2,
    });

    // Create directories
    mkdirSync(mockConfig.blocksPath, { recursive: true });
    mkdirSync(mockConfig.modelsPath, { recursive: true });

    plopGenerator = new PlopGenerator(mockConfig, mockLogger);
  });

  afterEach(() => {
    // Cleanup temp directory
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("Block File Generation", () => {
    it("should generate valid TypeScript block files using real Plop", async () => {
      // Use the real plop generator by accessing it directly
      const plop = await (plopGenerator as any).setupPlop();
      const blockGenerator = plop.getGenerator("block");

      // Run actions with predefined answers (bypass prompts)
      const answers = { name: "TestBlock" };
      const actionResult = await blockGenerator.runActions(answers);

      // Process the result manually
      const result = (plopGenerator as any).processResult(
        actionResult,
        "block",
      );

      expect(result.success).toBe(true);
      expect(result.type).toBe("block");
      expect(result.changes).toHaveLength(1);

      const generatedPath = result.changes[0]?.path;

      if (!generatedPath) {
        throw new Error("No file path returned from generation");
      }

      // Check if file was created in the expected location (config path)
      const expectedPath = join(mockConfig.blocksPath, "TestBlock.ts");

      // The file should have been created by the real Plop generator
      expect(existsSync(expectedPath)).toBe(true);

      const content = readFileSync(expectedPath, "utf-8");

      // Validate file structure
      expect(content).toContain(
        'import { BlockBuilder, type BuilderContext } from "dato-builder"',
      );
      expect(content).toContain("export default function buildTestBlock");
      expect(content).toContain("({ config }: BuilderContext)");
      expect(content).toContain("return new BlockBuilder({");
      expect(content).toContain('name: "Test Block"');
      expect(content).toContain("config,");

      // Validate no template artifacts
      expect(content).not.toContain("{{");
      expect(content).not.toContain("}}");
    });
  });

  describe("Model File Generation", () => {
    it("should generate valid TypeScript model files using real Plop", async () => {
      // Use the real plop generator by accessing it directly
      const plop = await (plopGenerator as any).setupPlop();
      const modelGenerator = plop.getGenerator("model");

      // Run actions with predefined answers (bypass prompts)
      const answers = {
        name: "TestModel",
        singleton: true,
        sortable: false,
        tree: false,
      };
      const actionResult = await modelGenerator.runActions(answers);

      // Process the result manually
      const result = (plopGenerator as any).processResult(
        actionResult,
        "model",
      );

      expect(result.success).toBe(true);
      expect(result.type).toBe("model");
      expect(result.changes).toHaveLength(1);

      const generatedPath = result.changes[0]?.path;

      if (!generatedPath) {
        throw new Error("No file path returned from generation");
      }

      // Check if file was created in the expected location (config path)
      const expectedPath = join(mockConfig.modelsPath, "TestModel.ts");

      // The file should have been created by the real Plop generator
      expect(existsSync(expectedPath)).toBe(true);

      const content = readFileSync(expectedPath, "utf-8");

      // Validate file structure
      expect(content).toContain(
        'import { ModelBuilder, type BuilderContext } from "dato-builder"',
      );
      expect(content).toContain("export default function buildTestModel");
      expect(content).toContain("({ config }: BuilderContext)");
      expect(content).toContain("return new ModelBuilder({");
      expect(content).toContain('name: "Test Model"');
      expect(content).toContain("config,");
      expect(content).toContain("singleton: true,");

      // Validate no template artifacts
      expect(content).not.toContain("{{");
      expect(content).not.toContain("}}");
    });
  });
});
