import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  FieldGenerator,
  type FieldGeneratorConfig,
} from "@/FileGeneration/FieldGenerators/FieldGenerator";

// Mock concrete implementation for testing
class MockDateGenerator extends FieldGenerator<"addDate"> {
  getMethodCallName() {
    return "addDate" as const;
  }

  generateBuildConfig() {
    return {
      label: this.field.label,
      body: {
        position: this.field.position,
      },
    };
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
      class MockDateGeneratorWithOriginal extends FieldGenerator<"addDate"> {
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
      class MockDateGeneratorWithNested extends FieldGenerator<"addDate"> {
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
  });
});
