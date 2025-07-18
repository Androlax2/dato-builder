import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  FieldGenerator,
  type FieldGeneratorConfig,
} from "@/FileGeneration/FieldGenerators/FieldGenerator";

function createMockItemType(
  name: string,
  modular_block: boolean = false,
): ItemType {
  return {
    id: `test-${name.toLowerCase()}-id`,
    type: "item_type",
    name,
    api_key: name.toLowerCase().replace(/\s+/g, "_"),
    collection_appearance: "table",
    singleton: false,
    all_locales_required: true,
    sortable: false,
    modular_block,
    draft_mode_active: false,
    draft_saving_active: false,
    tree: false,
    ordering_direction: null,
    ordering_meta: null,
    has_singleton_item: false,
    hint: null,
    inverse_relationships_enabled: false,
    singleton_item: null,
    fields: [],
    fieldsets: [],
    presentation_title_field: null,
    presentation_image_field: null,
    title_field: null,
    image_preview_field: null,
    excerpt_field: null,
    ordering_field: null,
    workflow: null,
    meta: { has_singleton_item: false },
  } as ItemType;
}

// Mock concrete implementation for testing
class MockDateGenerator extends FieldGenerator<"addDate"> {
  constructor(config: FieldGeneratorConfig) {
    super(config);
  }

  getMethodCallName() {
    return "addDate" as const;
  }

  generateBuildConfig() {
    return {
      label: this.field.label,
      body: {
        position: this.field.position,
      },
    } as any;
  }
}

describe("FieldGenerator", () => {
  let mockField: Field;
  let config: FieldGeneratorConfig;

  beforeEach(() => {
    mockField = {
      id: "test-id",
      type: "field",
      label: "Test Field",
      field_type: "date",
      api_key: "test-date-api-key",
      hint: "test hint",
      localized: false,
      validators: {},
      position: 1,
      appearance: { addons: [], editor: "date_picker", parameters: {} },
      default_value: "2025-07-24",
      deep_filtering_enabled: false,
      item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
      fieldset: null,
    };

    config = {
      field: mockField,
    };
  });

  describe("generateMethodCall", () => {
    it("should generate correct method call string for date field", () => {
      const generator = new MockDateGenerator(config);
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toBe(
        `.addDate({ label: "Test Field", body: { position: 1 } })`,
      );
    });

    it("should serialize Date objects with ISO strings", () => {
      class MockDateGeneratorWithISO extends FieldGenerator<"addDate"> {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

        // biome-ignore lint/suspicious/noExplicitAny: Test mock needs to return any type for flexibility
        generateBuildConfig(): any {
          return {
            label: this.field.label,
            body: {
              date_value: new Date("2025-07-14T10:30:00.000Z"),
            },
          };
        }
      }

      const generator = new MockDateGeneratorWithISO(config);
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toContain('new Date("2025-07-14T10:30:00.000Z")');
    });

    it("should serialize Date objects with original string format when available", () => {
      class MockDateGeneratorWithOriginal extends FieldGenerator<"addDate"> {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

        // biome-ignore lint/suspicious/noExplicitAny: Test mock needs to return any type for flexibility
        generateBuildConfig(): any {
          const date = new Date("2025-07-14") as Date & {
            _originalString?: string;
          };
          date._originalString = "2025-07-14";

          return {
            label: this.field.label,
            body: {
              date_value: date,
            },
          };
        }
      }

      const generator = new MockDateGeneratorWithOriginal(config);
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toContain('new Date("2025-07-14")');
      expect(methodCall).not.toContain("T00:00:00.000Z");
    });

    it("should handle nested objects with Date values", () => {
      class MockDateGeneratorWithNested extends FieldGenerator<"addDate"> {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

        // biome-ignore lint/suspicious/noExplicitAny: Test mock needs to return any type for flexibility
        generateBuildConfig(): any {
          const minDate = new Date("2020-01-01") as Date & {
            _originalString?: string;
          };
          minDate._originalString = "2020-01-01";

          const maxDate = new Date("2025-12-31") as Date & {
            _originalString?: string;
          };
          maxDate._originalString = "2025-12-31";

          return {
            label: this.field.label,
            body: {
              validators: {
                date_range: {
                  min: minDate,
                  max: maxDate,
                },
              },
            },
          };
        }
      }

      const generator = new MockDateGeneratorWithNested(config);
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toContain('new Date("2020-01-01")');
      expect(methodCall).toContain('new Date("2025-12-31")');
      expect(methodCall).not.toContain("T00:00:00.000Z");
    });

    it("should handle null and undefined values", () => {
      class MockGeneratorWithNulls extends FieldGenerator<"addDate"> {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

        // biome-ignore lint/suspicious/noExplicitAny: Test mock needs to return any type for flexibility
        generateBuildConfig(): any {
          return {
            label: this.field.label,
            body: {
              null_value: null,
              undefined_value: undefined,
              api_key: this.field.api_key,
            },
          };
        }
      }

      const generator = new MockGeneratorWithNulls(config);
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toContain("null_value: null");
      expect(methodCall).toContain("undefined_value: undefined");
    });

    it("should handle arrays of different types", () => {
      class MockGeneratorWithArrays extends FieldGenerator<"addDate"> {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

        // biome-ignore lint/suspicious/noExplicitAny: Test mock needs to return any type for flexibility
        generateBuildConfig(): any {
          const date1 = new Date("2020-01-01") as Date & {
            _originalString?: string;
          };
          date1._originalString = "2020-01-01";

          const date2 = new Date("2025-12-31T23:59:59.999Z");

          return {
            label: this.field.label,
            body: {
              string_array: ["one", "two", "three"],
              number_array: [1, 2, 3, 42],
              date_array: [date1, date2],
              mixed_array: ["text", 123, true, null],
            },
          };
        }
      }

      const generator = new MockGeneratorWithArrays(config);
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toContain('string_array: ["one", "two", "three"]');
      expect(methodCall).toContain("number_array: [1, 2, 3, 42]");
      expect(methodCall).toContain('new Date("2020-01-01")');
      expect(methodCall).toContain('new Date("2025-12-31T23:59:59.999Z")');
      expect(methodCall).toContain('mixed_array: ["text", 123, true, null]');
    });

    it("should handle special characters in strings", () => {
      class MockGeneratorWithSpecialChars extends FieldGenerator<"addDate"> {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

        // biome-ignore lint/suspicious/noExplicitAny: Test mock needs to return any type for flexibility
        generateBuildConfig(): any {
          return {
            label: 'Special "quotes" and \\backslashes',
            body: {
              emoji_text: "Hello 👋 World 🌍",
              newline_text: "Line 1\nLine 2\nLine 3",
              // cspell:disable-next-line
              unicode_text: "Unicode: àáâãäåæç",
              json_like: '{"nested": "value"}',
            },
          };
        }
      }

      const generator = new MockGeneratorWithSpecialChars(config);
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toContain('Special \\"quotes\\" and \\\\backslashes');
      expect(methodCall).toContain("Hello 👋 World 🌍");
      expect(methodCall).toContain("Line 1\\nLine 2\\nLine 3");
      // cspell:disable-next-line
      expect(methodCall).toContain("Unicode: àáâãäåæç");
    });

    it("should handle deeply nested objects", () => {
      class MockGeneratorWithDeepNesting extends FieldGenerator<"addDate"> {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

        // biome-ignore lint/suspicious/noExplicitAny: Test mock needs to return any type for flexibility
        generateBuildConfig(): any {
          const date = new Date("2025-01-01") as Date & {
            _originalString?: string;
          };
          date._originalString = "2025-01-01";

          return {
            label: this.field.label,
            body: {
              level1: {
                level2: {
                  level3: {
                    deep_date: date,
                    deep_array: [1, 2, { nested: "value" }],
                    deep_string: "deeply nested",
                  },
                },
              },
            },
          };
        }
      }

      const generator = new MockGeneratorWithDeepNesting(config);
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toContain('new Date("2025-01-01")');
      expect(methodCall).toContain('deep_array: [1, 2, { nested: "value" }]');
      expect(methodCall).toContain('deep_string: "deeply nested"');
    });

    it("should handle boolean values correctly", () => {
      class MockGeneratorWithBooleans extends FieldGenerator<"addDate"> {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

        // biome-ignore lint/suspicious/noExplicitAny: Test mock needs to return any type for flexibility
        generateBuildConfig(): any {
          return {
            label: this.field.label,
            body: {
              true_value: true,
              false_value: false,
              zero_number: 0,
              empty_string: "",
            },
          };
        }
      }

      const generator = new MockGeneratorWithBooleans(config);
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toContain("true_value: true");
      expect(methodCall).toContain("false_value: false");
      expect(methodCall).toContain("zero_number: 0");
      expect(methodCall).toContain('empty_string: ""');
    });

    it("should handle empty objects and arrays", () => {
      class MockGeneratorWithEmpty extends FieldGenerator<"addDate"> {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

        // biome-ignore lint/suspicious/noExplicitAny: Test mock needs to return any type for flexibility
        generateBuildConfig(): any {
          return {
            label: this.field.label,
            body: {
              empty_object: {},
              empty_array: [],
              nested_empty: {
                empty_inside: {},
                array_inside: [],
              },
            },
          };
        }
      }

      const generator = new MockGeneratorWithEmpty(config);
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toContain("empty_object: {}");
      expect(methodCall).toContain("empty_array: []");
      expect(methodCall).toContain("empty_inside: {}");
      expect(methodCall).toContain("array_inside: []");
    });

    it("should handle async call markers correctly", () => {
      class MockGeneratorWithAsyncCalls extends FieldGenerator<"addDate"> {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

        // biome-ignore lint/suspicious/noExplicitAny: Test mock needs to return any type for flexibility
        generateBuildConfig(): any {
          return {
            label: this.field.label,
            body: {
              single_async: { __async_call: 'await getModel("Terminal")' },
              array_with_async: [
                { __async_call: 'await getModel("Terminal")' },
                { __async_call: 'await getBlock("TestBlock")' },
              ],
              nested_async: {
                validators: {
                  item_types: [{ __async_call: 'await getModel("FooBar")' }],
                },
              },
            },
          };
        }
      }

      const generator = new MockGeneratorWithAsyncCalls(config);
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toContain('single_async: await getModel("Terminal")');
      expect(methodCall).toContain(
        'await getModel("Terminal"), await getBlock("TestBlock")',
      );
      expect(methodCall).toContain('await getModel("FooBar")');
      expect(methodCall).not.toContain("__async_call");
    });

    it("should handle mixed async calls and regular values", () => {
      class MockGeneratorWithMixed extends FieldGenerator<"addDate"> {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

        // biome-ignore lint/suspicious/noExplicitAny: Test mock needs to return any type for flexibility
        generateBuildConfig(): any {
          return {
            label: this.field.label,
            body: {
              regular_string: "normal value",
              async_call: { __async_call: 'await getModel("Terminal")' },
              number_value: 42,
              mixed_array: [
                "string",
                { __async_call: 'await getBlock("TestBlock")' },
                123,
                true,
              ],
            },
          };
        }
      }

      const generator = new MockGeneratorWithMixed(config);
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toContain('regular_string: "normal value"');
      expect(methodCall).toContain('async_call: await getModel("Terminal")');
      expect(methodCall).toContain("number_value: 42");
      expect(methodCall).toContain(
        '"string", await getBlock("TestBlock"), 123, true',
      );
    });
  });

  describe("convertItemTypeIdsToGetCalls", () => {
    it("should convert item type IDs to getModel calls for models", () => {
      const itemTypeReferences = new Map([
        ["terminal-id", createMockItemType("Terminal")],
        ["airline-id", createMockItemType("Airline")],
      ]);

      class TestGenerator extends FieldGenerator<"addDate"> {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

        // biome-ignore lint/suspicious/noExplicitAny: Test mock needs to return any type for flexibility
        generateBuildConfig(): any {
          const calls = this.convertItemTypeIdsToGetCalls([
            "terminal-id",
            "airline-id",
          ]);
          return {
            label: this.field.label,
            body: {
              item_types: calls,
            },
          };
        }
      }

      const generator = new TestGenerator({
        field: mockField,
        itemTypeReferences,
      });

      const methodCall = generator.generateMethodCall();
      expect(methodCall).toContain('await getModel("Terminal")');
      expect(methodCall).toContain('await getModel("Airline")');
    });

    it("should convert item type IDs to getBlock calls for blocks", () => {
      const itemTypeReferences = new Map([
        ["block-id", createMockItemType("Test Block", true)],
      ]);

      class TestGenerator extends FieldGenerator<"addDate"> {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

        // biome-ignore lint/suspicious/noExplicitAny: Test mock needs to return any type for flexibility
        generateBuildConfig(): any {
          const calls = this.convertItemTypeIdsToGetCalls(["block-id"]);
          return {
            label: this.field.label,
            body: {
              item_types: calls,
            },
          };
        }
      }

      const generator = new TestGenerator({
        field: mockField,
        itemTypeReferences,
      });

      const methodCall = generator.generateMethodCall();
      expect(methodCall).toContain('await getBlock("TestBlock")');
    });

    it("should handle complex names with PascalCase conversion", () => {
      const itemTypeReferences = new Map([
        ["foobar-id", createMockItemType("Foo Bar")],
        ["multi-word-id", createMockItemType("Multi Word Block Name", true)],
      ]);

      class TestGenerator extends FieldGenerator<"addDate"> {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

        // biome-ignore lint/suspicious/noExplicitAny: Test mock needs to return any type for flexibility
        generateBuildConfig(): any {
          const calls = this.convertItemTypeIdsToGetCalls([
            "foobar-id",
            "multi-word-id",
          ]);
          return {
            label: this.field.label,
            body: {
              item_types: calls,
            },
          };
        }
      }

      const generator = new TestGenerator({
        field: mockField,
        itemTypeReferences,
      });

      const methodCall = generator.generateMethodCall();
      expect(methodCall).toContain('await getModel("FooBar")');
      expect(methodCall).toContain('await getBlock("MultiWordBlockName")');
    });

    it("should throw error when item type reference is missing", () => {
      class TestGenerator extends FieldGenerator<"addDate"> {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

        // biome-ignore lint/suspicious/noExplicitAny: Test mock needs to return any type for flexibility
        generateBuildConfig(): any {
          const calls = this.convertItemTypeIdsToGetCalls(["nonexistent-id"]);
          return {
            label: this.field.label,
            body: {
              item_types: calls,
            },
          };
        }
      }

      const generator = new TestGenerator({
        field: mockField,
        itemTypeReferences: new Map(),
      });

      expect(() => generator.generateMethodCall()).toThrow(
        'Item type with ID "nonexistent-id" not found in references for field test-date-api-key',
      );
    });

    it("should throw error when itemTypeReferences is not provided", () => {
      class TestGenerator extends FieldGenerator<"addDate"> {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

        // biome-ignore lint/suspicious/noExplicitAny: Test mock needs to return any type for flexibility
        generateBuildConfig(): any {
          const calls = this.convertItemTypeIdsToGetCalls(["some-id"]);
          return {
            label: this.field.label,
            body: {
              item_types: calls,
            },
          };
        }
      }

      const generator = new TestGenerator({
        field: mockField,
      });

      expect(() => generator.generateMethodCall()).toThrow(
        "Cannot resolve item type references for field test-date-api-key. Item type references not available.",
      );
    });
  });
});
