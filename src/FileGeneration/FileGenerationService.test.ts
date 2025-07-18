import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { FieldGeneratorFactory } from "@/FileGeneration/FieldGenerators/FieldGeneratorFactory";
import { FileGenerationService } from "@/FileGeneration/FileGenerationService";
import { FileGenerator } from "@/FileGeneration/FileGenerator";

// Mock dependencies
jest.mock("prettier", () => ({
  format: jest.fn(async (code: string) => code),
}));
jest.mock("@/FileGeneration/FileGenerator");
jest.mock("@/FileGeneration/FieldGenerators/FieldGeneratorFactory");

const MockedFileGenerator = FileGenerator as jest.MockedClass<
  typeof FileGenerator
>;
const MockedFieldGeneratorFactory = FieldGeneratorFactory as jest.MockedClass<
  typeof FieldGeneratorFactory
>;

describe("FileGenerationService", () => {
  let service: FileGenerationService;
  let mockItemType: ItemType;
  let mockFields: Field[];
  let mockFileGenerator: jest.Mocked<FileGenerator>;
  let mockFieldGeneratorFactory: jest.Mocked<FieldGeneratorFactory>;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new FileGenerationService();

    mockItemType = {
      id: "test-item-type-id",
      type: "item_type",
      name: "Test Item Type",
      api_key: "test_item_type",
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

    mockFileGenerator = {
      generate: jest.fn(),
    } as any;

    mockFieldGeneratorFactory = {} as any;

    MockedFileGenerator.mockImplementation(() => mockFileGenerator);
    MockedFieldGeneratorFactory.mockImplementation(
      () => mockFieldGeneratorFactory,
    );
  });

  describe("setItemTypeReferences", () => {
    it("should store item type references in a map", () => {
      const itemTypes = [
        mockItemType,
        {
          ...mockItemType,
          id: "second-item-type",
          name: "Second Item Type",
          api_key: "second_item_type",
        },
      ];

      service.setItemTypeReferences(itemTypes);

      // Test by generating a file and checking if references were passed
      service.generateFile({
        itemType: mockItemType,
        fields: mockFields,
        type: "block",
      });

      expect(MockedFileGenerator).toHaveBeenCalledWith(
        expect.objectContaining({
          itemTypeReferences: expect.any(Map),
        }),
        expect.any(Object),
      );

      const passedConfig = MockedFileGenerator.mock.calls[0][0];
      expect(passedConfig.itemTypeReferences.size).toBe(2);
      expect(passedConfig.itemTypeReferences.get("test-item-type-id")).toEqual(
        itemTypes[0],
      );
      expect(passedConfig.itemTypeReferences.get("second-item-type")).toEqual(
        itemTypes[1],
      );
    });

    it("should clear existing references when setting new ones", () => {
      // Set initial references
      service.setItemTypeReferences([mockItemType]);

      // Set new references
      const newItemType = {
        ...mockItemType,
        id: "new-item-type",
        name: "New Item Type",
      };
      service.setItemTypeReferences([newItemType]);

      service.generateFile({
        itemType: mockItemType,
        fields: mockFields,
        type: "block",
      });

      const passedConfig = MockedFileGenerator.mock.calls[0][0];
      expect(passedConfig.itemTypeReferences.size).toBe(1);
      expect(passedConfig.itemTypeReferences.get("new-item-type")).toEqual(
        newItemType,
      );
      expect(passedConfig.itemTypeReferences.has("test-item-type-id")).toBe(
        false,
      );
    });

    it("should handle empty item types array", () => {
      service.setItemTypeReferences([]);

      service.generateFile({
        itemType: mockItemType,
        fields: mockFields,
        type: "block",
      });

      const passedConfig = MockedFileGenerator.mock.calls[0][0];
      expect(passedConfig.itemTypeReferences.size).toBe(0);
    });
  });

  describe("generateFile", () => {
    beforeEach(() => {
      service.setItemTypeReferences([mockItemType]);
    });

    it("should create FileGenerator with correct config and factory", async () => {
      await service.generateFile({
        itemType: mockItemType,
        fields: mockFields,
        type: "block",
      });

      expect(MockedFileGenerator).toHaveBeenCalledWith(
        {
          itemType: mockItemType,
          fields: mockFields,
          type: "block",
          itemTypeReferences: expect.any(Map),
        },
        mockFieldGeneratorFactory,
      );
    });

    it("should call generate on the FileGenerator instance", async () => {
      const expectedResult = "generated file content";
      mockFileGenerator.generate.mockResolvedValue(expectedResult);

      const result = await service.generateFile({
        itemType: mockItemType,
        fields: mockFields,
        type: "block",
      });

      expect(mockFileGenerator.generate).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedResult);
    });

    it("should handle model type", async () => {
      await service.generateFile({
        itemType: mockItemType,
        fields: mockFields,
        type: "model",
      });

      expect(MockedFileGenerator).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "model",
        }),
        mockFieldGeneratorFactory,
      );
    });

    it("should pass all fields to FileGenerator", async () => {
      const multipleFields = [
        ...mockFields,
        {
          ...mockFields[0],
          id: "field-2",
          label: "Second Field",
          api_key: "second_field",
          position: 2,
        },
      ];

      await service.generateFile({
        itemType: mockItemType,
        fields: multipleFields,
        type: "block",
      });

      expect(MockedFileGenerator).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: multipleFields,
        }),
        mockFieldGeneratorFactory,
      );
    });

    it("should reuse single FieldGeneratorFactory instance", async () => {
      await service.generateFile({
        itemType: mockItemType,
        fields: mockFields,
        type: "block",
      });

      await service.generateFile({
        itemType: mockItemType,
        fields: mockFields,
        type: "model",
      });

      // Constructor only called once during service creation
      expect(MockedFieldGeneratorFactory).toHaveBeenCalledTimes(1);
    });

    it("should propagate errors from FileGenerator", async () => {
      const error = new Error("Generation failed");
      mockFileGenerator.generate.mockRejectedValue(error);

      await expect(
        service.generateFile({
          itemType: mockItemType,
          fields: mockFields,
          type: "block",
        }),
      ).rejects.toThrow("Generation failed");
    });

    it("should pass localDevelopment parameter to FileGenerator", async () => {
      await service.generateFile({
        itemType: mockItemType,
        fields: mockFields,
        type: "block",
        localDevelopment: true,
      });

      expect(MockedFileGenerator).toHaveBeenCalledWith(
        expect.objectContaining({
          localDevelopment: true,
        }),
        expect.any(Object),
      );
    });

    it("should default localDevelopment to undefined when not provided", async () => {
      await service.generateFile({
        itemType: mockItemType,
        fields: mockFields,
        type: "block",
      });

      expect(MockedFileGenerator).toHaveBeenCalledWith(
        expect.objectContaining({
          localDevelopment: undefined,
        }),
        expect.any(Object),
      );
    });
  });

  describe("integration scenarios", () => {
    it("should handle complex field configurations", async () => {
      const complexFields: Field[] = [
        {
          id: "rich-text-field",
          type: "field",
          label: "Rich Text",
          field_type: "rich_text",
          api_key: "rich_text",
          hint: "Rich text field with block references",
          localized: true,
          validators: {
            rich_text_blocks: {
              item_types: ["block-1", "block-2"],
            },
          },
          position: 1,
          appearance: { addons: [], editor: "wysiwyg", parameters: {} },
          default_value: null,
          deep_filtering_enabled: true,
          item_type: { id: mockItemType.id, type: "item_type" },
          fieldset: null,
        },
        {
          id: "date-field",
          type: "field",
          label: "Date Field",
          field_type: "date",
          api_key: "date_field",
          hint: "",
          localized: false,
          validators: {
            required: {},
            date_range: {
              min: "2023-01-01",
              max: "2025-12-31",
            },
          },
          position: 2,
          appearance: { addons: [], editor: "date_picker", parameters: {} },
          default_value: "2024-01-01",
          deep_filtering_enabled: false,
          item_type: { id: mockItemType.id, type: "item_type" },
          fieldset: null,
        },
      ];

      await service.generateFile({
        itemType: mockItemType,
        fields: complexFields,
        type: "block",
      });

      expect(MockedFileGenerator).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: complexFields,
        }),
        mockFieldGeneratorFactory,
      );
    });

    it("should handle empty fields array", async () => {
      await service.generateFile({
        itemType: mockItemType,
        fields: [],
        type: "block",
      });

      expect(MockedFileGenerator).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: [],
        }),
        mockFieldGeneratorFactory,
      );
    });
  });
});
