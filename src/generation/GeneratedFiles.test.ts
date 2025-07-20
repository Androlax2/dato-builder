import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import type { NodePlopAPI } from "node-plop";
import { createMockConfig } from "../../tests/utils/mockConfig";
import { createMockLogger } from "../../tests/utils/mockLogger";
import { createMockPlop } from "../../tests/utils/mockPlop";
import { createMockPlopGenerator } from "../../tests/utils/mockPlopGenerator";
import type { ConsoleLogger } from "../logger";
import type { DatoBuilderConfig } from "../types/DatoBuilderConfig";
import { PlopGenerator } from "./PlopGenerator";

// Mock node-plop and inquirer using ESM approach
const mockPlop = createMockPlop();
const mockGenerator = createMockPlopGenerator();

const mockInquirer = {
  prompt: jest.fn(),
};

jest.mock("node-plop", () => ({
  __esModule: true,
  default: jest.fn<() => Promise<NodePlopAPI>>().mockResolvedValue(mockPlop),
}));

// Mock inquirer using unstable_mockModule for ESM compatibility
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
      blocksPath: join(tempDir, "blocks"),
      modelsPath: join(tempDir, "models"),
      logLevel: 2,
    });

    // Create directories
    mkdirSync(mockConfig.blocksPath, { recursive: true });
    mkdirSync(mockConfig.modelsPath, { recursive: true });

    plopGenerator = new PlopGenerator(mockConfig, mockLogger);

    // Mock the private setupPlop method to avoid ESM issues
    jest
      .spyOn(plopGenerator as any, "setupPlop")
      .mockImplementation(async () => {
        return mockPlop;
      });

    // Setup plop mocks
    mockPlop.getGenerator.mockReturnValue(mockGenerator);
    mockPlop.getGeneratorList.mockReturnValue([
      { name: "block", description: "Generate a new DatoCMS block" },
      { name: "model", description: "Generate a new DatoCMS model" },
    ]);
  });

  afterEach(() => {
    // Cleanup temp directory
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("Block File Generation", () => {
    it("should generate valid TypeScript block files using Plop", async () => {
      // Setup mock to generate actual file
      const blockPath = join(mockConfig.blocksPath, "TestBlock.ts");
      const blockContent = `import { BlockBuilder, type BuilderContext } from "dato-builder";

export default function buildTestBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Test Block",
    config,
  })
    // Add your fields here
    // Example: .addText({ label: "Title" });
}`;

      mockGenerator.runPrompts.mockResolvedValue({ name: "TestBlock" });
      mockGenerator.runActions.mockImplementation(async () => {
        // Actually create the file to simulate plop behavior
        writeFileSync(blockPath, blockContent);
        return {
          changes: [{ type: "add", path: blockPath }],
          failures: [],
        };
      });

      // Generate actual block file using PlopGenerator
      const result = await plopGenerator.generateSpecific("block");

      expect(result.success).toBe(true);
      expect(result.type).toBe("block");
      expect(result.changes).toHaveLength(1);

      const generatedPath = result.changes[0]?.path;

      if (!generatedPath) {
        throw new Error("No file path returned from generation");
      }

      // Add a small delay to ensure file system operation completes
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(existsSync(generatedPath)).toBe(true);

      const content = readFileSync(generatedPath, "utf-8");

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
    it("should generate valid TypeScript model files using Plop", async () => {
      // Setup mock to generate actual file
      const modelPath = join(mockConfig.modelsPath, "TestModel.ts");
      const modelContent = `import { ModelBuilder, type BuilderContext } from "dato-builder";

export default function buildTestModel({ config }: BuilderContext) {
  return new ModelBuilder({
    name: "Test Model",
    config,
    body: {
      singleton: true,
      sortable: false,
    },
  })
    // Add your fields here
    // Example: .addText({ label: "Title" });
}`;

      mockGenerator.runPrompts.mockResolvedValue({
        name: "TestModel",
        singleton: true,
        sortable: false,
        tree: false,
      });
      mockGenerator.runActions.mockImplementation(async () => {
        // Actually create the file to simulate plop behavior
        writeFileSync(modelPath, modelContent);
        return {
          changes: [{ type: "add", path: modelPath }],
          failures: [],
        };
      });

      // Generate actual model file using PlopGenerator
      const result = await plopGenerator.generateSpecific("model");

      expect(result.success).toBe(true);
      expect(result.type).toBe("model");
      expect(result.changes).toHaveLength(1);

      const generatedPath = result.changes[0]?.path;

      if (!generatedPath) {
        throw new Error("No file path returned from generation");
      }

      // Add a small delay to ensure file system operation completes
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(existsSync(generatedPath)).toBe(true);

      const content = readFileSync(generatedPath, "utf-8");

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
