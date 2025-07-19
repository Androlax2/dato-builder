import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import type { MarkdownConfig } from "@/Fields/Markdown";
import { MarkdownFieldGenerator } from "@/FileGeneration/FieldGenerators/MarkdownFieldGenerator";

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
      editor: "markdown",
      parameters: { toolbar: ["heading", "bold", "italic"] },
    },
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("MarkdownFieldGenerator", () => {
  describe("Basic functionality", () => {
    it("can generate a markdown field with label and toolbar", () => {
      const markdownGenerator = new MarkdownFieldGenerator({
        field: createMockField({
          label: "Markdown Content",
          api_key: "markdown_content",
        }),
      });

      expect(markdownGenerator.generateBuildConfig()).toEqual({
        label: "Markdown Content",
        toolbar: ["heading", "bold", "italic"],
        body: {
          api_key: "markdown_content",
        },
      } satisfies MarkdownConfig);
    });

    it("returns correct method call name", () => {
      const markdownGenerator = new MarkdownFieldGenerator({
        field: createMockField({
          label: "Test",
          api_key: "test",
        }),
      });

      expect(markdownGenerator.getMethodCallName()).toBe("addMarkdown");
    });

    it("includes hint when present", () => {
      const markdownGenerator = new MarkdownFieldGenerator({
        field: createMockField({
          label: "Markdown with Hint",
          api_key: "markdown_with_hint",
          hint: "This is a hint",
        }),
      });

      const config = markdownGenerator.generateBuildConfig();
      expect(config.body?.hint).toBe("This is a hint");
    });

    it("includes default_value when present", () => {
      const markdownGenerator = new MarkdownFieldGenerator({
        field: createMockField({
          label: "Markdown with Default",
          api_key: "markdown_with_default",
          default_value: "# Default Content",
        }),
      });

      const config = markdownGenerator.generateBuildConfig();
      expect(config.body?.default_value).toBe("# Default Content");
    });

    it("handles empty toolbar", () => {
      const markdownGenerator = new MarkdownFieldGenerator({
        field: createMockField({
          label: "Markdown Empty Toolbar",
          api_key: "markdown_empty_toolbar",
          appearance: {
            addons: [],
            editor: "markdown",
            parameters: { toolbar: [] },
          },
        }),
      });

      const config = markdownGenerator.generateBuildConfig();
      expect(config.toolbar).toEqual([]);
    });

    it("handles missing toolbar parameter", () => {
      const markdownGenerator = new MarkdownFieldGenerator({
        field: createMockField({
          label: "Markdown No Toolbar",
          api_key: "markdown_no_toolbar",
          appearance: {
            addons: [],
            editor: "markdown",
            parameters: {},
          },
        }),
      });

      const config = markdownGenerator.generateBuildConfig();
      expect(config.toolbar).toEqual([]);
    });
  });

  describe("Validators", () => {
    it("includes required validator", () => {
      const markdownGenerator = new MarkdownFieldGenerator({
        field: createMockField({
          label: "Required Markdown",
          api_key: "required_markdown",
          validators: { required: {} },
        }),
      });

      const config = markdownGenerator.generateBuildConfig();
      expect(config.body?.validators?.required).toBe(true);
    });

    it("includes length validator", () => {
      const markdownGenerator = new MarkdownFieldGenerator({
        field: createMockField({
          label: "Length Markdown",
          api_key: "length_markdown",
          validators: { length: { min: 10, max: 100 } },
        }),
      });

      const config = markdownGenerator.generateBuildConfig();
      expect(config.body?.validators?.length).toEqual({ min: 10, max: 100 });
    });

    it("includes format validator", () => {
      const markdownGenerator = new MarkdownFieldGenerator({
        field: createMockField({
          label: "Format Markdown",
          api_key: "format_markdown",
          validators: { format: { predefined_pattern: "email" } },
        }),
      });

      const config = markdownGenerator.generateBuildConfig();
      expect(config.body?.validators?.format).toEqual({
        predefined_pattern: "email",
      });
    });

    it("includes sanitized_html validator", () => {
      const markdownGenerator = new MarkdownFieldGenerator({
        field: createMockField({
          label: "Sanitized Markdown",
          api_key: "sanitized_markdown",
          validators: { sanitized_html: {} },
        }),
      });

      const config = markdownGenerator.generateBuildConfig();
      expect(config.body?.validators?.sanitized_html).toEqual({
        sanitize_before_validation: true,
      });
    });

    it("combines multiple validators", () => {
      const markdownGenerator = new MarkdownFieldGenerator({
        field: createMockField({
          label: "Multi Validator Markdown",
          api_key: "multi_validator_markdown",
          validators: {
            required: {},
            length: { min: 5, max: 50 },
            sanitized_html: {},
          },
        }),
      });

      const config = markdownGenerator.generateBuildConfig();
      expect(config.body?.validators).toEqual({
        required: true,
        length: { min: 5, max: 50 },
        sanitized_html: { sanitize_before_validation: true },
      });
    });
  });

  describe("Method call generation", () => {
    it("generates correct method call string", () => {
      const markdownGenerator = new MarkdownFieldGenerator({
        field: createMockField({
          label: "Test Markdown",
          api_key: "test_markdown",
          hint: "Test hint",
        }),
      });

      const methodCall = markdownGenerator.generateMethodCall();
      expect(methodCall).toContain(".addMarkdown(");
      expect(methodCall).toContain('label: "Test Markdown"');
      expect(methodCall).toContain('api_key: "test_markdown"');
      expect(methodCall).toContain('hint: "Test hint"');
    });
  });
});
