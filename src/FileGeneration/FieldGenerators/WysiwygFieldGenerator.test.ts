import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import type { WysiwygConfig } from "@/Fields/Wysiwyg";
import { WysiwygFieldGenerator } from "@/FileGeneration/FieldGenerators/WysiwygFieldGenerator";

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
      editor: "wysiwyg",
      parameters: { toolbar: ["format", "bold", "italic", "link"] },
    },
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("WysiwygFieldGenerator", () => {
  describe("Basic functionality", () => {
    it("can generate a wysiwyg field with label and toolbar", () => {
      const wysiwygGenerator = new WysiwygFieldGenerator({
        field: createMockField({
          label: "Rich Text Content",
          api_key: "rich_text_content",
        }),
      });

      expect(wysiwygGenerator.generateBuildConfig()).toEqual({
        label: "Rich Text Content",
        toolbar: ["format", "bold", "italic", "link"],
        body: {
          api_key: "rich_text_content",
        },
      } satisfies WysiwygConfig);
    });

    it("returns correct method call name", () => {
      const wysiwygGenerator = new WysiwygFieldGenerator({
        field: createMockField({
          label: "Test",
          api_key: "test",
        }),
      });

      expect(wysiwygGenerator.getMethodCallName()).toBe("addWysiwyg");
    });

    it("includes hint when present", () => {
      const wysiwygGenerator = new WysiwygFieldGenerator({
        field: createMockField({
          label: "Wysiwyg with Hint",
          api_key: "wysiwyg_with_hint",
          hint: "This is a hint",
        }),
      });

      const config = wysiwygGenerator.generateBuildConfig();
      expect(config.body?.hint).toBe("This is a hint");
    });

    it("includes default_value when present", () => {
      const wysiwygGenerator = new WysiwygFieldGenerator({
        field: createMockField({
          label: "Wysiwyg with Default",
          api_key: "wysiwyg_with_default",
          default_value: "<p>Default content</p>",
        }),
      });

      const config = wysiwygGenerator.generateBuildConfig();
      expect(config.body?.default_value).toBe("<p>Default content</p>");
    });

    it("handles comprehensive toolbar", () => {
      const wysiwygGenerator = new WysiwygFieldGenerator({
        field: createMockField({
          label: "Full Toolbar Wysiwyg",
          api_key: "full_toolbar_wysiwyg",
          appearance: {
            addons: [],
            editor: "wysiwyg",
            parameters: {
              toolbar: [
                "format",
                "bold",
                "italic",
                "strikethrough",
                "code",
                "ordered_list",
                "unordered_list",
                "quote",
                "table",
                "link",
                "image",
                "show_source",
                "undo",
                "redo",
                "align_left",
                "align_center",
                "align_right",
                "align_justify",
                "outdent",
                "indent",
                "fullscreen",
              ],
            },
          },
        }),
      });

      const config = wysiwygGenerator.generateBuildConfig();
      expect(config.toolbar).toEqual([
        "format",
        "bold",
        "italic",
        "strikethrough",
        "code",
        "ordered_list",
        "unordered_list",
        "quote",
        "table",
        "link",
        "image",
        "show_source",
        "undo",
        "redo",
        "align_left",
        "align_center",
        "align_right",
        "align_justify",
        "outdent",
        "indent",
        "fullscreen",
      ]);
    });

    it("handles empty toolbar", () => {
      const wysiwygGenerator = new WysiwygFieldGenerator({
        field: createMockField({
          label: "Empty Toolbar Wysiwyg",
          api_key: "empty_toolbar_wysiwyg",
          appearance: {
            addons: [],
            editor: "wysiwyg",
            parameters: { toolbar: [] },
          },
        }),
      });

      const config = wysiwygGenerator.generateBuildConfig();
      expect(config.toolbar).toEqual([]);
    });

    it("handles missing toolbar parameter", () => {
      const wysiwygGenerator = new WysiwygFieldGenerator({
        field: createMockField({
          label: "No Toolbar Wysiwyg",
          api_key: "no_toolbar_wysiwyg",
          appearance: {
            addons: [],
            editor: "wysiwyg",
            parameters: {},
          },
        }),
      });

      const config = wysiwygGenerator.generateBuildConfig();
      expect(config.toolbar).toEqual([]);
    });
  });

  describe("Validators", () => {
    it("includes required validator", () => {
      const wysiwygGenerator = new WysiwygFieldGenerator({
        field: createMockField({
          label: "Required Wysiwyg",
          api_key: "required_wysiwyg",
          validators: { required: {} },
        }),
      });

      const config = wysiwygGenerator.generateBuildConfig();
      expect(config.body?.validators?.required).toBe(true);
    });

    it("includes length validator", () => {
      const wysiwygGenerator = new WysiwygFieldGenerator({
        field: createMockField({
          label: "Length Wysiwyg",
          api_key: "length_wysiwyg",
          validators: { length: { min: 10, max: 500 } },
        }),
      });

      const config = wysiwygGenerator.generateBuildConfig();
      expect(config.body?.validators?.length).toEqual({ min: 10, max: 500 });
    });

    it("includes format validator", () => {
      const wysiwygGenerator = new WysiwygFieldGenerator({
        field: createMockField({
          label: "Format Wysiwyg",
          api_key: "format_wysiwyg",
          validators: { format: { custom_pattern: "^<p>.*</p>$" } },
        }),
      });

      const config = wysiwygGenerator.generateBuildConfig();
      expect(config.body?.validators?.format).toEqual({
        custom_pattern: "^<p>.*</p>$",
      });
    });

    it("includes sanitized_html validator", () => {
      const wysiwygGenerator = new WysiwygFieldGenerator({
        field: createMockField({
          label: "Sanitized Wysiwyg",
          api_key: "sanitized_wysiwyg",
          validators: { sanitized_html: {} },
        }),
      });

      const config = wysiwygGenerator.generateBuildConfig();
      expect(config.body?.validators?.sanitized_html).toEqual({
        sanitize_before_validation: true,
      });
    });

    it("combines multiple validators", () => {
      const wysiwygGenerator = new WysiwygFieldGenerator({
        field: createMockField({
          label: "Multi Validator Wysiwyg",
          api_key: "multi_validator_wysiwyg",
          validators: {
            required: {},
            length: { min: 20, max: 1000 },
            sanitized_html: {},
          },
        }),
      });

      const config = wysiwygGenerator.generateBuildConfig();
      expect(config.body?.validators).toEqual({
        required: true,
        length: { min: 20, max: 1000 },
        sanitized_html: { sanitize_before_validation: true },
      });
    });
  });

  describe("Method call generation", () => {
    it("generates correct method call string", () => {
      const wysiwygGenerator = new WysiwygFieldGenerator({
        field: createMockField({
          label: "Test Wysiwyg",
          api_key: "test_wysiwyg",
          hint: "Test hint",
        }),
      });

      const methodCall = wysiwygGenerator.generateMethodCall();
      expect(methodCall).toContain(".addWysiwyg(");
      expect(methodCall).toContain('label: "Test Wysiwyg"');
      expect(methodCall).toContain('api_key: "test_wysiwyg"');
      expect(methodCall).toContain('hint: "Test hint"');
    });
  });
});
