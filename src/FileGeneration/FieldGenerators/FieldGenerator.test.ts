import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  FieldGenerator,
  type FieldGeneratorConfig,
} from "@/FileGeneration/FieldGenerators/FieldGenerator";

// Mock concrete implementation for testing
class MockDateGenerator extends FieldGenerator {
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
      class MockDateGeneratorWithISO extends FieldGenerator {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

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
      class MockDateGeneratorWithOriginal extends FieldGenerator {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

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
      class MockDateGeneratorWithNested extends FieldGenerator {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

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
      class MockGeneratorWithNulls extends FieldGenerator {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

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
      class MockGeneratorWithArrays extends FieldGenerator {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

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
      class MockGeneratorWithSpecialChars extends FieldGenerator {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

        generateBuildConfig(): any {
          return {
            label: 'Special "quotes" and \\backslashes',
            body: {
              emoji_text: "Hello 👋 World 🌍",
              newline_text: "Line 1\nLine 2\nLine 3",
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
      expect(methodCall).toContain("Unicode: àáâãäåæç");
    });

    it("should handle deeply nested objects", () => {
      class MockGeneratorWithDeepNesting extends FieldGenerator {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

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
      class MockGeneratorWithBooleans extends FieldGenerator {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

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
      class MockGeneratorWithEmpty extends FieldGenerator {
        constructor(config: FieldGeneratorConfig) {
          super(config);
        }

        getMethodCallName() {
          return "addDate" as const;
        }

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

      expect(methodCall).toContain("empty_object: {  }");
      expect(methodCall).toContain("empty_array: []");
      expect(methodCall).toContain("empty_inside: {  }");
      expect(methodCall).toContain("array_inside: []");
    });
  });
});
