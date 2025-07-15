import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Options } from "prettier";
import { FieldGeneratorFactory } from "@/FileGeneration/FieldGenerators/FieldGeneratorFactory";
import {
  FileGenerator,
  type FileGeneratorConfig,
} from "@/FileGeneration/FileGenerator";
import { BlockReferenceAnalyzer } from "@/FileGeneration/FileGenerators/BlockReferenceAnalyzer";
import { BuilderConfigGenerator } from "@/FileGeneration/FileGenerators/BuilderConfigGenerator";
import { FieldMethodGenerator } from "@/FileGeneration/FileGenerators/FieldMethodGenerator";
import { FunctionGenerator } from "@/FileGeneration/FileGenerators/FunctionGenerator";
import { CodeFormatter } from "@/FileGeneration/FileGenerators/formatters/CodeFormatter";
import { ImportGenerator } from "@/FileGeneration/FileGenerators/ImportGenerator";

// Mock all dependencies
jest.mock("@/FileGeneration/FieldGenerators/FieldGeneratorFactory");
jest.mock("@/FileGeneration/FileGenerators/BlockReferenceAnalyzer");
jest.mock("@/FileGeneration/FileGenerators/BuilderConfigGenerator");
jest.mock("@/FileGeneration/FileGenerators/FieldMethodGenerator");
jest.mock("@/FileGeneration/FileGenerators/formatters/CodeFormatter");
jest.mock("@/FileGeneration/FileGenerators/ImportGenerator");
jest.mock("@/FileGeneration/FileGenerators/FunctionGenerator");
jest.mock("@/utils/utils", () => ({
  toPascalCase: jest.fn((str: string) => `Pascal${str.replace(/\s+/g, "")}`),
}));

const MockedFieldGeneratorFactory = FieldGeneratorFactory as jest.MockedClass<
  typeof FieldGeneratorFactory
>;
const MockedBlockReferenceAnalyzer = BlockReferenceAnalyzer as jest.MockedClass<
  typeof BlockReferenceAnalyzer
>;
const MockedBuildConfigGenerator = BuilderConfigGenerator as jest.MockedClass<
  typeof BuilderConfigGenerator
>;
const MockedFieldMethodGenerator = FieldMethodGenerator as jest.MockedClass<
  typeof FieldMethodGenerator
>;
const MockedCodeFormatter = CodeFormatter as jest.MockedClass<
  typeof CodeFormatter
>;
const MockedImportGenerator = ImportGenerator as jest.MockedClass<
  typeof ImportGenerator
>;
const MockedFunctionGenerator = FunctionGenerator as jest.MockedClass<
  typeof FunctionGenerator
>;

describe("FileGenerator", () => {
  let mockConfig: FileGeneratorConfig;
  let mockFieldGeneratorFactory: jest.Mocked<FieldGeneratorFactory>;
  let mockBlockReferenceAnalyzer: jest.Mocked<BlockReferenceAnalyzer>;
  let mockBuilderConfigGenerator: jest.Mocked<BuilderConfigGenerator>;
  let mockFieldMethodGenerator: jest.Mocked<FieldMethodGenerator>;
  let mockCodeFormatter: jest.Mocked<CodeFormatter>;
  let mockImportGenerator: jest.Mocked<ImportGenerator>;
  let mockFunctionGenerator: jest.Mocked<FunctionGenerator>;
  let mockItemType: ItemType;
  let mockFields: Field[];
  let fileGenerator: FileGenerator;

  beforeEach(() => {
    jest.clearAllMocks();

    mockItemType = {
      id: "test-item-type-id",
      type: "item_type",
      name: "Test Block Name",
      api_key: "test_block_name",
      singleton: false,
      sortable: true,
      draft_mode_active: false,
      all_locales_required: false,
      hint: "Test hint",
      collection_appearance: "table",
      modular_block: false,
      draft_saving_active: false,
      tree: false,
      ordering_direction: null,
      ordering_field: null,
      inverse_relationships_enabled: false,
      title_field: null,
      image_preview_field: null,
      excerpt_field: null,
      workflow: null,
      has_singleton_item: false,
      name_singular: null,
      ordering_meta: null,
    } as unknown as ItemType;

    mockFields = [
      {
        id: "field-1",
        type: "field",
        label: "Test Field",
        field_type: "string",
        api_key: "test_field",
        hint: "",
        localized: false,
        validators: {},
        position: 1,
        appearance: { addons: [], editor: "single_line", parameters: {} },
        default_value: null,
        deep_filtering_enabled: false,
        item_type: { id: mockItemType.id, type: "item_type" },
        fieldset: null,
      },
    ];

    mockConfig = {
      itemType: mockItemType,
      fields: mockFields,
      type: "block",
      itemTypeReferences: new Map(),
      formatting: { printWidth: 100 } as Options,
    };

    // Set up mocks
    mockFieldGeneratorFactory = {} as any;
    mockBlockReferenceAnalyzer = {
      hasBlockReferences: jest.fn(),
    } as any;
    mockBuilderConfigGenerator = {
      generateBuilderConfig: jest.fn(),
    } as any;
    mockFieldMethodGenerator = {
      generateFieldMethods: jest.fn(),
    } as any;
    mockCodeFormatter = {
      format: jest.fn(),
    } as any;
    mockImportGenerator = {
      generateImports: jest.fn(),
    } as any;
    mockFunctionGenerator = {
      generateFunction: jest.fn(),
    } as any;

    MockedFieldGeneratorFactory.mockImplementation(
      () => mockFieldGeneratorFactory,
    );
    MockedBlockReferenceAnalyzer.mockImplementation(
      () => mockBlockReferenceAnalyzer,
    );
    MockedBuildConfigGenerator.mockImplementation(
      () => mockBuilderConfigGenerator,
    );
    MockedFieldMethodGenerator.mockImplementation(
      () => mockFieldMethodGenerator,
    );
    MockedCodeFormatter.mockImplementation(() => mockCodeFormatter);
    MockedImportGenerator.mockImplementation(() => mockImportGenerator);
    MockedFunctionGenerator.mockImplementation(() => mockFunctionGenerator);

    fileGenerator = new FileGenerator(mockConfig, mockFieldGeneratorFactory);
  });

  describe("constructor", () => {
    it("should initialize all generators with correct dependencies", () => {
      expect(MockedBlockReferenceAnalyzer).toHaveBeenCalledTimes(1);
      expect(MockedBuildConfigGenerator).toHaveBeenCalledTimes(1);
      expect(MockedFieldMethodGenerator).toHaveBeenCalledWith(
        mockFieldGeneratorFactory,
      );
      expect(MockedImportGenerator).toHaveBeenCalledTimes(1);
      expect(MockedFunctionGenerator).toHaveBeenCalledWith(
        expect.any(BuilderConfigGenerator),
        expect.any(FieldMethodGenerator),
      );
      expect(MockedCodeFormatter).toHaveBeenCalledWith(mockConfig.formatting);
    });

    it("should handle missing formatting config", () => {
      const configWithoutFormatting = { ...mockConfig };
      delete configWithoutFormatting.formatting;

      new FileGenerator(configWithoutFormatting, mockFieldGeneratorFactory);

      expect(MockedCodeFormatter).toHaveBeenCalledWith(undefined);
    });
  });

  describe("generate", () => {
    beforeEach(() => {
      mockBlockReferenceAnalyzer.hasBlockReferences.mockReturnValue(false);
      mockImportGenerator.generateImports.mockReturnValue("import statements");
      mockFunctionGenerator.generateFunction.mockReturnValue(
        "function definition",
      );
      mockCodeFormatter.format.mockResolvedValue("formatted code");
    });

    it("should generate block file with correct function name", async () => {
      const result = await fileGenerator.generate();

      expect(
        mockBlockReferenceAnalyzer.hasBlockReferences,
      ).toHaveBeenCalledWith(mockFields);
      expect(mockImportGenerator.generateImports).toHaveBeenCalledWith(
        "BlockBuilder",
      );
      expect(mockFunctionGenerator.generateFunction).toHaveBeenCalledWith(
        "PascalTestBlockName",
        "BlockBuilder",
        false,
        mockItemType,
        "block",
        mockFields,
      );
      expect(mockCodeFormatter.format).toHaveBeenCalledWith(
        "import statements\n\nfunction definition",
      );
      expect(result).toBe("formatted code");
    });

    it("should generate model file with correct function name", async () => {
      const modelConfig = { ...mockConfig, type: "model" as const };
      const modelGenerator = new FileGenerator(
        modelConfig,
        mockFieldGeneratorFactory,
      );

      await modelGenerator.generate();

      expect(mockImportGenerator.generateImports).toHaveBeenCalledWith(
        "ModelBuilder",
      );
      expect(mockFunctionGenerator.generateFunction).toHaveBeenCalledWith(
        "PascalTestBlockName",
        "ModelBuilder",
        false,
        mockItemType,
        "model",
        mockFields,
      );
    });

    it("should detect when async is needed for block references", async () => {
      mockBlockReferenceAnalyzer.hasBlockReferences.mockReturnValue(true);

      await fileGenerator.generate();

      expect(mockFunctionGenerator.generateFunction).toHaveBeenCalledWith(
        "PascalTestBlockName",
        "BlockBuilder",
        true,
        mockItemType,
        "block",
        mockFields,
      );
    });

    it("should handle rich text fields that reference blocks", async () => {
      const fieldsWithBlockRef = [
        ...mockFields,
        {
          id: "rich-text-field",
          type: "field",
          label: "Rich Text",
          field_type: "rich_text",
          api_key: "rich_text",
          hint: "",
          localized: false,
          validators: {
            rich_text_blocks: {
              item_types: ["block-1", "block-2"],
            },
          },
          position: 2,
          appearance: { addons: [], editor: "wysiwyg", parameters: {} },
          default_value: null,
          deep_filtering_enabled: false,
          item_type: { id: mockItemType.id, type: "item_type" },
          fieldset: null,
        } as any,
      ];

      const configWithBlockRef = { ...mockConfig, fields: fieldsWithBlockRef };
      const generatorWithBlockRef = new FileGenerator(
        configWithBlockRef,
        mockFieldGeneratorFactory,
      );

      mockBlockReferenceAnalyzer.hasBlockReferences.mockReturnValue(true);

      await generatorWithBlockRef.generate();

      expect(
        mockBlockReferenceAnalyzer.hasBlockReferences,
      ).toHaveBeenCalledWith(fieldsWithBlockRef);
      expect(mockFunctionGenerator.generateFunction).toHaveBeenCalledWith(
        expect.any(String),
        "BlockBuilder",
        true,
        mockItemType,
        "block",
        fieldsWithBlockRef,
      );
    });

    it("should pass formatting options to code formatter", async () => {
      const customFormatting: Options = {
        printWidth: 120,
        tabWidth: 4,
        singleQuote: true,
      };

      const customConfig = { ...mockConfig, formatting: customFormatting };
      const customGenerator = new FileGenerator(
        customConfig,
        mockFieldGeneratorFactory,
      );

      await customGenerator.generate();

      expect(MockedCodeFormatter).toHaveBeenCalledWith(customFormatting);
    });

    it("should handle code formatting errors gracefully", async () => {
      mockCodeFormatter.format.mockRejectedValue(
        new Error("Formatting failed"),
      );

      await expect(fileGenerator.generate()).rejects.toThrow(
        "Formatting failed",
      );
    });

    it("should build correct file content structure", async () => {
      const mockImports = "import BlockBuilder from '../../BlockBuilder';";
      const mockFunction =
        "export default function buildTest() { return new BlockBuilder(); }";

      mockImportGenerator.generateImports.mockReturnValue(mockImports);
      mockFunctionGenerator.generateFunction.mockReturnValue(mockFunction);

      await fileGenerator.generate();

      expect(mockCodeFormatter.format).toHaveBeenCalledWith(
        `${mockImports}\n\n${mockFunction}`,
      );
    });
  });

  describe("buildFileContent", () => {
    it("should properly combine imports and function definition", async () => {
      const mockImports = "import statements here";
      const mockFunction = "function definition here";

      mockImportGenerator.generateImports.mockReturnValue(mockImports);
      mockFunctionGenerator.generateFunction.mockReturnValue(mockFunction);

      await fileGenerator.generate();

      expect(mockCodeFormatter.format).toHaveBeenCalledWith(
        "import statements here\n\nfunction definition here",
      );
    });
  });

  describe("integration with item type references", () => {
    it("should handle item type references in config", async () => {
      const referencedItemType: ItemType = {
        id: "referenced-block",
        type: "item_type",
        name: "Referenced Block",
        api_key: "referenced_block",
        singleton: false,
        sortable: true,
        draft_mode_active: false,
        all_locales_required: false,
        hint: "",
        collection_appearance: "table",
        modular_block: false,
        draft_saving_active: false,
        tree: false,
        ordering_direction: null,
        ordering_field: null,
        inverse_relationships_enabled: false,
        title_field: null,
        image_preview_field: null,
        excerpt_field: null,
        workflow: null,
        has_singleton_item: false,
        name_singular: null,
        ordering_meta: null,
      } as unknown as ItemType;

      const configWithReferences = {
        ...mockConfig,
        itemTypeReferences: new Map([["referenced-block", referencedItemType]]),
      };

      const generatorWithRefs = new FileGenerator(
        configWithReferences,
        mockFieldGeneratorFactory,
      );

      await generatorWithRefs.generate();

      // The generator should still work normally with references
      expect(mockFunctionGenerator.generateFunction).toHaveBeenCalledWith(
        expect.any(String),
        "BlockBuilder",
        expect.any(Boolean),
        mockItemType,
        "block",
        mockFields,
      );
    });
  });

  describe("edge cases", () => {
    it("should handle empty fields array", async () => {
      const configWithNoFields = { ...mockConfig, fields: [] };
      const generatorWithNoFields = new FileGenerator(
        configWithNoFields,
        mockFieldGeneratorFactory,
      );

      await generatorWithNoFields.generate();

      expect(
        mockBlockReferenceAnalyzer.hasBlockReferences,
      ).toHaveBeenCalledWith([]);
      expect(mockFunctionGenerator.generateFunction).toHaveBeenCalledWith(
        expect.any(String),
        "BlockBuilder",
        false,
        mockItemType,
        "block",
        [],
      );
    });

    it("should handle item type with special characters in name", async () => {
      const specialItemType = {
        ...mockItemType,
        name: "Test Block With Spaces & Special-Chars",
      };

      const configWithSpecialName = {
        ...mockConfig,
        itemType: specialItemType,
      };
      const generatorWithSpecialName = new FileGenerator(
        configWithSpecialName,
        mockFieldGeneratorFactory,
      );

      await generatorWithSpecialName.generate();

      // Function name should be processed by toPascalCase
      expect(mockFunctionGenerator.generateFunction).toHaveBeenCalledWith(
        "PascalTestBlockWithSpaces&Special-Chars",
        "BlockBuilder",
        expect.any(Boolean),
        specialItemType,
        "block",
        mockFields,
      );
    });

    it("should handle singleton models", async () => {
      const singletonItemType = {
        ...mockItemType,
        singleton: true,
      };

      const configWithSingleton = {
        ...mockConfig,
        itemType: singletonItemType,
        type: "model" as const,
      };
      const generatorWithSingleton = new FileGenerator(
        configWithSingleton,
        mockFieldGeneratorFactory,
      );

      await generatorWithSingleton.generate();

      expect(mockFunctionGenerator.generateFunction).toHaveBeenCalledWith(
        expect.any(String),
        "ModelBuilder",
        expect.any(Boolean),
        singletonItemType,
        "model",
        mockFields,
      );
    });
  });
});
