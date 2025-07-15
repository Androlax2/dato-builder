import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import type { FloatConfig } from "@/Fields/Float";
import { FloatFieldGenerator } from "@/FileGeneration/FieldGenerators/FloatFieldGenerator";

function createMockField(
  overrides: Partial<Field> & Pick<Field, "label" | "api_key">,
): Field {
  const defaults: Omit<Field, "label" | "api_key"> = {
    id: "test-id",
    type: "field",
    field_type: "float",
    hint: null,
    localized: false,
    position: 1,
    validators: {},
    appearance: {
      addons: [],
      editor: "float",
      parameters: {},
    },
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("FloatFieldGenerator", () => {
  describe("Basic functionality", () => {
    it("can generate a float field with label", () => {
      const floatGenerator = new FloatFieldGenerator({
        field: createMockField({
          label: "Price",
          api_key: "price",
        }),
      });

      expect(floatGenerator.generateBuildConfig()).toEqual({
        label: "Price",
        body: {
          api_key: "price",
        },
      } satisfies FloatConfig);
    });

    it("does not include position", () => {
      const floatGenerator = new FloatFieldGenerator({
        field: createMockField({
          label: "Float without Position",
          api_key: "float_without_position",
        }),
      });

      expect(floatGenerator.generateBuildConfig()).toEqual({
        label: "Float without Position",
        body: {
          api_key: "float_without_position",
        },
      } satisfies FloatConfig);
    });

    it("can generate a float field with a hint", () => {
      const floatGenerator = new FloatFieldGenerator({
        field: createMockField({
          label: "Float with Hint",
          api_key: "float_with_hint",
          hint: "Enter a decimal number",
        }),
      });

      expect(floatGenerator.generateBuildConfig()).toEqual({
        label: "Float with Hint",
        body: {
          api_key: "float_with_hint",
          hint: "Enter a decimal number",
        },
      } satisfies FloatConfig);
    });

    it("can generate a float field without a hint", () => {
      const floatGenerator = new FloatFieldGenerator({
        field: createMockField({
          label: "Float without Hint",
          api_key: "float_without_hint",
          hint: null,
        }),
      });

      expect(floatGenerator.generateBuildConfig()).toEqual({
        label: "Float without Hint",
        body: {
          api_key: "float_without_hint",
        },
      } satisfies FloatConfig);
    });

    it("should not include validators if none are set", () => {
      const floatGenerator = new FloatFieldGenerator({
        field: createMockField({
          label: "Float without Validators",
          api_key: "float_without_validators",
          validators: {},
        }),
      });

      expect(floatGenerator.generateBuildConfig()).toEqual({
        label: "Float without Validators",
        body: {
          api_key: "float_without_validators",
        },
      } satisfies FloatConfig);
    });
  });

  describe("With validators", () => {
    describe("Required", () => {
      it("can generate a required float field", () => {
        const floatGenerator = new FloatFieldGenerator({
          field: createMockField({
            label: "Required Float",
            api_key: "required_float",
            validators: { required: {} },
          }),
        });

        expect(floatGenerator.generateBuildConfig()).toEqual({
          label: "Required Float",
          body: {
            api_key: "required_float",
            validators: { required: true },
          },
        } satisfies FloatConfig);
      });

      it("can generate a non-required float field", () => {
        const floatGenerator = new FloatFieldGenerator({
          field: createMockField({
            label: "Non-Required Float",
            api_key: "non_required_float",
          }),
        });

        expect(floatGenerator.generateBuildConfig()).toEqual({
          label: "Non-Required Float",
          body: {
            api_key: "non_required_float",
          },
        } satisfies FloatConfig);
      });
    });

    describe("Number range", () => {
      it("can generate a float field with number_range validator", () => {
        const floatGenerator = new FloatFieldGenerator({
          field: createMockField({
            label: "Float with Range",
            api_key: "float_with_range",
            validators: {
              number_range: { min: 0.0, max: 100.0 },
            },
          }),
        });

        expect(floatGenerator.generateBuildConfig()).toEqual({
          label: "Float with Range",
          body: {
            api_key: "float_with_range",
            validators: {
              number_range: { min: 0.0, max: 100.0 },
            },
          },
        } satisfies FloatConfig);
      });

      it("can generate a float field with multiple validators", () => {
        const floatGenerator = new FloatFieldGenerator({
          field: createMockField({
            label: "Float with Multiple Validators",
            api_key: "float_multiple_validators",
            validators: {
              required: {},
              number_range: { min: 1.5, max: 99.9 },
            },
          }),
        });

        expect(floatGenerator.generateBuildConfig()).toEqual({
          label: "Float with Multiple Validators",
          body: {
            api_key: "float_multiple_validators",
            validators: {
              required: true,
              number_range: { min: 1.5, max: 99.9 },
            },
          },
        } satisfies FloatConfig);
      });
    });
  });

  describe("Method call generation", () => {
    it("generates method call with correct method name", () => {
      const floatGenerator = new FloatFieldGenerator({
        field: createMockField({
          label: "Test Float",
          api_key: "test_float",
        }),
      });

      const methodCall = floatGenerator.generateMethodCall();

      expect(methodCall).toMatch(/\.addFloat\(/);
      expect(methodCall).toContain('"Test Float"');
      expect(methodCall).toContain('"test_float"');
    });

    it("generates method call with validators", () => {
      const floatGenerator = new FloatFieldGenerator({
        field: createMockField({
          label: "Float with Validators",
          api_key: "float_with_validators",
          validators: {
            number_range: { min: 0, max: 100 },
          },
        }),
      });

      const methodCall = floatGenerator.generateMethodCall();

      expect(methodCall).toContain("number_range");
      expect(methodCall).toMatch(/\.addFloat\(/);
    });

    it("generates method call with hint", () => {
      const floatGenerator = new FloatFieldGenerator({
        field: createMockField({
          label: "Float with Hint",
          api_key: "float_with_hint",
          hint: "Enter decimal number",
        }),
      });

      const methodCall = floatGenerator.generateMethodCall();

      expect(methodCall).toContain('"Enter decimal number"');
      expect(methodCall).toMatch(/\.addFloat\(/);
    });
  });

  describe("Real-world API response test", () => {
    it("can handle a realistic Float field from DatoCMS", () => {
      const apiResponseField: Field = {
        id: "float-field-123",
        type: "field",
        label: "Price",
        field_type: "float",
        api_key: "price",
        hint: "Enter price in USD",
        localized: false,
        validators: {
          required: {},
          number_range: { min: 0.01, max: 9999.99 },
        },
        position: 1,
        appearance: {
          addons: [],
          editor: "float",
          parameters: {},
        },
        default_value: null,
        deep_filtering_enabled: false,
        item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
        fieldset: null,
      };

      const floatGenerator = new FloatFieldGenerator({
        field: apiResponseField,
      });

      const config = floatGenerator.generateBuildConfig();

      expect(config).toEqual({
        label: "Price",
        body: {
          api_key: "price",
          hint: "Enter price in USD",
          validators: {
            required: true,
            number_range: { min: 0.01, max: 9999.99 },
          },
        },
      } satisfies FloatConfig);
    });
  });

  describe("getMethodCallName", () => {
    it("returns the correct method name", () => {
      const floatGenerator = new FloatFieldGenerator({
        field: createMockField({
          label: "Test",
          api_key: "test",
        }),
      });

      expect(floatGenerator.getMethodCallName()).toBe("addFloat");
    });
  });
});
