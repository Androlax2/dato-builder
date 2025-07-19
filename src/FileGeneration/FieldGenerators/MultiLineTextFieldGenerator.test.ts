import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import type { MultiLineTextConfig } from "@/Fields/MultiLineText";
import { MultiLineTextFieldGenerator } from "@/FileGeneration/FieldGenerators/MultiLineTextFieldGenerator";

function createMockField(
  overrides: Partial<Field> & Pick<Field, "label" | "api_key">,
): Field {
  const defaults: Omit<Field, "label" | "api_key"> = {
    id: "test-id",
    type: "field",
    field_type: "text",
    hint: null,
    localized: false,
    position: 1,
    validators: {},
    appearance: undefined as any, // No appearance for plain multi-line text
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("MultiLineTextFieldGenerator", () => {
  describe("Basic functionality", () => {
    it("can generate a multi-line text field with label", () => {
      const multiLineTextGenerator = new MultiLineTextFieldGenerator({
        field: createMockField({
          label: "Long Description",
          api_key: "long_description",
        }),
      });

      expect(multiLineTextGenerator.generateBuildConfig()).toEqual({
        label: "Long Description",
        body: {
          api_key: "long_description",
        },
      } satisfies MultiLineTextConfig);
    });

    it("returns correct method call name", () => {
      const multiLineTextGenerator = new MultiLineTextFieldGenerator({
        field: createMockField({
          label: "Test",
          api_key: "test",
        }),
      });

      expect(multiLineTextGenerator.getMethodCallName()).toBe(
        "addMultiLineText",
      );
    });

    it("includes hint when present", () => {
      const multiLineTextGenerator = new MultiLineTextFieldGenerator({
        field: createMockField({
          label: "MultiLineText with Hint",
          api_key: "multi_line_text_with_hint",
          hint: "This is a hint",
        }),
      });

      const config = multiLineTextGenerator.generateBuildConfig();
      expect(config.body?.hint).toBe("This is a hint");
    });

    it("includes default_value when present", () => {
      const multiLineTextGenerator = new MultiLineTextFieldGenerator({
        field: createMockField({
          label: "MultiLineText with Default",
          api_key: "multi_line_text_with_default",
          default_value: "Default multi-line\ntext content",
        }),
      });

      const config = multiLineTextGenerator.generateBuildConfig();
      expect(config.body?.default_value).toBe(
        "Default multi-line\ntext content",
      );
    });

    it("handles minimal configuration", () => {
      const multiLineTextGenerator = new MultiLineTextFieldGenerator({
        field: createMockField({
          label: "Minimal MultiLineText",
          api_key: "minimal_multi_line_text",
        }),
      });

      const config = multiLineTextGenerator.generateBuildConfig();
      expect(config).toEqual({
        label: "Minimal MultiLineText",
        body: {
          api_key: "minimal_multi_line_text",
        },
      });
    });

    it("handles field with empty appearance", () => {
      const multiLineTextGenerator = new MultiLineTextFieldGenerator({
        field: createMockField({
          label: "Empty Appearance",
          api_key: "empty_appearance",
          appearance: { addons: [], editor: "plain", parameters: {} } as any,
        }),
      });

      const config = multiLineTextGenerator.generateBuildConfig();
      expect(config.label).toBe("Empty Appearance");
      expect(config.body?.api_key).toBe("empty_appearance");
    });
  });

  describe("Validators", () => {
    it("includes required validator", () => {
      const multiLineTextGenerator = new MultiLineTextFieldGenerator({
        field: createMockField({
          label: "Required MultiLineText",
          api_key: "required_multi_line_text",
          validators: { required: {} },
        }),
      });

      const config = multiLineTextGenerator.generateBuildConfig();
      expect(config.body?.validators?.required).toBe(true);
    });

    it("includes length validator", () => {
      const multiLineTextGenerator = new MultiLineTextFieldGenerator({
        field: createMockField({
          label: "Length MultiLineText",
          api_key: "length_multi_line_text",
          validators: { length: { min: 10, max: 1000 } },
        }),
      });

      const config = multiLineTextGenerator.generateBuildConfig();
      expect(config.body?.validators?.length).toEqual({ min: 10, max: 1000 });
    });

    it("includes format validator", () => {
      const multiLineTextGenerator = new MultiLineTextFieldGenerator({
        field: createMockField({
          label: "Format MultiLineText",
          api_key: "format_multi_line_text",
          validators: { format: { custom_pattern: "^[A-Za-z0-9\\s]+$" } },
        }),
      });

      const config = multiLineTextGenerator.generateBuildConfig();
      expect(config.body?.validators?.format).toEqual({
        custom_pattern: /^[A-Za-z0-9\s]+$/,
      });
    });

    it("includes sanitized_html validator", () => {
      const multiLineTextGenerator = new MultiLineTextFieldGenerator({
        field: createMockField({
          label: "Sanitized MultiLineText",
          api_key: "sanitized_multi_line_text",
          validators: { sanitized_html: {} },
        }),
      });

      const config = multiLineTextGenerator.generateBuildConfig();
      expect(config.body?.validators?.sanitized_html).toEqual({
        sanitize_before_validation: true,
      });
    });

    it("combines multiple validators", () => {
      const multiLineTextGenerator = new MultiLineTextFieldGenerator({
        field: createMockField({
          label: "Multi Validator MultiLineText",
          api_key: "multi_validator_multi_line_text",
          validators: {
            required: {},
            length: { min: 20, max: 500 },
            format: { predefined_pattern: "no_html" },
            sanitized_html: {},
          },
        }),
      });

      const config = multiLineTextGenerator.generateBuildConfig();
      expect(config.body?.validators).toEqual({
        required: true,
        length: { min: 20, max: 500 },
        format: { predefined_pattern: "no_html" },
        sanitized_html: { sanitize_before_validation: true },
      });
    });

    it("handles partial length validator", () => {
      const multiLineTextGenerator = new MultiLineTextFieldGenerator({
        field: createMockField({
          label: "Min Only MultiLineText",
          api_key: "min_only_multi_line_text",
          validators: { length: { min: 15 } },
        }),
      });

      const config = multiLineTextGenerator.generateBuildConfig();
      expect(config.body?.validators?.length).toEqual({ min: 15 });
    });
  });

  describe("Method call generation", () => {
    it("generates correct method call string", () => {
      const multiLineTextGenerator = new MultiLineTextFieldGenerator({
        field: createMockField({
          label: "Test MultiLineText",
          api_key: "test_multi_line_text",
          hint: "Test hint",
        }),
      });

      const methodCall = multiLineTextGenerator.generateMethodCall();
      expect(methodCall).toContain(".addMultiLineText(");
      expect(methodCall).toContain('label: "Test MultiLineText"');
      expect(methodCall).toContain('api_key: "test_multi_line_text"');
      expect(methodCall).toContain('hint: "Test hint"');
    });

    it("generates minimal method call", () => {
      const multiLineTextGenerator = new MultiLineTextFieldGenerator({
        field: createMockField({
          label: "Simple",
          api_key: "simple",
        }),
      });

      const methodCall = multiLineTextGenerator.generateMethodCall();
      expect(methodCall).toContain(".addMultiLineText(");
      expect(methodCall).toContain('label: "Simple"');
      expect(methodCall).toContain('api_key: "simple"');
      expect(methodCall).not.toContain("hint");
      expect(methodCall).not.toContain("validators");
    });
  });
});
