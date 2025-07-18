import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import type { TextareaConfig } from "@/Fields/Textarea";
import { TextareaFieldGenerator } from "@/FileGeneration/FieldGenerators/TextareaFieldGenerator";

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
    appearance: {
      addons: [],
      editor: "textarea",
      parameters: { placeholder: "Enter text here..." },
    },
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("TextareaFieldGenerator", () => {
  describe("Basic functionality", () => {
    it("can generate a textarea field with label and placeholder", () => {
      const textareaGenerator = new TextareaFieldGenerator({
        field: createMockField({
          label: "Description",
          api_key: "description",
        }),
      });

      expect(textareaGenerator.generateBuildConfig()).toEqual({
        label: "Description",
        placeholder: "Enter text here...",
        body: {
          api_key: "description",
        },
      } satisfies TextareaConfig);
    });

    it("returns correct method call name", () => {
      const textareaGenerator = new TextareaFieldGenerator({
        field: createMockField({
          label: "Test",
          api_key: "test",
        }),
      });

      expect(textareaGenerator.getMethodCallName()).toBe("addTextarea");
    });

    it("includes hint when present", () => {
      const textareaGenerator = new TextareaFieldGenerator({
        field: createMockField({
          label: "Textarea with Hint",
          api_key: "textarea_with_hint",
          hint: "This is a hint",
        }),
      });

      const config = textareaGenerator.generateBuildConfig();
      expect(config.body?.hint).toBe("This is a hint");
    });

    it("includes default_value when present", () => {
      const textareaGenerator = new TextareaFieldGenerator({
        field: createMockField({
          label: "Textarea with Default",
          api_key: "textarea_with_default",
          default_value: "Default text content",
        }),
      });

      const config = textareaGenerator.generateBuildConfig();
      expect(config.body?.default_value).toBe("Default text content");
    });

    it("handles custom placeholder", () => {
      const textareaGenerator = new TextareaFieldGenerator({
        field: createMockField({
          label: "Custom Placeholder",
          api_key: "custom_placeholder",
          appearance: {
            addons: [],
            editor: "textarea",
            parameters: { placeholder: "Custom placeholder text" },
          },
        }),
      });

      const config = textareaGenerator.generateBuildConfig();
      expect(config.placeholder).toBe("Custom placeholder text");
    });

    it("handles missing placeholder parameter", () => {
      const textareaGenerator = new TextareaFieldGenerator({
        field: createMockField({
          label: "No Placeholder",
          api_key: "no_placeholder",
          appearance: {
            addons: [],
            editor: "textarea",
            parameters: {},
          },
        }),
      });

      const config = textareaGenerator.generateBuildConfig();
      expect(config.placeholder).toBeUndefined();
    });

    it("handles empty placeholder", () => {
      const textareaGenerator = new TextareaFieldGenerator({
        field: createMockField({
          label: "Empty Placeholder",
          api_key: "empty_placeholder",
          appearance: {
            addons: [],
            editor: "textarea",
            parameters: { placeholder: "" },
          },
        }),
      });

      const config = textareaGenerator.generateBuildConfig();
      expect(config.placeholder).toBeUndefined();
    });
  });

  describe("Validators", () => {
    it("includes required validator", () => {
      const textareaGenerator = new TextareaFieldGenerator({
        field: createMockField({
          label: "Required Textarea",
          api_key: "required_textarea",
          validators: { required: {} },
        }),
      });

      const config = textareaGenerator.generateBuildConfig();
      expect(config.body?.validators?.required).toBe(true);
    });

    it("includes length validator", () => {
      const textareaGenerator = new TextareaFieldGenerator({
        field: createMockField({
          label: "Length Textarea",
          api_key: "length_textarea",
          validators: { length: { min: 5, max: 200 } },
        }),
      });

      const config = textareaGenerator.generateBuildConfig();
      expect(config.body?.validators?.length).toEqual({ min: 5, max: 200 });
    });

    it("includes format validator", () => {
      const textareaGenerator = new TextareaFieldGenerator({
        field: createMockField({
          label: "Format Textarea",
          api_key: "format_textarea",
          validators: { format: { predefined_pattern: "url" } },
        }),
      });

      const config = textareaGenerator.generateBuildConfig();
      expect(config.body?.validators?.format).toEqual({
        predefined_pattern: "url",
      });
    });

    it("includes sanitized_html validator", () => {
      const textareaGenerator = new TextareaFieldGenerator({
        field: createMockField({
          label: "Sanitized Textarea",
          api_key: "sanitized_textarea",
          validators: { sanitized_html: {} },
        }),
      });

      const config = textareaGenerator.generateBuildConfig();
      expect(config.body?.validators?.sanitized_html).toEqual({
        sanitize_before_validation: true,
      });
    });

    it("combines multiple validators", () => {
      const textareaGenerator = new TextareaFieldGenerator({
        field: createMockField({
          label: "Multi Validator Textarea",
          api_key: "multi_validator_textarea",
          validators: {
            required: {},
            length: { min: 10, max: 300 },
            sanitized_html: {},
          },
        }),
      });

      const config = textareaGenerator.generateBuildConfig();
      expect(config.body?.validators).toEqual({
        required: true,
        length: { min: 10, max: 300 },
        sanitized_html: { sanitize_before_validation: true },
      });
    });
  });

  describe("Method call generation", () => {
    it("generates correct method call string", () => {
      const textareaGenerator = new TextareaFieldGenerator({
        field: createMockField({
          label: "Test Textarea",
          api_key: "test_textarea",
          hint: "Test hint",
        }),
      });

      const methodCall = textareaGenerator.generateMethodCall();
      expect(methodCall).toContain(".addTextarea(");
      expect(methodCall).toContain('label: "Test Textarea"');
      expect(methodCall).toContain('api_key: "test_textarea"');
      expect(methodCall).toContain('hint: "Test hint"');
    });

    it("generates method call with placeholder", () => {
      const textareaGenerator = new TextareaFieldGenerator({
        field: createMockField({
          label: "Test Textarea",
          api_key: "test_textarea",
          appearance: {
            addons: [],
            editor: "textarea",
            parameters: { placeholder: "Type something..." },
          },
        }),
      });

      const methodCall = textareaGenerator.generateMethodCall();
      expect(methodCall).toContain('placeholder: "Type something..."');
    });
  });
});
