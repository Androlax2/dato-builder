import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createMockConfig } from "@tests/utils/mockConfig";
import type { DatoBuilderConfig } from "../src";
import DatoApi from "../src/Api/DatoApi";
import Field, { type FieldBody } from "../src/Fields/Field";
import Integer from "../src/Fields/Integer";
import Markdown from "../src/Fields/Markdown";
import SingleLineString from "../src/Fields/SingleLineString";
import StringRadioGroup from "../src/Fields/StringRadioGroup";
import StringSelect from "../src/Fields/StringSelect";
import ItemTypeBuilder, {
  type ItemTypeBuilderType,
} from "../src/ItemTypeBuilder";

jest.mock("../src/Api/DatoApi");
jest.mock("../src/Fields/Integer");
jest.mock("../src/Fields/SingleLineString");
jest.mock("../src/Fields/Markdown");
jest.mock("../src/Fields/Wysiwyg");
jest.mock("../src/Fields/Textarea");
jest.mock("../src/Fields/StringRadioGroup");
jest.mock("../src/Fields/StringSelect");
jest.mock("../src/Fields/MultiLineText");

// Same TestItemTypeBuilder class as in the original file
class TestItemTypeBuilder extends ItemTypeBuilder {
  // biome-ignore lint/suspicious/noExplicitAny: It's a test
  constructor(
    type: ItemTypeBuilderType,
    body: any,
    overwriteConfig?: Partial<DatoBuilderConfig>,
  ) {
    super({ type, body, config: createMockConfig(overwriteConfig) });
  }
}

describe("ItemTypeBuilder", () => {
  let builder: TestItemTypeBuilder;
  let mockApiCall: jest.Mock;
  // biome-ignore lint/suspicious/noExplicitAny: It's a mock
  let mockClientItemTypes: any;
  // biome-ignore lint/suspicious/noExplicitAny:It's a mock
  let mockClientFields: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup API mocks
    mockClientItemTypes = {
      create: jest.fn(async (_body) => ({ id: "item-123" })),
      update: jest.fn(async () => ({ id: "item-123" })),
      find: jest.fn(async () => ({ id: "item-123" })),
      list: jest.fn(async () => []),
    };

    mockClientFields = {
      list: jest.fn(async () => []),
      create: jest.fn(async () => ({
        id: "field-123",
      })),
      update: jest.fn(async () => ({
        id: "field-123",
      })),
      destroy: jest.fn(async () => ({})),
    };

    // biome-ignore lint/suspicious/noExplicitAny: It's a mock
    mockApiCall = jest.fn().mockImplementation(async (fn: any) => fn());

    // @ts-ignore - Mocking the API
    DatoApi.mockImplementation(() => ({
      client: {
        itemTypes: mockClientItemTypes,
        fields: mockClientFields,
      },
      call: mockApiCall,
    }));

    // Setup the test builder
    builder = new TestItemTypeBuilder("model", {
      name: "Test Model",
      singleton: false,
      sortable: true,
      draft_mode_active: false,
      all_locales_required: true,
    });
  });

  describe("constructor", () => {
    it("should set the type, name and create the body with defaults", () => {
      expect(builder.type).toBe("model");
      expect(builder.name).toBe("Test Model");
      expect(builder.body).toEqual({
        name: "Test Model",
        singleton: false,
        collection_appearance: "table",
        sortable: true,
        draft_mode_active: false,
        all_locales_required: true,
        api_key: "test_model_custom_model",
        modular_block: false,
      });
    });

    it("should use provided api_key if available", () => {
      const customBuilder = new TestItemTypeBuilder("model", {
        name: "Test Model",
        api_key: "custom_api_key",
        singleton: false,
        sortable: true,
        draft_mode_active: false,
        all_locales_required: true,
      });

      expect(customBuilder.body.api_key).toBe("custom_api_key");
    });

    it("should set modular_block to true for block type", () => {
      const blockBuilder = new TestItemTypeBuilder("block", {
        name: "Test Block",
        singleton: false,
        sortable: true,
        draft_mode_active: false,
        all_locales_required: true,
      });

      expect(blockBuilder.body.modular_block).toBe(true);
      expect(blockBuilder.body.api_key).toBe("test_block_custom_block");
    });
  });

  describe("setOverrideExistingFields", () => {
    it("should update the config and return this", () => {
      const builder = new TestItemTypeBuilder(
        "model",
        {
          name: "Test Model",
        },
        {
          overwriteExistingFields: false,
        },
      );

      expect(builder.config.overwriteExistingFields).toBe(false);

      const result = builder.setOverrideExistingFields(true);

      expect(builder.config.overwriteExistingFields).toBe(true);
      expect(result).toBe(builder);
    });

    it("should default to true when no value provided", () => {
      builder.config.overwriteExistingFields = false;

      builder.setOverrideExistingFields();

      expect(builder.config.overwriteExistingFields).toBe(true);
    });
  });

  describe("api key suffix", () => {
    describe("item type block", () => {
      it("does not add a suffix to the api_key", () => {
        const blockBuilder = new TestItemTypeBuilder(
          "block",
          {
            name: "Test",
          },
          {
            blockApiKeySuffix: null,
          },
        );

        expect(blockBuilder.body.api_key).toBe("test");
      });

      it("adds a suffix to the api_key", () => {
        const blockBuilder = new TestItemTypeBuilder(
          "block",
          {
            name: "Test",
          },
          {
            blockApiKeySuffix: "my super suffix",
          },
        );

        expect(blockBuilder.body.api_key).toBe("test_my_super_suffix");
      });
    });

    describe("item type model", () => {
      it("does not add a suffix to the api_key", () => {
        const modelBuilder = new TestItemTypeBuilder(
          "model",
          {
            name: "Test",
          },
          {
            modelApiKeySuffix: null,
          },
        );

        expect(modelBuilder.body.api_key).toBe("test");
      });

      it("adds a suffix to the api_key", () => {
        const modelBuilder = new TestItemTypeBuilder(
          "model",
          {
            name: "Test",
          },
          {
            modelApiKeySuffix: "my super suffix",
          },
        );

        expect(modelBuilder.body.api_key).toBe("test_my_super_suffix");
      });
    });
  });

  describe("plural api key", () => {
    it("should return the singular api_key of the item when the item name is plural", () => {
      const pluralBuilder = new TestItemTypeBuilder(
        "model",
        {
          name: "Test Models",
        },
        {
          modelApiKeySuffix: null,
        },
      );

      expect(pluralBuilder.body.api_key).toBe("test_model");
    });
  });

  describe("getField", () => {
    it("should return the field by api_key", () => {
      const mockField = {
        build: jest.fn().mockReturnValue({ api_key: "test_field" }),
      } as unknown as Field;

      builder.addField(mockField);

      const result = builder.getField("test_field");

      expect(result).toBe(mockField);
    });

    it("should return undefined if the field does not exist", () => {
      const result = builder.getField("non_existent_field");

      expect(result).toBeUndefined();
    });
  });

  describe("addField", () => {
    it("should add a field and return this", () => {
      const mockField = {
        build: jest.fn().mockReturnValue({ api_key: "test_field" }),
      } as unknown as Field;

      const result = builder.addField(mockField);

      expect(builder.fields).toContain(mockField);
      expect(result).toBe(builder);
    });

    it("should throw an error when a field with the same api_key already exists", () => {
      const mockField = {
        build: jest.fn().mockReturnValue({ api_key: "test_field" }),
      } as unknown as Field;

      builder.addField(mockField);

      expect(() => {
        builder.addField(mockField);
      }).toThrow('Field with api_key "test_field" already exists.');
    });

    it("should keep the plural version of the name if the name is plural", () => {
      class TestField extends Field {
        constructor(body: FieldBody) {
          // biome-ignore lint/suspicious/noExplicitAny: It's a test
          super("test_type" as any, body);
        }
      }

      const builder = new TestItemTypeBuilder("model", {
        name: "Test",
      });

      builder.addField(
        new TestField({
          label: "Fields",
        }),
      );

      expect(builder.fields[0].build().api_key).toBe("fields");
    });
  });

  describe("addInteger", () => {
    it("should create a new Integer field with the correct position and add it", () => {
      const mockField = {
        build: jest.fn().mockReturnValue({ api_key: "age" }),
      };
      (Integer as jest.Mock).mockImplementation(() => mockField);

      const spy = jest.spyOn(builder, "addField");

      builder.addInteger({ label: "Age" });

      expect(Integer).toHaveBeenCalledWith({
        label: "Age",
        body: {
          position: 1,
        },
      });

      // @ts-ignore
      expect(spy).toHaveBeenCalledWith(mockField);
    });

    it("should use the provided position if specified", () => {
      const mockField = {
        build: jest.fn().mockReturnValue({ api_key: "age" }),
      };
      (Integer as jest.Mock).mockImplementation(() => mockField);

      builder.addInteger({
        label: "Age",
        body: {
          position: 5,
        },
      });

      expect(Integer).toHaveBeenCalledWith({
        label: "Age",
        body: {
          position: 5,
        },
      });
    });
  });

  describe("create", () => {
    it("should create an item type and sync fields", async () => {
      const mockField = {
        build: jest
          .fn()
          .mockReturnValue({ api_key: "test_field", label: "Test Field" }),
      } as unknown as Field;

      builder.addField(mockField);

      const result = await builder.create();

      expect(mockApiCall).toHaveBeenCalledTimes(3);
      expect(mockClientItemTypes.create).toHaveBeenCalledWith(builder.body);
      expect(mockClientFields.list).toHaveBeenCalledWith("item-123");
      expect(mockClientFields.create).toHaveBeenCalledWith("item-123", {
        api_key: "test_field",
        label: "Test Field",
      });
      expect(result).toBe("item-123");
    });
  });

  describe("update", () => {
    it("should update an item type and sync fields", async () => {
      const mockField = {
        build: jest
          .fn()
          .mockReturnValue({ api_key: "test_field", label: "Test Field" }),
      } as unknown as Field;

      builder.addField(mockField);

      mockClientItemTypes.list.mockResolvedValueOnce([
        {
          id: "item-123",
          api_key: "test_model_custom_model",
          name: "Test Model",
        },
      ]);

      const result = await builder.update();

      expect(mockApiCall).toHaveBeenCalledTimes(4);
      expect(mockClientItemTypes.update).toHaveBeenCalledWith("item-123", {
        ...builder.body,
        hint: null,
      });
      expect(mockClientFields.list).toHaveBeenCalledWith("item-123");
      expect(mockClientFields.create).toHaveBeenCalledWith("item-123", {
        api_key: "test_field",
        label: "Test Field",
      });
      expect(result).toBe("item-123");
    });

    it("should update existing fields when overwriteExistingFields is true", async () => {
      builder.setOverrideExistingFields(true);

      const mockField = {
        build: jest
          .fn()
          .mockReturnValue({ api_key: "test_field", label: "Test Field" }),
      } as unknown as Field;

      mockClientItemTypes.list.mockResolvedValueOnce([
        {
          id: "item-123",
          api_key: "test_model_custom_model",
          name: "Test Model",
        },
      ]);

      builder.addField(mockField);

      // Mock an existing field
      mockClientFields.list.mockResolvedValueOnce([
        { id: "field-123", api_key: "test_field", label: "Old Label" },
        { id: "field-456", api_key: "to_delete", label: "To Delete" },
      ]);

      await builder.update();

      expect(mockClientFields.update).toHaveBeenCalledWith("field-123", {
        api_key: "test_field",
        label: "Test Field",
      });
      expect(mockClientFields.destroy).toHaveBeenCalledWith("field-456");
    });
  });

  describe("upsert", () => {
    it("should update if the item type exists", async () => {
      const updateSpy = jest.spyOn(mockClientItemTypes, "update");
      const createSpy = jest.spyOn(mockClientItemTypes, "create");

      mockClientItemTypes.list.mockResolvedValueOnce([
        { id: "item-123", name: "Test Model" },
      ]);

      const result = await builder.upsert();

      expect(mockClientItemTypes.list).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalled();
      expect(createSpy).not.toHaveBeenCalled();
      expect(result).toBe("item-123");
    });

    it("should create if the item type does not exist", async () => {
      const updateSpy = jest.spyOn(mockClientItemTypes, "update");
      const createSpy = jest.spyOn(mockClientItemTypes, "create");

      mockClientItemTypes.list.mockResolvedValueOnce([]);
      mockClientItemTypes.create.mockResolvedValueOnce({ id: "item-456" });

      const result = await builder.upsert();

      expect(mockClientItemTypes.list).toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(createSpy).toHaveBeenCalled();
      expect(result).toBe("item-456");
    });

    it("should propagate other errors", async () => {
      const genericError = new Error("Generic error");
      mockClientItemTypes.list.mockRejectedValueOnce(genericError);

      await expect(builder.upsert()).rejects.toThrow(genericError);
    });
  });

  describe("getNewFieldPosition", () => {
    it("should return 1 for the first field", () => {
      expect(builder.getNewFieldPosition()).toBe(1);
    });

    it("should increment position for each field", () => {
      const mockField1 = {
        build: jest.fn().mockReturnValue({ api_key: "field1" }),
      } as unknown as Field;
      const mockField2 = {
        build: jest.fn().mockReturnValue({ api_key: "field2" }),
      } as unknown as Field;

      builder.addField(mockField1);
      expect(builder.getNewFieldPosition()).toBe(2);

      builder.addField(mockField2);
      expect(builder.getNewFieldPosition()).toBe(3);
    });
  });

  describe("addSingleLineString", () => {
    it("should create a new SingleLineString field with the correct position", () => {
      const mockField = {
        build: jest.fn().mockReturnValue({ api_key: "title" }),
      };
      (SingleLineString as jest.Mock).mockImplementation(() => mockField);

      const spy = jest.spyOn(builder, "addField");

      builder.addSingleLineString({ label: "Title" });

      expect(SingleLineString).toHaveBeenCalledWith({
        label: "Title",
        body: {
          position: 1,
          validators: {
            unique: undefined,
          },
        },
        options: undefined,
      });

      // @ts-ignore
      expect(spy).toHaveBeenCalledWith(mockField);
    });

    it("should disable unique validation for block item types", () => {
      const blockBuilder = new TestItemTypeBuilder("block", {
        name: "Test Block",
        singleton: false,
        sortable: true,
        draft_mode_active: false,
        all_locales_required: true,
      });

      const mockField = {
        build: jest.fn().mockReturnValue({ api_key: "title" }),
      };
      (SingleLineString as jest.Mock).mockImplementation(() => mockField);

      blockBuilder.addSingleLineString({
        label: "Title",
        body: {
          validators: {
            unique: true,
          },
        },
      });

      expect(SingleLineString).toHaveBeenCalledWith({
        label: "Title",
        body: {
          position: 1,
          validators: {
            unique: undefined,
          },
        },
        options: undefined,
      });
    });

    it("should preserve unique validation for model item types", () => {
      const mockField = {
        build: jest.fn().mockReturnValue({ api_key: "title" }),
      };
      (SingleLineString as jest.Mock).mockImplementation(() => mockField);

      builder.addSingleLineString({
        label: "Title",
        body: {
          validators: {
            unique: true,
          },
        },
      });

      expect(SingleLineString).toHaveBeenCalledWith({
        label: "Title",
        body: {
          position: 1,
          validators: {
            unique: true,
          },
        },
        options: undefined,
      });
    });
  });

  describe("addMarkdown", () => {
    it("should create a new Markdown field with the correct position and toolbar options", () => {
      const mockField = {
        build: jest.fn().mockReturnValue({ api_key: "content" }),
      };
      (Markdown as jest.Mock).mockImplementation(() => mockField);

      const spy = jest.spyOn(builder, "addField");

      builder.addMarkdown({
        label: "Content",
        toolbar: ["bold", "italic", "code"],
      });

      expect(Markdown).toHaveBeenCalledWith({
        label: "Content",
        toolbar: ["bold", "italic", "code"],
        body: {
          position: 1,
        },
      });

      // @ts-ignore
      expect(spy).toHaveBeenCalledWith(mockField);
    });
  });

  describe("addHeading", () => {
    it("should create a heading field with heading option set to true", () => {
      const mockField = {
        build: jest.fn().mockReturnValue({ api_key: "section_title" }),
      };
      (SingleLineString as jest.Mock).mockImplementation(() => mockField);

      const spy = jest.spyOn(builder, "addSingleLineString");

      builder.addHeading({
        label: "Section Title",
      });

      expect(spy).toHaveBeenCalledWith({
        label: "Section Title",
        body: undefined,
        options: {
          heading: true,
        },
      });
    });

    it("should merge custom options with heading=true", () => {
      const mockField = {
        build: jest.fn().mockReturnValue({ api_key: "section_title" }),
      };
      (SingleLineString as jest.Mock).mockImplementation(() => mockField);

      const spy = jest.spyOn(builder, "addSingleLineString");

      builder.addHeading({
        label: "Section Title",
        options: {
          // @ts-ignore
          customOption: "value",
        },
      });

      expect(spy).toHaveBeenCalledWith({
        label: "Section Title",
        body: undefined,
        options: {
          heading: true,
          // @ts-ignore
          customOption: "value",
        },
      });
    });
  });

  describe("Error handling", () => {
    it("should propagate API errors when creating fields", async () => {
      const mockField = {
        build: jest.fn().mockReturnValue({ api_key: "test_field" }),
      } as unknown as Field;

      builder.addField(mockField);

      const apiError = new Error("API Error");
      mockClientFields.create.mockRejectedValueOnce(apiError);

      await expect(builder.create()).rejects.toThrow(
        'Failed to create field "test_field": API Error',
      );
    });

    it("should propagate API errors when updating fields", async () => {
      const mockField = {
        build: jest.fn().mockReturnValue({ api_key: "test_field" }),
      } as unknown as Field;

      builder.addField(mockField);
      builder.setOverrideExistingFields(true);

      mockClientItemTypes.list.mockResolvedValueOnce([
        { id: "item-123", name: "Test Model" },
      ]);
      mockClientFields.list.mockResolvedValueOnce([
        { id: "field-123", api_key: "test_field" },
      ]);

      const apiError = new Error("API Error");
      mockClientFields.update.mockRejectedValueOnce(apiError);

      await expect(builder.update()).rejects.toThrow(
        'Failed to update field "test_field" (id: field-123): API Error',
      );
    });

    it("should propagate API errors when deleting fields", async () => {
      builder.setOverrideExistingFields(true);

      mockClientItemTypes.list.mockResolvedValueOnce([
        { id: "item-123", name: "Test Model" },
      ]);
      mockClientFields.list.mockResolvedValueOnce([
        { id: "field-123", api_key: "to_delete" },
      ]);

      const apiError = new Error("API Error");
      mockClientFields.destroy.mockRejectedValueOnce(apiError);

      await expect(builder.update()).rejects.toThrow(
        'Failed to delete field "to_delete" (id: field-123): API Error',
      );
    });
  });

  describe("syncFields", () => {
    beforeEach(() => {
      mockClientItemTypes.list.mockResolvedValue([
        { id: "item-123", name: "Test Model" },
      ]);
      mockClientFields.list.mockResolvedValue([]);
    });

    it("should update existing fields when overwriteExistingFields is true", async () => {
      builder.setOverrideExistingFields(true);

      const mockField = {
        build: jest.fn().mockReturnValue({
          api_key: "existing_field",
          label: "Updated Field",
        }),
      } as unknown as Field;

      builder.addField(mockField);

      // Mock an existing field with the same api_key
      mockClientFields.list.mockResolvedValueOnce([
        { id: "field-123", api_key: "existing_field", label: "Old Field" },
      ]);

      await builder.update();

      expect(mockClientFields.update).toHaveBeenCalledWith("field-123", {
        api_key: "existing_field",
        label: "Updated Field",
      });
      expect(mockClientFields.create).not.toHaveBeenCalled();
      expect(mockClientFields.destroy).not.toHaveBeenCalled();
    });

    it("should delete fields no longer in the builder when overwriteExistingFields is true", async () => {
      builder.setOverrideExistingFields(true);

      // Mock multiple existing fields
      mockClientFields.list.mockResolvedValueOnce([
        { id: "field-123", api_key: "field1", label: "Field 1" },
        { id: "field-456", api_key: "field2", label: "Field 2" },
      ]);

      // Only add one field to the builder
      const mockField = {
        build: jest.fn().mockReturnValue({
          api_key: "field1",
          label: "Field 1",
        }),
      } as unknown as Field;

      builder.addField(mockField);

      await builder.update();

      // Should delete field2 since it's not in the builder
      expect(mockClientFields.destroy).toHaveBeenCalledWith("field-456");
      expect(mockClientFields.create).not.toHaveBeenCalled();
      expect(mockClientFields.update).toHaveBeenCalledWith("field-123", {
        api_key: "field1",
        label: "Field 1",
      });
    });

    it("should not update or delete fields when overwriteExistingFields is false", async () => {
      // Explicitly set to false (already the default)
      builder.setOverrideExistingFields(false);

      // Mock existing fields
      mockClientFields.list.mockResolvedValueOnce([
        { id: "field-123", api_key: "field1", label: "Field 1" },
        { id: "field-456", api_key: "field2", label: "Field 2" },
      ]);

      // Add a field with the same api_key but different label
      const mockField = {
        build: jest.fn().mockReturnValue({
          api_key: "field1",
          label: "Updated Field 1",
        }),
      } as unknown as Field;

      builder.addField(mockField);

      await builder.update();

      // No updates or deletes should happen
      expect(mockClientFields.update).not.toHaveBeenCalled();
      expect(mockClientFields.destroy).not.toHaveBeenCalled();
      expect(mockClientFields.create).not.toHaveBeenCalled();
    });

    it("should create new fields that do not exist", async () => {
      // Mock existing fields
      mockClientFields.list.mockResolvedValueOnce([
        { id: "field-123", api_key: "field1", label: "Field 1" },
      ]);

      // Add a new field
      const mockField = {
        build: jest.fn().mockReturnValue({
          api_key: "new_field",
          label: "New Field",
        }),
      } as unknown as Field;

      builder.addField(mockField);

      await builder.update();

      expect(mockClientFields.create).toHaveBeenCalledWith("item-123", {
        api_key: "new_field",
        label: "New Field",
      });
      expect(mockClientFields.update).not.toHaveBeenCalled();
      expect(mockClientFields.destroy).not.toHaveBeenCalled();
    });
  });

  describe("StringRadioGroup and StringSelect tests", () => {
    it("should create a StringRadioGroup with the correct options", () => {
      const mockField = {
        build: jest.fn().mockReturnValue({ api_key: "status" }),
      };
      (StringRadioGroup as jest.Mock).mockImplementation(() => mockField);

      const spy = jest.spyOn(builder, "addField");
      const radios = [
        { label: "Published", value: "published" },
        { label: "Draft", value: "draft" },
      ];

      builder.addStringRadioGroup({
        label: "Status",
        radios,
      });

      expect(StringRadioGroup).toHaveBeenCalledWith({
        label: "Status",
        radios,
        body: {
          position: 1,
        },
      });

      // @ts-ignore
      expect(spy).toHaveBeenCalledWith(mockField);
    });

    it("should create a StringSelect with the correct options", () => {
      const mockField = {
        build: jest.fn().mockReturnValue({ api_key: "category" }),
      };
      (StringSelect as jest.Mock).mockImplementation(() => mockField);

      const spy = jest.spyOn(builder, "addField");
      const options = [
        { label: "News", value: "news" },
        { label: "Opinion", value: "opinion" },
      ];

      builder.addStringSelect({
        label: "Category",
        options,
      });

      expect(StringSelect).toHaveBeenCalledWith({
        label: "Category",
        options,
        body: {
          position: 1,
        },
      });

      // @ts-ignore
      expect(spy).toHaveBeenCalledWith(mockField);
    });
  });

  describe("Integration tests", () => {
    it("should handle a complete model with multiple field types", async () => {
      // Create mock fields of different types
      const mockFieldBuilds = {
        title: { api_key: "title", label: "Title", field_type: "string" },
        content: {
          api_key: "content",
          label: "Content",
          field_type: "markdown",
        },
        category: {
          api_key: "category",
          label: "Category",
          field_type: "string_select",
        },
      };

      // Create mock field instances
      const titleField = {
        build: jest.fn().mockReturnValue(mockFieldBuilds.title),
      };
      const contentField = {
        build: jest.fn().mockReturnValue(mockFieldBuilds.content),
      };
      const categoryField = {
        build: jest.fn().mockReturnValue(mockFieldBuilds.category),
      };

      // Mock the field constructors
      (SingleLineString as jest.Mock).mockImplementation(() => titleField);
      (Markdown as jest.Mock).mockImplementation(() => contentField);
      (StringSelect as jest.Mock).mockImplementation(() => categoryField);

      // Add fields to the builder
      builder.addSingleLineString({ label: "Title" });
      builder.addMarkdown({ label: "Content", toolbar: [] });
      builder.addStringSelect({
        label: "Category",
        options: [
          { label: "News", value: "news" },
          { label: "Opinion", value: "opinion" },
        ],
      });

      // Execute upsert
      await builder.upsert();

      // Check that all fields were created
      expect(mockClientFields.create).toHaveBeenCalledTimes(3);
      expect(mockClientFields.create).toHaveBeenCalledWith(
        "item-123",
        mockFieldBuilds.title,
      );
      expect(mockClientFields.create).toHaveBeenCalledWith(
        "item-123",
        mockFieldBuilds.content,
      );
      expect(mockClientFields.create).toHaveBeenCalledWith(
        "item-123",
        mockFieldBuilds.category,
      );
    });
  });
});
