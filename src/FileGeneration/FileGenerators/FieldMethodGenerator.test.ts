import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import { FieldGeneratorFactory } from "@/FileGeneration/FieldGenerators/FieldGeneratorFactory";
import { FieldMethodGenerator } from "@/FileGeneration/FileGenerators/FieldMethodGenerator";

// Mock the FieldGeneratorFactory
jest.mock("@/FileGeneration/FieldGenerators/FieldGeneratorFactory");

const MockedFieldGeneratorFactory = FieldGeneratorFactory as jest.MockedClass<
  typeof FieldGeneratorFactory
>;

describe("FieldMethodGenerator", () => {
  let generator: FieldMethodGenerator;
  let mockFieldGeneratorFactory: jest.Mocked<FieldGeneratorFactory>;
  let baseField: Field;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFieldGeneratorFactory = {
      createGenerator: jest.fn(),
    } as any;

    MockedFieldGeneratorFactory.mockImplementation(
      () => mockFieldGeneratorFactory,
    );

    generator = new FieldMethodGenerator(mockFieldGeneratorFactory);

    baseField = {
      id: "test-field-id",
      type: "field",
      label: "Test Field",
      field_type: "string",
      api_key: "test_field",
      hint: "",
      localized: false,
      validators: {},
      position: 1 as number,
      appearance: { addons: [], editor: "single_line", parameters: {} },
      default_value: null,
      deep_filtering_enabled: false,
      item_type: { id: "item-type-id", type: "item_type" },
      fieldset: null,
    };
  });

  describe("generateFieldMethods", () => {
    it("should return empty string for empty fields array", () => {
      const result = generator.generateFieldMethods([]);

      expect(result).toBe("");
      expect(mockFieldGeneratorFactory.createGenerator).not.toHaveBeenCalled();
    });

    it("should generate method for single field", () => {
      const mockGenerator: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest
          .fn()
          .mockReturnValue(".addText({ label: 'Test Field' })"),
      } as any;

      mockFieldGeneratorFactory.createGenerator.mockReturnValue(mockGenerator);

      const fields = [baseField];
      const result = generator.generateFieldMethods(fields);

      expect(mockFieldGeneratorFactory.createGenerator).toHaveBeenCalledTimes(
        1,
      );
      expect(mockFieldGeneratorFactory.createGenerator).toHaveBeenCalledWith({
        field: baseField,
      });
      expect(mockGenerator.generateMethodCall).toHaveBeenCalledTimes(1);
      expect(result).toBe(".addText({ label: 'Test Field' })");
    });

    it("should generate methods for multiple fields", () => {
      const field1 = { ...baseField, position: 2 };
      const field2 = { ...baseField, id: "field-2", position: 1 };
      const field3 = { ...baseField, id: "field-3", position: 3 };

      const mockGenerator1: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest
          .fn()
          .mockReturnValue(".addText({ label: 'Field 1' })"),
      } as any;
      const mockGenerator2: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest
          .fn()
          .mockReturnValue(".addText({ label: 'Field 2' })"),
      } as any;
      const mockGenerator3: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest
          .fn()
          .mockReturnValue(".addText({ label: 'Field 3' })"),
      } as any;

      mockFieldGeneratorFactory.createGenerator
        .mockReturnValueOnce(mockGenerator2) // field2 (position 1)
        .mockReturnValueOnce(mockGenerator1) // field1 (position 2)
        .mockReturnValueOnce(mockGenerator3); // field3 (position 3)

      const fields = [field1, field2, field3];
      const result = generator.generateFieldMethods(fields);

      expect(mockFieldGeneratorFactory.createGenerator).toHaveBeenCalledTimes(
        3,
      );
      expect(result).toBe(
        ".addText({ label: 'Field 2' }).addText({ label: 'Field 1' }).addText({ label: 'Field 3' })",
      );
    });

    it("should sort fields by position", () => {
      const field1 = {
        ...baseField,
        id: "field-1",
        position: 3,
        label: "Third Field",
      };
      const field2 = {
        ...baseField,
        id: "field-2",
        position: 1,
        label: "First Field",
      };
      const field3 = {
        ...baseField,
        id: "field-3",
        position: 2,
        label: "Second Field",
      };

      const mockGenerator1: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest.fn().mockReturnValue(".addThird()"),
      } as any;
      const mockGenerator2: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest.fn().mockReturnValue(".addFirst()"),
      } as any;
      const mockGenerator3: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest.fn().mockReturnValue(".addSecond()"),
      } as any;

      // The factory should be called in position order (1, 2, 3)
      mockFieldGeneratorFactory.createGenerator
        .mockReturnValueOnce(mockGenerator2) // position 1
        .mockReturnValueOnce(mockGenerator3) // position 2
        .mockReturnValueOnce(mockGenerator1); // position 3

      const fields = [field1, field2, field3]; // Unsorted input
      const result = generator.generateFieldMethods(fields);

      // Check that createGenerator was called in position order
      expect(mockFieldGeneratorFactory.createGenerator).toHaveBeenNthCalledWith(
        1,
        { field: field2 },
      );
      expect(mockFieldGeneratorFactory.createGenerator).toHaveBeenNthCalledWith(
        2,
        { field: field3 },
      );
      expect(mockFieldGeneratorFactory.createGenerator).toHaveBeenNthCalledWith(
        3,
        { field: field1 },
      );

      expect(result).toBe(".addFirst().addSecond().addThird()");
    });

    it("should handle fields with undefined positions", () => {
      const field1 = {
        ...baseField,
        id: "field-1",
        position: undefined as any,
        label: "Field 1",
      };
      const field2 = {
        ...baseField,
        id: "field-2",
        position: 2,
        label: "Field 2",
      };
      const field3 = {
        ...baseField,
        id: "field-3",
        position: undefined as any,
        label: "Field 3",
      };

      const mockGenerator1: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest.fn().mockReturnValue(".add1()"),
      } as any;
      const mockGenerator2: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest.fn().mockReturnValue(".add2()"),
      } as any;
      const mockGenerator3: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest.fn().mockReturnValue(".add3()"),
      } as any;

      mockFieldGeneratorFactory.createGenerator
        .mockReturnValueOnce(mockGenerator1) // undefined position (treated as 0)
        .mockReturnValueOnce(mockGenerator3) // undefined position (treated as 0)
        .mockReturnValueOnce(mockGenerator2); // position 2

      const fields = [field1, field2, field3];
      const result = generator.generateFieldMethods(fields);

      expect(result).toBe(".add1().add3().add2()");
    });

    it("should handle fields with null positions", () => {
      const field1 = {
        ...baseField,
        id: "field-1",
        position: null as any,
        label: "Field 1",
      };
      const field2 = {
        ...baseField,
        id: "field-2",
        position: 1,
        label: "Field 2",
      };

      const mockGenerator1: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest.fn().mockReturnValue(".add1()"),
      } as any;
      const mockGenerator2: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest.fn().mockReturnValue(".add2()"),
      } as any;

      mockFieldGeneratorFactory.createGenerator
        .mockReturnValueOnce(mockGenerator1) // null position (treated as 0)
        .mockReturnValueOnce(mockGenerator2); // position 1

      const fields = [field1, field2];
      const result = generator.generateFieldMethods(fields);

      expect(result).toBe(".add1().add2()");
    });

    it("should handle fields with same positions", () => {
      const field1 = {
        ...baseField,
        id: "field-1",
        position: 1,
        label: "Field 1",
      };
      const field2 = {
        ...baseField,
        id: "field-2",
        position: 1,
        label: "Field 2",
      };
      const field3 = {
        ...baseField,
        id: "field-3",
        position: 1,
        label: "Field 3",
      };

      const mockGenerator1: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest.fn().mockReturnValue(".add1()"),
      } as any;
      const mockGenerator2: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest.fn().mockReturnValue(".add2()"),
      } as any;
      const mockGenerator3: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest.fn().mockReturnValue(".add3()"),
      } as any;

      mockFieldGeneratorFactory.createGenerator
        .mockReturnValueOnce(mockGenerator1)
        .mockReturnValueOnce(mockGenerator2)
        .mockReturnValueOnce(mockGenerator3);

      const fields = [field1, field2, field3];
      const result = generator.generateFieldMethods(fields);

      // Should maintain the original order when positions are the same
      expect(result).toBe(".add1().add2().add3()");
    });

    it("should not modify the original fields array", () => {
      const field1 = { ...baseField, id: "field-1", position: 3 };
      const field2 = { ...baseField, id: "field-2", position: 1 };
      const originalFields = [field1, field2];
      const originalFieldsCopy = [...originalFields];

      const mockGenerator: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest.fn().mockReturnValue(".add()"),
      } as any;

      mockFieldGeneratorFactory.createGenerator.mockReturnValue(mockGenerator);

      generator.generateFieldMethods(originalFields);

      // Original array should remain unchanged
      expect(originalFields).toEqual(originalFieldsCopy);
      expect(originalFields[0]).toBe(field1);
      expect(originalFields[1]).toBe(field2);
    });

    it("should handle complex field configurations", () => {
      const richTextField: Field = {
        ...baseField,
        id: "rich-text-field",
        field_type: "rich_text",
        position: 1,
        validators: {
          rich_text_blocks: {
            item_types: ["block-1", "block-2"],
          },
        },
      };

      const dateField: Field = {
        ...baseField,
        id: "date-field",
        field_type: "date",
        position: 2,
        validators: {
          required: {},
          date_range: {
            min: "2023-01-01",
            max: "2025-12-31",
          },
        },
      };

      const mockRichTextGenerator: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest
          .fn()
          .mockReturnValue(
            ".addRichText({ label: 'Rich Text', body: { blocks: ['block-1', 'block-2'] } })",
          ),
      } as any;

      const mockDateGenerator: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest
          .fn()
          .mockReturnValue(
            ".addDate({ label: 'Date', body: { required: true, min: '2023-01-01', max: '2025-12-31' } })",
          ),
      } as any;

      mockFieldGeneratorFactory.createGenerator
        .mockReturnValueOnce(mockRichTextGenerator)
        .mockReturnValueOnce(mockDateGenerator);

      const fields = [richTextField, dateField];
      const result = generator.generateFieldMethods(fields);

      expect(mockFieldGeneratorFactory.createGenerator).toHaveBeenCalledWith({
        field: richTextField,
      });
      expect(mockFieldGeneratorFactory.createGenerator).toHaveBeenCalledWith({
        field: dateField,
      });
      expect(result).toBe(
        ".addRichText({ label: 'Rich Text', body: { blocks: ['block-1', 'block-2'] } })" +
          ".addDate({ label: 'Date', body: { required: true, min: '2023-01-01', max: '2025-12-31' } })",
      );
    });

    it("should handle generator errors gracefully", () => {
      const mockGenerator: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest.fn().mockImplementation(() => {
          throw new Error("Generator failed");
        }),
      } as any;

      mockFieldGeneratorFactory.createGenerator.mockReturnValue(mockGenerator);

      const fields = [baseField];

      expect(() => generator.generateFieldMethods(fields)).toThrow(
        "Generator failed",
      );
    });

    it("should handle factory creation errors gracefully", () => {
      mockFieldGeneratorFactory.createGenerator.mockImplementation(() => {
        throw new Error("Factory failed");
      });

      const fields = [baseField];

      expect(() => generator.generateFieldMethods(fields)).toThrow(
        "Factory failed",
      );
    });
  });

  describe("edge cases", () => {
    it("should handle very large number of fields", () => {
      const fields = Array.from({ length: 1000 }, (_, index) => ({
        ...baseField,
        id: `field-${index}`,
        position: index,
      }));

      const mockGenerator: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest.fn().mockReturnValue(".add()"),
      } as any;

      mockFieldGeneratorFactory.createGenerator.mockReturnValue(mockGenerator);

      const result = generator.generateFieldMethods(fields);

      expect(mockFieldGeneratorFactory.createGenerator).toHaveBeenCalledTimes(
        1000,
      );
      expect(result).toBe(".add()".repeat(1000));
    });

    it("should handle negative positions", () => {
      const field1 = { ...baseField, id: "field-1", position: -1 };
      const field2 = { ...baseField, id: "field-2", position: 0 };
      const field3 = { ...baseField, id: "field-3", position: 1 };

      const mockGenerator: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest.fn().mockReturnValue(".add()"),
      } as any;

      mockFieldGeneratorFactory.createGenerator.mockReturnValue(mockGenerator);

      const fields = [field1, field2, field3];
      generator.generateFieldMethods(fields);

      // Should be called in order: -1, 0, 1
      expect(mockFieldGeneratorFactory.createGenerator).toHaveBeenNthCalledWith(
        1,
        { field: field1 },
      );
      expect(mockFieldGeneratorFactory.createGenerator).toHaveBeenNthCalledWith(
        2,
        { field: field2 },
      );
      expect(mockFieldGeneratorFactory.createGenerator).toHaveBeenNthCalledWith(
        3,
        { field: field3 },
      );
    });

    it("should handle very large position numbers", () => {
      const field1 = {
        ...baseField,
        id: "field-1",
        position: Number.MAX_SAFE_INTEGER,
      };
      const field2 = { ...baseField, id: "field-2", position: 1 };

      const mockGenerator: jest.Mocked<FieldGenerator<any>> = {
        generateMethodCall: jest.fn().mockReturnValue(".add()"),
      } as any;

      mockFieldGeneratorFactory.createGenerator.mockReturnValue(mockGenerator);

      const fields = [field1, field2];
      generator.generateFieldMethods(fields);

      // Should be called in order: 1, MAX_SAFE_INTEGER
      expect(mockFieldGeneratorFactory.createGenerator).toHaveBeenNthCalledWith(
        1,
        { field: field2 },
      );
      expect(mockFieldGeneratorFactory.createGenerator).toHaveBeenNthCalledWith(
        2,
        { field: field1 },
      );
    });
  });
});
