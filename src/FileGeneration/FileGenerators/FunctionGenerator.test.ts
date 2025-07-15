import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { BuilderConfigGenerator } from "@/FileGeneration/FileGenerators/BuilderConfigGenerator";
import { FieldMethodGenerator } from "@/FileGeneration/FileGenerators/FieldMethodGenerator";
import { FunctionGenerator } from "@/FileGeneration/FileGenerators/FunctionGenerator";

// Mock the dependencies
jest.mock("@/FileGeneration/FileGenerators/BuilderConfigGenerator");
jest.mock("@/FileGeneration/FileGenerators/FieldMethodGenerator");

const MockedBuilderConfigGenerator = BuilderConfigGenerator as jest.MockedClass<
  typeof BuilderConfigGenerator
>;
const MockedFieldMethodGenerator = FieldMethodGenerator as jest.MockedClass<
  typeof FieldMethodGenerator
>;

describe("FunctionGenerator", () => {
  let generator: FunctionGenerator;
  let mockBuilderConfigGenerator: jest.Mocked<BuilderConfigGenerator>;
  let mockFieldMethodGenerator: jest.Mocked<FieldMethodGenerator>;
  let mockItemType: ItemType;
  let mockFields: Field[];

  beforeEach(() => {
    jest.clearAllMocks();

    mockBuilderConfigGenerator = {
      generateBuilderConfig: jest.fn(),
    } as any;

    mockFieldMethodGenerator = {
      generateFieldMethods: jest.fn(),
    } as any;

    MockedBuilderConfigGenerator.mockImplementation(
      () => mockBuilderConfigGenerator,
    );
    MockedFieldMethodGenerator.mockImplementation(
      () => mockFieldMethodGenerator,
    );

    generator = new FunctionGenerator(
      mockBuilderConfigGenerator,
      mockFieldMethodGenerator,
    );

    mockItemType = {
      id: "test-item-type-id",
      type: "item_type",
      name: "Test Block",
      api_key: "test_block",
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

    // Set up default mock return values
    mockBuilderConfigGenerator.generateBuilderConfig.mockReturnValue(`{
      name: 'Test Block',
      config,
      options: { api_key: 'test_block' }
    }`);

    mockFieldMethodGenerator.generateFieldMethods.mockReturnValue(
      ".addText({ label: 'Test Field' })",
    );
  });

  describe("generateFunction", () => {
    it("should generate synchronous function for block without async needs", () => {
      const result = generator.generateFunction(
        "buildTestBlock",
        "BlockBuilder",
        false,
        mockItemType,
        "block",
        mockFields,
      );

      expect(result).toContain(
        "export default function buildTestBlock({ config }: BuilderContext)",
      );
      expect(result).not.toContain("async");
      expect(result).not.toContain("getBlock");
      expect(result).not.toContain("getModel");
      expect(
        mockBuilderConfigGenerator.generateBuilderConfig,
      ).toHaveBeenCalledWith(mockItemType, "block");
      expect(
        mockFieldMethodGenerator.generateFieldMethods,
      ).toHaveBeenCalledWith(mockFields);
    });

    it("should generate asynchronous function for block with async needs", () => {
      const result = generator.generateFunction(
        "buildTestBlock",
        "BlockBuilder",
        true,
        mockItemType,
        "block",
        mockFields,
      );

      expect(result).toContain(
        "export default async function buildTestBlock({ config, getBlock, getModel }: BuilderContext)",
      );
      expect(result).toContain("async");
    });

    it("should generate function for model type", () => {
      const result = generator.generateFunction(
        "buildTestModel",
        "ModelBuilder",
        false,
        mockItemType,
        "model",
        mockFields,
      );

      expect(result).toContain(
        "export default function buildTestModel({ config }: BuilderContext)",
      );
      expect(result).toContain("return new ModelBuilder");
      expect(
        mockBuilderConfigGenerator.generateBuilderConfig,
      ).toHaveBeenCalledWith(mockItemType, "model");
    });

    it("should include proper JSDoc comment with item type information", () => {
      // Mock Date to return consistent timestamp
      const mockDate = new Date("2024-07-15T10:30:00.000Z");
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      const result = generator.generateFunction(
        "buildTestBlock",
        "BlockBuilder",
        false,
        mockItemType,
        "block",
        mockFields,
      );

      expect(result).toContain(
        '/**\n * Build a "Test Block" block in DatoCMS.',
      );
      expect(result).toContain(
        "Generated from DatoCMS API on 2024-07-15T10:30:00.000Z",
      );
      expect(result).toContain("API Key: test_block");
      expect(result).toContain(" */");

      jest.restoreAllMocks();
    });

    it("should include proper JSDoc comment for model", () => {
      const mockDate = new Date("2024-07-15T10:30:00.000Z");
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      const result = generator.generateFunction(
        "buildTestModel",
        "ModelBuilder",
        false,
        mockItemType,
        "model",
        mockFields,
      );

      expect(result).toContain(
        '/**\n * Build a "Test Block" model in DatoCMS.',
      );
      expect(result).toContain(
        "Generated from DatoCMS API on 2024-07-15T10:30:00.000Z",
      );
      expect(result).toContain("API Key: test_block");

      jest.restoreAllMocks();
    });

    it("should properly combine builder config and field methods", () => {
      const builderConfig = `{
        name: 'Custom Block',
        config,
        options: { api_key: 'custom_block' }
      }`;

      const fieldMethods =
        ".addText({ label: 'Field 1' }).addDate({ label: 'Field 2' })";

      mockBuilderConfigGenerator.generateBuilderConfig.mockReturnValue(
        builderConfig,
      );
      mockFieldMethodGenerator.generateFieldMethods.mockReturnValue(
        fieldMethods,
      );

      const result = generator.generateFunction(
        "buildCustomBlock",
        "BlockBuilder",
        false,
        mockItemType,
        "block",
        mockFields,
      );

      expect(result).toContain(
        `return new BlockBuilder(${builderConfig})${fieldMethods};`,
      );
    });

    it("should handle empty field methods", () => {
      mockFieldMethodGenerator.generateFieldMethods.mockReturnValue("");

      const result = generator.generateFunction(
        "buildEmptyBlock",
        "BlockBuilder",
        false,
        mockItemType,
        "block",
        [],
      );

      expect(result).toContain("return new BlockBuilder({");
      expect(result).toContain("});");
    });

    it("should handle complex field methods", () => {
      const complexFieldMethods = `
        .addText({ label: 'Title', body: { required: true } })
        .addRichText({ label: 'Content', body: { blocks: ['image', 'video'] } })
        .addDate({ label: 'Published At', body: { min: '2023-01-01' } })
      `;

      mockFieldMethodGenerator.generateFieldMethods.mockReturnValue(
        complexFieldMethods,
      );

      const result = generator.generateFunction(
        "buildComplexBlock",
        "BlockBuilder",
        true,
        mockItemType,
        "block",
        mockFields,
      );

      expect(result).toContain("return new BlockBuilder({");
      expect(result).toContain(`})${complexFieldMethods};`);
    });

    it("should handle special characters in item type name", () => {
      const specialItemType = {
        ...mockItemType,
        name: "Test Block with \"quotes\" and 'apostrophes'",
      };

      const result = generator.generateFunction(
        "buildSpecialBlock",
        "BlockBuilder",
        false,
        specialItemType,
        "block",
        mockFields,
      );

      expect(result).toContain(
        "Build a \"Test Block with \\\"quotes\\\" and \\''apostrophes\\''\"",
      );
    });

    it("should handle multiline builder config", () => {
      const multilineConfig = `{
        name: 'Multi Line Block',
        config,
        options: {
          api_key: 'multi_line_block',
          hint: 'This is a very long hint that might span multiple lines'
        }
      }`;

      mockBuilderConfigGenerator.generateBuilderConfig.mockReturnValue(
        multilineConfig,
      );

      const result = generator.generateFunction(
        "buildMultiLineBlock",
        "BlockBuilder",
        false,
        mockItemType,
        "block",
        mockFields,
      );

      expect(result).toContain(`return new BlockBuilder(${multilineConfig})`);
    });

    it("should generate proper function signature for sync block", () => {
      const result = generator.generateFunction(
        "buildSyncBlock",
        "BlockBuilder",
        false,
        mockItemType,
        "block",
        mockFields,
      );

      expect(result).toMatch(
        /export default function buildSyncBlock\(\{ config \}: BuilderContext\) \{/,
      );
    });

    it("should generate proper function signature for async block", () => {
      const result = generator.generateFunction(
        "buildAsyncBlock",
        "BlockBuilder",
        true,
        mockItemType,
        "block",
        mockFields,
      );

      expect(result).toMatch(
        /export default async function buildAsyncBlock\(\{ config, getBlock, getModel \}: BuilderContext\) \{/,
      );
    });

    it("should generate proper function signature for sync model", () => {
      const result = generator.generateFunction(
        "buildSyncModel",
        "ModelBuilder",
        false,
        mockItemType,
        "model",
        mockFields,
      );

      expect(result).toMatch(
        /export default function buildSyncModel\(\{ config \}: BuilderContext\) \{/,
      );
    });

    it("should generate proper function signature for async model", () => {
      const result = generator.generateFunction(
        "buildAsyncModel",
        "ModelBuilder",
        true,
        mockItemType,
        "model",
        mockFields,
      );

      expect(result).toMatch(
        /export default async function buildAsyncModel\(\{ config, getBlock, getModel \}: BuilderContext\) \{/,
      );
    });
  });

  describe("error handling", () => {
    it("should propagate errors from builder config generator", () => {
      mockBuilderConfigGenerator.generateBuilderConfig.mockImplementation(
        () => {
          throw new Error("Builder config failed");
        },
      );

      expect(() => {
        generator.generateFunction(
          "buildErrorBlock",
          "BlockBuilder",
          false,
          mockItemType,
          "block",
          mockFields,
        );
      }).toThrow("Builder config failed");
    });

    it("should propagate errors from field method generator", () => {
      mockFieldMethodGenerator.generateFieldMethods.mockImplementation(() => {
        throw new Error("Field methods failed");
      });

      expect(() => {
        generator.generateFunction(
          "buildErrorBlock",
          "BlockBuilder",
          false,
          mockItemType,
          "block",
          mockFields,
        );
      }).toThrow("Field methods failed");
    });
  });

  describe("edge cases", () => {
    it("should handle very long function names", () => {
      const longFunctionName = "build" + "A".repeat(1000) + "Block";

      const result = generator.generateFunction(
        longFunctionName,
        "BlockBuilder",
        false,
        mockItemType,
        "block",
        mockFields,
      );

      expect(result).toContain(`export default function ${longFunctionName}(`);
    });

    it("should handle empty item type name", () => {
      const emptyNameItemType = {
        ...mockItemType,
        name: "",
      };

      const result = generator.generateFunction(
        "buildEmptyNameBlock",
        "BlockBuilder",
        false,
        emptyNameItemType,
        "block",
        mockFields,
      );

      expect(result).toContain('Build a ""');
    });

    it("should handle empty api_key", () => {
      const emptyApiKeyItemType = {
        ...mockItemType,
        api_key: "",
      };

      const result = generator.generateFunction(
        "buildEmptyApiKeyBlock",
        "BlockBuilder",
        false,
        emptyApiKeyItemType,
        "block",
        mockFields,
      );

      expect(result).toContain("API Key: ");
    });

    it("should handle very large fields array", () => {
      const largeFieldsArray = Array.from({ length: 1000 }, (_, index) => ({
        ...mockFields[0],
        id: `field-${index}`,
      }));

      const result = generator.generateFunction(
        "buildLargeBlock",
        "BlockBuilder",
        false,
        mockItemType,
        "block",
        largeFieldsArray,
      );

      expect(
        mockFieldMethodGenerator.generateFieldMethods,
      ).toHaveBeenCalledWith(largeFieldsArray);
      expect(result).toContain("export default function buildLargeBlock");
    });

    it("should maintain consistent timestamp format", () => {
      const fixedDate = new Date("2024-12-25T15:30:45.123Z");
      jest.spyOn(global, "Date").mockImplementation(() => fixedDate as any);

      const result = generator.generateFunction(
        "buildTimestampBlock",
        "BlockBuilder",
        false,
        mockItemType,
        "block",
        mockFields,
      );

      expect(result).toContain(
        "Generated from DatoCMS API on 2024-12-25T15:30:45.123Z",
      );

      jest.restoreAllMocks();
    });
  });
});
