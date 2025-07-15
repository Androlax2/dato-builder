import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import type { ColorPickerConfig } from "@/Fields/ColorPicker";
import { ColorPickerFieldGenerator } from "@/FileGeneration/FieldGenerators/ColorPickerFieldGenerator";

function createMockField(
  overrides: Partial<Field> & Pick<Field, "label" | "api_key">,
): Field {
  const defaults: Omit<Field, "label" | "api_key"> = {
    id: "test-id",
    type: "field",
    field_type: "color",
    hint: null,
    localized: false,
    position: 1,
    validators: {},
    appearance: {
      addons: [],
      editor: "color_picker",
      parameters: {
        enable_alpha: false,
        preset_colors: [],
      },
    },
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("ColorPickerFieldGenerator", () => {
  describe("Basic functionality", () => {
    it("can generate a color picker with label", () => {
      const colorPickerGenerator = new ColorPickerFieldGenerator({
        field: createMockField({
          label: "Brand Color",
          api_key: "brand_color",
        }),
      });

      expect(colorPickerGenerator.generateBuildConfig()).toEqual({
        label: "Brand Color",
        enable_alpha: false,
        preset_colors: [],
        body: {
          api_key: "brand_color",
        },
      } satisfies ColorPickerConfig);
    });

    it("does not include position", () => {
      const colorPickerGenerator = new ColorPickerFieldGenerator({
        field: createMockField({
          label: "Color without Position",
          api_key: "color_without_position",
        }),
      });

      expect(colorPickerGenerator.generateBuildConfig()).toEqual({
        label: "Color without Position",
        enable_alpha: false,
        preset_colors: [],
        body: {
          api_key: "color_without_position",
        },
      } satisfies ColorPickerConfig);
    });

    it("can generate a color picker with a hint", () => {
      const colorPickerGenerator = new ColorPickerFieldGenerator({
        field: createMockField({
          label: "Color with Hint",
          api_key: "color_with_hint",
          hint: "Choose the brand primary color",
        }),
      });

      expect(colorPickerGenerator.generateBuildConfig()).toEqual({
        label: "Color with Hint",
        enable_alpha: false,
        preset_colors: [],
        body: {
          api_key: "color_with_hint",
          hint: "Choose the brand primary color",
        },
      } satisfies ColorPickerConfig);
    });

    it("can generate a color picker without a hint", () => {
      const colorPickerGenerator = new ColorPickerFieldGenerator({
        field: createMockField({
          label: "Color without Hint",
          api_key: "color_without_hint",
          hint: null,
        }),
      });

      expect(colorPickerGenerator.generateBuildConfig()).toEqual({
        label: "Color without Hint",
        enable_alpha: false,
        preset_colors: [],
        body: {
          api_key: "color_without_hint",
        },
      } satisfies ColorPickerConfig);
    });

    it("should not include validators if none are set", () => {
      const colorPickerGenerator = new ColorPickerFieldGenerator({
        field: createMockField({
          label: "Color without Validators",
          api_key: "color_without_validators",
          validators: {},
        }),
      });

      expect(colorPickerGenerator.generateBuildConfig()).toEqual({
        label: "Color without Validators",
        enable_alpha: false,
        preset_colors: [],
        body: {
          api_key: "color_without_validators",
        },
      } satisfies ColorPickerConfig);
    });
  });

  describe("Appearance parameters", () => {
    it("can extract enable_alpha parameter", () => {
      const colorPickerGenerator = new ColorPickerFieldGenerator({
        field: createMockField({
          label: "Color with Alpha",
          api_key: "color_with_alpha",
          appearance: {
            addons: [],
            editor: "color_picker",
            parameters: {
              enable_alpha: true,
              preset_colors: [],
            },
          },
        }),
      });

      expect(colorPickerGenerator.generateBuildConfig()).toEqual({
        label: "Color with Alpha",
        enable_alpha: true,
        preset_colors: [],
        body: {
          api_key: "color_with_alpha",
        },
      } satisfies ColorPickerConfig);
    });

    it("can extract preset_colors parameter", () => {
      const colorPickerGenerator = new ColorPickerFieldGenerator({
        field: createMockField({
          label: "Color with Presets",
          api_key: "color_with_presets",
          appearance: {
            addons: [],
            editor: "color_picker",
            parameters: {
              enable_alpha: false,
              preset_colors: ["#FF0000", "#00FF00", "#0000FF"],
            },
          },
        }),
      });

      expect(colorPickerGenerator.generateBuildConfig()).toEqual({
        label: "Color with Presets",
        enable_alpha: false,
        preset_colors: ["#FF0000", "#00FF00", "#0000FF"],
        body: {
          api_key: "color_with_presets",
        },
      } satisfies ColorPickerConfig);
    });

    it("can handle both enable_alpha and preset_colors", () => {
      const colorPickerGenerator = new ColorPickerFieldGenerator({
        field: createMockField({
          label: "Full Color Picker",
          api_key: "full_color_picker",
          appearance: {
            addons: [],
            editor: "color_picker",
            parameters: {
              enable_alpha: true,
              preset_colors: ["#FF5733", "#33FF57", "#3357FF"],
            },
          },
        }),
      });

      expect(colorPickerGenerator.generateBuildConfig()).toEqual({
        label: "Full Color Picker",
        enable_alpha: true,
        preset_colors: ["#FF5733", "#33FF57", "#3357FF"],
        body: {
          api_key: "full_color_picker",
        },
      } satisfies ColorPickerConfig);
    });

    it("handles missing appearance parameters gracefully", () => {
      const colorPickerGenerator = new ColorPickerFieldGenerator({
        field: createMockField({
          label: "Color No Params",
          api_key: "color_no_params",
          appearance: {
            addons: [],
            editor: "color_picker",
            parameters: {},
          },
        }),
      });

      expect(colorPickerGenerator.generateBuildConfig()).toEqual({
        label: "Color No Params",
        body: {
          api_key: "color_no_params",
        },
      } satisfies ColorPickerConfig);
    });
  });

  describe("With validators", () => {
    describe("Required", () => {
      it("can generate a required color picker field", () => {
        const colorPickerGenerator = new ColorPickerFieldGenerator({
          field: createMockField({
            label: "Required Color",
            api_key: "required-color-api-key",
            validators: { required: {} },
          }),
        });

        expect(colorPickerGenerator.generateBuildConfig()).toEqual({
          label: "Required Color",
          enable_alpha: false,
          preset_colors: [],
          body: {
            api_key: "required-color-api-key",
            validators: { required: true },
          },
        } satisfies ColorPickerConfig);
      });

      it("can generate a non-required color picker field", () => {
        const colorPickerGenerator = new ColorPickerFieldGenerator({
          field: createMockField({
            label: "Non-Required Color",
            api_key: "non-required-color-api-key",
          }),
        });

        expect(colorPickerGenerator.generateBuildConfig()).toEqual({
          label: "Non-Required Color",
          enable_alpha: false,
          preset_colors: [],
          body: {
            api_key: "non-required-color-api-key",
          },
        } satisfies ColorPickerConfig);
      });
    });
  });

  describe("Method call generation", () => {
    it("generates method call with correct method name", () => {
      const colorPickerGenerator = new ColorPickerFieldGenerator({
        field: createMockField({
          label: "Test Color",
          api_key: "test_color",
        }),
      });

      const methodCall = colorPickerGenerator.generateMethodCall();

      expect(methodCall).toMatch(/\.addColorPicker\(/);
      expect(methodCall).toContain('"Test Color"');
      expect(methodCall).toContain('"test_color"');
    });

    it("generates method call with enable_alpha", () => {
      const colorPickerGenerator = new ColorPickerFieldGenerator({
        field: createMockField({
          label: "Alpha Color",
          api_key: "alpha_color",
          appearance: {
            addons: [],
            editor: "color_picker",
            parameters: {
              enable_alpha: true,
              preset_colors: [],
            },
          },
        }),
      });

      const methodCall = colorPickerGenerator.generateMethodCall();

      expect(methodCall).toContain("enable_alpha: true");
      expect(methodCall).toMatch(/\.addColorPicker\(/);
    });

    it("generates method call with preset colors", () => {
      const colorPickerGenerator = new ColorPickerFieldGenerator({
        field: createMockField({
          label: "Preset Color",
          api_key: "preset_color",
          appearance: {
            addons: [],
            editor: "color_picker",
            parameters: {
              enable_alpha: false,
              preset_colors: ["#AABBCC", "#DDEEFF"],
            },
          },
        }),
      });

      const methodCall = colorPickerGenerator.generateMethodCall();

      expect(methodCall).toContain('"#AABBCC"');
      expect(methodCall).toContain('"#DDEEFF"');
      expect(methodCall).toMatch(/\.addColorPicker\(/);
    });

    it("generates method call with required validator", () => {
      const colorPickerGenerator = new ColorPickerFieldGenerator({
        field: createMockField({
          label: "Required Color",
          api_key: "required_color",
          validators: { required: {} },
        }),
      });

      const methodCall = colorPickerGenerator.generateMethodCall();

      expect(methodCall).toContain("required: true");
      expect(methodCall).toMatch(/\.addColorPicker\(/);
    });
  });

  describe("Real-world API response test", () => {
    it("can handle a realistic Color Picker field from DatoCMS", () => {
      const apiResponseField: Field = {
        id: "color-field-123",
        type: "field",
        label: "Primary Color",
        field_type: "color",
        api_key: "primary_color",
        hint: "Choose the primary brand color",
        localized: false,
        validators: {
          required: {},
        },
        position: 1,
        appearance: {
          addons: [],
          editor: "color_picker",
          parameters: {
            enable_alpha: true,
            preset_colors: ["#FF0000", "#00FF00", "#0000FF"],
          },
        },
        default_value: null,
        deep_filtering_enabled: false,
        item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
        fieldset: null,
      };

      const colorPickerGenerator = new ColorPickerFieldGenerator({
        field: apiResponseField,
      });

      const config = colorPickerGenerator.generateBuildConfig();

      expect(config).toEqual({
        label: "Primary Color",
        enable_alpha: true,
        preset_colors: ["#FF0000", "#00FF00", "#0000FF"],
        body: {
          api_key: "primary_color",
          hint: "Choose the primary brand color",
          validators: {
            required: true,
          },
        },
      } satisfies ColorPickerConfig);
    });
  });

  describe("getMethodCallName", () => {
    it("returns the correct method name", () => {
      const colorPickerGenerator = new ColorPickerFieldGenerator({
        field: createMockField({
          label: "Test",
          api_key: "test",
        }),
      });

      expect(colorPickerGenerator.getMethodCallName()).toBe("addColorPicker");
    });
  });
});
