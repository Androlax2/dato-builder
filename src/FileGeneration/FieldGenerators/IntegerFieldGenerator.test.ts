import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import type { IntegerConfig } from "@/Fields/Integer";
import { IntegerFieldGenerator } from "@/FileGeneration/FieldGenerators/IntegerFieldGenerator";

function createMockField(
  overrides: Partial<Field> & Pick<Field, "label" | "api_key">,
): Field {
  const defaults: Omit<Field, "label" | "api_key"> = {
    id: "test-id",
    type: "field",
    field_type: "integer",
    hint: null,
    localized: false,
    position: 1,
    validators: {},
    appearance: {
      addons: [],
      editor: "integer",
      parameters: {},
    },
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("IntegerFieldGenerator", () => {
  describe("Basic functionality", () => {
    it("can generate an integer field with label", () => {
      const integerGenerator = new IntegerFieldGenerator({
        field: createMockField({
          label: "Count",
          api_key: "count",
        }),
      });

      expect(integerGenerator.generateBuildConfig()).toEqual({
        label: "Count",
        body: {
          api_key: "count",
        },
      } satisfies IntegerConfig);
    });

    it("does not include position", () => {
      const integerGenerator = new IntegerFieldGenerator({
        field: createMockField({
          label: "Integer without Position",
          api_key: "integer_without_position",
        }),
      });

      expect(integerGenerator.generateBuildConfig()).toEqual({
        label: "Integer without Position",
        body: {
          api_key: "integer_without_position",
        },
      } satisfies IntegerConfig);
    });

    it("can generate an integer field with a hint", () => {
      const integerGenerator = new IntegerFieldGenerator({
        field: createMockField({
          label: "Integer with Hint",
          api_key: "integer_with_hint",
          hint: "Enter a whole number",
        }),
      });

      expect(integerGenerator.generateBuildConfig()).toEqual({
        label: "Integer with Hint",
        body: {
          api_key: "integer_with_hint",
          hint: "Enter a whole number",
        },
      } satisfies IntegerConfig);
    });

    it("can generate an integer field without a hint", () => {
      const integerGenerator = new IntegerFieldGenerator({
        field: createMockField({
          label: "Integer without Hint",
          api_key: "integer_without_hint",
          hint: null,
        }),
      });

      expect(integerGenerator.generateBuildConfig()).toEqual({
        label: "Integer without Hint",
        body: {
          api_key: "integer_without_hint",
        },
      } satisfies IntegerConfig);
    });

    it("should not include validators if none are set", () => {
      const integerGenerator = new IntegerFieldGenerator({
        field: createMockField({
          label: "Integer without Validators",
          api_key: "integer_without_validators",
          validators: {},
        }),
      });

      expect(integerGenerator.generateBuildConfig()).toEqual({
        label: "Integer without Validators",
        body: {
          api_key: "integer_without_validators",
        },
      } satisfies IntegerConfig);
    });
  });

  describe("With validators", () => {
    describe("Required", () => {
      it("can generate a required integer field", () => {
        const integerGenerator = new IntegerFieldGenerator({
          field: createMockField({
            label: "Required Integer",
            api_key: "required_integer",
            validators: { required: {} },
          }),
        });

        expect(integerGenerator.generateBuildConfig()).toEqual({
          label: "Required Integer",
          body: {
            api_key: "required_integer",
            validators: { required: true },
          },
        } satisfies IntegerConfig);
      });

      it("can generate a non-required integer field", () => {
        const integerGenerator = new IntegerFieldGenerator({
          field: createMockField({
            label: "Non-Required Integer",
            api_key: "non_required_integer",
          }),
        });

        expect(integerGenerator.generateBuildConfig()).toEqual({
          label: "Non-Required Integer",
          body: {
            api_key: "non_required_integer",
          },
        } satisfies IntegerConfig);
      });
    });

    describe("Number range", () => {
      it("can generate an integer field with number_range validator", () => {
        const integerGenerator = new IntegerFieldGenerator({
          field: createMockField({
            label: "Integer with Range",
            api_key: "integer_with_range",
            validators: {
              number_range: { min: 1, max: 100 },
            },
          }),
        });

        expect(integerGenerator.generateBuildConfig()).toEqual({
          label: "Integer with Range",
          body: {
            api_key: "integer_with_range",
            validators: {
              number_range: { min: 1, max: 100 },
            },
          },
        } satisfies IntegerConfig);
      });

      it("can generate an integer field with multiple validators", () => {
        const integerGenerator = new IntegerFieldGenerator({
          field: createMockField({
            label: "Integer with Multiple Validators",
            api_key: "integer_multiple_validators",
            validators: {
              required: {},
              number_range: { min: 0, max: 999 },
            },
          }),
        });

        expect(integerGenerator.generateBuildConfig()).toEqual({
          label: "Integer with Multiple Validators",
          body: {
            api_key: "integer_multiple_validators",
            validators: {
              required: true,
              number_range: { min: 0, max: 999 },
            },
          },
        } satisfies IntegerConfig);
      });
    });
  });

  describe("Method call generation", () => {
    it("generates method call with correct method name", () => {
      const integerGenerator = new IntegerFieldGenerator({
        field: createMockField({
          label: "Test Integer",
          api_key: "test_integer",
        }),
      });

      const methodCall = integerGenerator.generateMethodCall();

      expect(methodCall).toMatch(/\.addInteger\(/);
      expect(methodCall).toContain('"Test Integer"');
      expect(methodCall).toContain('"test_integer"');
    });

    it("generates method call with validators", () => {
      const integerGenerator = new IntegerFieldGenerator({
        field: createMockField({
          label: "Integer with Validators",
          api_key: "integer_with_validators",
          validators: {
            number_range: { min: 1, max: 10 },
          },
        }),
      });

      const methodCall = integerGenerator.generateMethodCall();

      expect(methodCall).toContain("number_range");
      expect(methodCall).toMatch(/\.addInteger\(/);
    });

    it("generates method call with hint", () => {
      const integerGenerator = new IntegerFieldGenerator({
        field: createMockField({
          label: "Integer with Hint",
          api_key: "integer_with_hint",
          hint: "Enter whole number",
        }),
      });

      const methodCall = integerGenerator.generateMethodCall();

      expect(methodCall).toContain('"Enter whole number"');
      expect(methodCall).toMatch(/\.addInteger\(/);
    });
  });

  describe("Real-world API response test", () => {
    it("can handle a realistic Integer field from DatoCMS", () => {
      const apiResponseField: Field = {
        id: "integer-field-123",
        type: "field",
        label: "Quantity",
        field_type: "integer",
        api_key: "quantity",
        hint: "Enter quantity in stock",
        localized: false,
        validators: {
          required: {},
          number_range: { min: 0, max: 10000 },
        },
        position: 1,
        appearance: {
          addons: [],
          editor: "integer",
          parameters: {},
        },
        default_value: null,
        deep_filtering_enabled: false,
        item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
        fieldset: null,
      };

      const integerGenerator = new IntegerFieldGenerator({
        field: apiResponseField,
      });

      const config = integerGenerator.generateBuildConfig();

      expect(config).toEqual({
        label: "Quantity",
        body: {
          api_key: "quantity",
          hint: "Enter quantity in stock",
          validators: {
            required: true,
            number_range: { min: 0, max: 10000 },
          },
        },
      } satisfies IntegerConfig);
    });
  });

  describe("getMethodCallName", () => {
    it("returns the correct method name", () => {
      const integerGenerator = new IntegerFieldGenerator({
        field: createMockField({
          label: "Test",
          api_key: "test",
        }),
      });

      expect(integerGenerator.getMethodCallName()).toBe("addInteger");
    });
  });
});
