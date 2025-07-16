import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { BooleanFieldGenerator } from "@/FileGeneration/FieldGenerators/BooleanFieldGenerator";
import { BooleanRadioGroupFieldGenerator } from "@/FileGeneration/FieldGenerators/BooleanRadioGroupFieldGenerator";
import { ColorPickerFieldGenerator } from "@/FileGeneration/FieldGenerators/ColorPickerFieldGenerator";
import { DateFieldGenerator } from "@/FileGeneration/FieldGenerators/DateFieldGenerator";
import { DateTimeFieldGenerator } from "@/FileGeneration/FieldGenerators/DateTimeFieldGenerator";
import { EmailFieldGenerator } from "@/FileGeneration/FieldGenerators/EmailFieldGenerator";
import { ExternalVideoFieldGenerator } from "@/FileGeneration/FieldGenerators/ExternalVideoFieldGenerator";
import { FieldGeneratorFactory } from "@/FileGeneration/FieldGenerators/FieldGeneratorFactory";
import { FloatFieldGenerator } from "@/FileGeneration/FieldGenerators/FloatFieldGenerator";
import { GalleryFieldGenerator } from "@/FileGeneration/FieldGenerators/GalleryFieldGenerator";
import { IntegerFieldGenerator } from "@/FileGeneration/FieldGenerators/IntegerFieldGenerator";
import { JsonFieldGenerator } from "@/FileGeneration/FieldGenerators/JsonFieldGenerator";
import { LinkFieldGenerator } from "@/FileGeneration/FieldGenerators/LinkFieldGenerator";
import { LinksFieldGenerator } from "@/FileGeneration/FieldGenerators/LinksFieldGenerator";
import { LocationFieldGenerator } from "@/FileGeneration/FieldGenerators/LocationFieldGenerator";
import { MarkdownFieldGenerator } from "@/FileGeneration/FieldGenerators/MarkdownFieldGenerator";
import { MultiLineTextFieldGenerator } from "@/FileGeneration/FieldGenerators/MultiLineTextFieldGenerator";
import { SeoFieldGenerator } from "@/FileGeneration/FieldGenerators/SeoFieldGenerator";
import { SingleAssetFieldGenerator } from "@/FileGeneration/FieldGenerators/SingleAssetFieldGenerator";
import { SingleLineStringFieldGenerator } from "@/FileGeneration/FieldGenerators/SingleLineStringFieldGenerator";
import { SlugFieldGenerator } from "@/FileGeneration/FieldGenerators/SlugFieldGenerator";
import { StringCheckboxGroupFieldGenerator } from "@/FileGeneration/FieldGenerators/StringCheckboxGroupFieldGenerator";
import { StringMultiSelectFieldGenerator } from "@/FileGeneration/FieldGenerators/StringMultiSelectFieldGenerator";
import { StringRadioGroupFieldGenerator } from "@/FileGeneration/FieldGenerators/StringRadioGroupFieldGenerator";
import { StringSelectFieldGenerator } from "@/FileGeneration/FieldGenerators/StringSelectFieldGenerator";
import { TextareaFieldGenerator } from "@/FileGeneration/FieldGenerators/TextareaFieldGenerator";
import { UrlFieldGenerator } from "@/FileGeneration/FieldGenerators/UrlFieldGenerator";
import { WysiwygFieldGenerator } from "@/FileGeneration/FieldGenerators/WysiwygFieldGenerator";

function createMockField(
  overrides: Partial<Field> & Pick<Field, "label" | "api_key" | "field_type">,
): Field {
  const defaults: Omit<Field, "label" | "api_key" | "field_type"> = {
    id: "test-id",
    type: "field",
    hint: null,
    localized: false,
    position: 1,
    validators: {},
    appearance: undefined as any,
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("FieldGeneratorFactory", () => {
  let factory: FieldGeneratorFactory;

  beforeEach(() => {
    factory = new FieldGeneratorFactory();
  });

  describe("Non-text field type mappings", () => {
    it("creates ColorPickerFieldGenerator for color fields", () => {
      const field = createMockField({
        label: "Color",
        api_key: "color",
        field_type: "color",
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(ColorPickerFieldGenerator);
    });

    it("creates DateFieldGenerator for date fields", () => {
      const field = createMockField({
        label: "Date",
        api_key: "date",
        field_type: "date",
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(DateFieldGenerator);
    });

    it("creates DateTimeFieldGenerator for date_time fields", () => {
      const field = createMockField({
        label: "DateTime",
        api_key: "datetime",
        field_type: "date_time",
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(DateTimeFieldGenerator);
    });

    it("creates SingleAssetFieldGenerator for file fields", () => {
      const field = createMockField({
        label: "File",
        api_key: "file",
        field_type: "file",
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(SingleAssetFieldGenerator);
    });

    it("creates FloatFieldGenerator for float fields", () => {
      const field = createMockField({
        label: "Float",
        api_key: "float",
        field_type: "float",
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(FloatFieldGenerator);
    });

    it("creates GalleryFieldGenerator for gallery fields", () => {
      const field = createMockField({
        label: "Gallery",
        api_key: "gallery",
        field_type: "gallery",
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(GalleryFieldGenerator);
    });

    it("creates IntegerFieldGenerator for integer fields", () => {
      const field = createMockField({
        label: "Integer",
        api_key: "integer",
        field_type: "integer",
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(IntegerFieldGenerator);
    });

    it("creates LocationFieldGenerator for lat_lon fields", () => {
      const field = createMockField({
        label: "Location",
        api_key: "location",
        field_type: "lat_lon",
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(LocationFieldGenerator);
    });

    it("creates SeoFieldGenerator for seo fields", () => {
      const field = createMockField({
        label: "SEO",
        api_key: "seo",
        field_type: "seo",
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(SeoFieldGenerator);
    });

    it("creates SlugFieldGenerator for slug fields", () => {
      const field = createMockField({
        label: "Slug",
        api_key: "slug",
        field_type: "slug",
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(SlugFieldGenerator);
    });

    it("creates ExternalVideoFieldGenerator for video fields", () => {
      const field = createMockField({
        label: "Video",
        api_key: "video",
        field_type: "video",
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(ExternalVideoFieldGenerator);
    });

    it("creates LinkFieldGenerator for link fields", () => {
      const field = createMockField({
        label: "Link",
        api_key: "link",
        field_type: "link",
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(LinkFieldGenerator);
    });

    it("creates LinksFieldGenerator for links fields", () => {
      const field = createMockField({
        label: "Links",
        api_key: "links",
        field_type: "links",
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(LinksFieldGenerator);
    });
  });

  describe("Boolean field type mappings", () => {
    it("creates BooleanFieldGenerator for boolean fields with no editor", () => {
      const field = createMockField({
        label: "Boolean",
        api_key: "boolean",
        field_type: "boolean",
        appearance: undefined as any,
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(BooleanFieldGenerator);
    });

    it("creates BooleanRadioGroupFieldGenerator for boolean fields with boolean_radio_group editor", () => {
      const field = createMockField({
        label: "Boolean Radio Group",
        api_key: "boolean_radio_group",
        field_type: "boolean",
        appearance: {
          addons: [],
          editor: "boolean_radio_group",
          parameters: {
            positive_radio: { label: "Yes" },
            negative_radio: { label: "No" },
          },
        } as any,
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(BooleanRadioGroupFieldGenerator);
    });

    it("creates BooleanFieldGenerator for boolean fields with unknown editor", () => {
      const field = createMockField({
        label: "Unknown Editor Boolean",
        api_key: "unknown_editor_boolean",
        field_type: "boolean",
        appearance: {
          addons: [],
          editor: "unknown_editor" as any,
          parameters: {},
        } as any,
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(BooleanFieldGenerator);
    });
  });

  describe("Text field type mappings", () => {
    it("creates MarkdownFieldGenerator for text fields with markdown editor", () => {
      const field = createMockField({
        label: "Markdown",
        api_key: "markdown",
        field_type: "text",
        appearance: {
          addons: [],
          editor: "markdown",
          parameters: { toolbar: ["bold", "italic"] },
        },
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(MarkdownFieldGenerator);
    });

    it("creates WysiwygFieldGenerator for text fields with wysiwyg editor", () => {
      const field = createMockField({
        label: "Wysiwyg",
        api_key: "wysiwyg",
        field_type: "text",
        appearance: {
          addons: [],
          editor: "wysiwyg",
          parameters: { toolbar: ["bold", "italic"] },
        },
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(WysiwygFieldGenerator);
    });

    it("creates TextareaFieldGenerator for text fields with textarea editor", () => {
      const field = createMockField({
        label: "Textarea",
        api_key: "textarea",
        field_type: "text",
        appearance: {
          addons: [],
          editor: "textarea",
          parameters: { placeholder: "Enter text..." },
        },
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(TextareaFieldGenerator);
    });

    it("creates MultiLineTextFieldGenerator for text fields with no editor", () => {
      const field = createMockField({
        label: "MultiLineText",
        api_key: "multi_line_text",
        field_type: "text",
        appearance: undefined as any,
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(MultiLineTextFieldGenerator);
    });

    it("creates MultiLineTextFieldGenerator for text fields with empty appearance", () => {
      const field = createMockField({
        label: "MultiLineText",
        api_key: "multi_line_text",
        field_type: "text",
        appearance: { addons: [], editor: "plain", parameters: {} } as any,
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(MultiLineTextFieldGenerator);
    });

    it("creates MultiLineTextFieldGenerator for text fields with unknown editor", () => {
      const field = createMockField({
        label: "Unknown Editor",
        api_key: "unknown_editor",
        field_type: "text",
        appearance: {
          addons: [],
          editor: "unknown_editor" as any,
          parameters: {},
        },
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(MultiLineTextFieldGenerator);
    });
  });

  describe("String field type mappings", () => {
    it("creates EmailFieldGenerator for string fields with email format validator", () => {
      const field = createMockField({
        label: "Email",
        api_key: "email",
        field_type: "string",
        validators: {
          format: {
            predefined_pattern: "email",
          },
        } as any,
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(EmailFieldGenerator);
    });

    it("creates UrlFieldGenerator for string fields with url format validator", () => {
      const field = createMockField({
        label: "URL",
        api_key: "url",
        field_type: "string",
        validators: {
          format: {
            predefined_pattern: "url",
          },
        } as any,
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(UrlFieldGenerator);
    });

    it("creates SingleLineStringFieldGenerator for string fields with single_line editor", () => {
      const field = createMockField({
        label: "Single Line String",
        api_key: "single_line_string",
        field_type: "string",
        appearance: {
          addons: [],
          editor: "single_line",
          parameters: { heading: false, placeholder: "" },
        } as any,
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(SingleLineStringFieldGenerator);
    });

    it("creates StringRadioGroupFieldGenerator for string fields with string_radio_group editor", () => {
      const field = createMockField({
        label: "String Radio Group",
        api_key: "string_radio_group",
        field_type: "string",
        appearance: {
          addons: [],
          editor: "string_radio_group",
          parameters: {
            radios: [
              { label: "Option 1", value: "option1" },
              { label: "Option 2", value: "option2" },
            ],
          },
        } as any,
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(StringRadioGroupFieldGenerator);
    });

    it("creates StringSelectFieldGenerator for string fields with string_select editor", () => {
      const field = createMockField({
        label: "String Select",
        api_key: "string_select",
        field_type: "string",
        appearance: {
          addons: [],
          editor: "string_select",
          parameters: {
            options: [
              { label: "Choice 1", value: "choice1" },
              { label: "Choice 2", value: "choice2" },
            ],
          },
        } as any,
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(StringSelectFieldGenerator);
    });

    it("creates SingleLineStringFieldGenerator for string fields with no editor", () => {
      const field = createMockField({
        label: "Plain String",
        api_key: "plain_string",
        field_type: "string",
        appearance: undefined as any,
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(SingleLineStringFieldGenerator);
    });

    it("creates SingleLineStringFieldGenerator for string fields with unknown editor", () => {
      const field = createMockField({
        label: "Unknown Editor String",
        api_key: "unknown_editor_string",
        field_type: "string",
        appearance: {
          addons: [],
          editor: "unknown_editor" as any,
          parameters: {},
        } as any,
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(SingleLineStringFieldGenerator);
    });
  });

  describe("JSON field type mappings", () => {
    it("creates JsonFieldGenerator for json fields with no editor", () => {
      const field = createMockField({
        label: "JSON",
        api_key: "json",
        field_type: "json",
        appearance: undefined as any,
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(JsonFieldGenerator);
    });

    it("creates StringMultiSelectFieldGenerator for json fields with string_multi_select editor", () => {
      const field = createMockField({
        label: "String Multi Select",
        api_key: "string_multi_select",
        field_type: "json",
        appearance: {
          addons: [],
          editor: "string_multi_select",
          parameters: {
            options: [
              { label: "Option 1", value: "option1" },
              { label: "Option 2", value: "option2" },
            ],
          },
        } as any,
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(StringMultiSelectFieldGenerator);
    });

    it("creates StringCheckboxGroupFieldGenerator for json fields with string_checkbox_group editor", () => {
      const field = createMockField({
        label: "String Checkbox Group",
        api_key: "string_checkbox_group",
        field_type: "json",
        appearance: {
          addons: [],
          editor: "string_checkbox_group",
          parameters: {
            options: [
              { label: "Feature A", value: "feature_a" },
              { label: "Feature B", value: "feature_b" },
            ],
          },
        } as any,
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(StringCheckboxGroupFieldGenerator);
    });

    it("creates JsonFieldGenerator for json fields with unknown editor", () => {
      const field = createMockField({
        label: "Unknown Editor JSON",
        api_key: "unknown_editor_json",
        field_type: "json",
        appearance: {
          addons: [],
          editor: "unknown_editor" as any,
          parameters: {},
        } as any,
      });

      const generator = factory.createGenerator({ field });
      expect(generator).toBeInstanceOf(JsonFieldGenerator);
    });
  });

  describe("Error handling", () => {
    it("throws error for unsupported field type", () => {
      const field = createMockField({
        label: "Unsupported",
        api_key: "unsupported",
        field_type: "unsupported_type" as any,
      });

      expect(() => factory.createGenerator({ field })).toThrow(
        "No generator found for field type: unsupported_type",
      );
    });

    it("throws error for null field_type", () => {
      const field = createMockField({
        label: "Null Type",
        api_key: "null_type",
        field_type: null as any,
      });

      expect(() => factory.createGenerator({ field })).toThrow(
        "No generator found for field type: null",
      );
    });

    it("throws error for undefined field_type", () => {
      const field = createMockField({
        label: "Undefined Type",
        api_key: "undefined_type",
        field_type: undefined as any,
      });

      expect(() => factory.createGenerator({ field })).toThrow(
        "No generator found for field type: undefined",
      );
    });
  });

  describe("Generator consistency", () => {
    it("all generators have correct method names", () => {
      const testCases = [
        { fieldType: "color", expected: "addColorPicker" },
        { fieldType: "date", expected: "addDate" },
        { fieldType: "date_time", expected: "addDateTime" },
        { fieldType: "file", expected: "addSingleAsset" },
        { fieldType: "float", expected: "addFloat" },
        { fieldType: "gallery", expected: "addAssetGallery" },
        { fieldType: "integer", expected: "addInteger" },
        { fieldType: "lat_lon", expected: "addLocation" },
        { fieldType: "link", expected: "addLink" },
        { fieldType: "links", expected: "addLinks" },
        { fieldType: "seo", expected: "addSeo" },
        { fieldType: "slug", expected: "addSlug" },
        { fieldType: "video", expected: "addExternalVideo" },
      ];

      testCases.forEach(({ fieldType, expected }) => {
        const field = createMockField({
          label: "Test",
          api_key: "test",
          field_type: fieldType as any,
        });

        const generator = factory.createGenerator({ field });
        expect(generator.getMethodCallName()).toBe(expected);
      });
    });

    it("all boolean generators have correct method names", () => {
      const testCases = [
        { editor: "boolean_radio_group", expected: "addBooleanRadioGroup" },
        { editor: undefined, expected: "addBoolean" },
      ];

      testCases.forEach(({ editor, expected }) => {
        const field = createMockField({
          label: "Test",
          api_key: "test",
          field_type: "boolean",
          appearance: editor
            ? ({ addons: [], editor, parameters: {} } as any)
            : (undefined as any),
        });

        const generator = factory.createGenerator({ field });
        expect(generator.getMethodCallName()).toBe(expected);
      });
    });

    it("all text generators have correct method names", () => {
      const testCases = [
        { editor: "markdown", expected: "addMarkdown" },
        { editor: "wysiwyg", expected: "addWysiwyg" },
        { editor: "textarea", expected: "addTextarea" },
        { editor: undefined, expected: "addMultiLineText" },
      ];

      testCases.forEach(({ editor, expected }) => {
        const field = createMockField({
          label: "Test",
          api_key: "test",
          field_type: "text",
          appearance: editor
            ? ({ addons: [], editor, parameters: {} } as any)
            : (undefined as any),
        });

        const generator = factory.createGenerator({ field });
        expect(generator.getMethodCallName()).toBe(expected);
      });
    });

    it("all json generators have correct method names", () => {
      const testCases = [
        { editor: "string_multi_select", expected: "addStringMultiSelect" },
        { editor: "string_checkbox_group", expected: "addStringCheckboxGroup" },
        { editor: undefined, expected: "addJson" },
      ];

      testCases.forEach(({ editor, expected }) => {
        const field = createMockField({
          label: "Test",
          api_key: "test",
          field_type: "json",
          appearance: editor
            ? ({ addons: [], editor, parameters: {} } as any)
            : (undefined as any),
        });

        const generator = factory.createGenerator({ field });
        expect(generator.getMethodCallName()).toBe(expected);
      });
    });

    it("all string generators have correct method names", () => {
      const testCases = [
        {
          validators: { format: { predefined_pattern: "email" } },
          expected: "addEmail",
        },
        {
          validators: { format: { predefined_pattern: "url" } },
          expected: "addUrl",
        },
        { editor: "single_line", expected: "addSingleLineString" },
        { editor: "string_radio_group", expected: "addStringRadioGroup" },
        { editor: "string_select", expected: "addStringSelect" },
        { editor: undefined, expected: "addSingleLineString" },
      ];

      testCases.forEach(({ validators, editor, expected }) => {
        const field = createMockField({
          label: "Test",
          api_key: "test",
          field_type: "string",
          ...(validators && { validators: validators as any }),
          appearance: editor
            ? ({ addons: [], editor, parameters: {} } as any)
            : (undefined as any),
        });

        const generator = factory.createGenerator({ field });
        expect(generator.getMethodCallName()).toBe(expected);
      });
    });

    it("all generators can generate method calls", () => {
      const fieldTypes = [
        "color",
        "date",
        "date_time",
        "file",
        "float",
        "gallery",
        "integer",
        "lat_lon",
        "link",
        "links",
        "seo",
        "slug",
        "video",
      ];

      fieldTypes.forEach((fieldType) => {
        const field = createMockField({
          label: "Test",
          api_key: "test",
          field_type: fieldType as any,
        });

        const generator = factory.createGenerator({ field });
        const methodCall = generator.generateMethodCall();
        expect(methodCall).toContain(`.${generator.getMethodCallName()}(`);
      });
    });

    it("all boolean generators can generate method calls", () => {
      const editors = ["boolean_radio_group", undefined];

      editors.forEach((editor) => {
        const field = createMockField({
          label: "Test",
          api_key: "test",
          field_type: "boolean",
          appearance: editor
            ? ({ addons: [], editor, parameters: {} } as any)
            : (undefined as any),
        });

        const generator = factory.createGenerator({ field });
        const methodCall = generator.generateMethodCall();
        expect(methodCall).toContain(`.${generator.getMethodCallName()}(`);
      });
    });

    it("all text generators can generate method calls", () => {
      const editors = ["markdown", "wysiwyg", "textarea", undefined];

      editors.forEach((editor) => {
        const field = createMockField({
          label: "Test",
          api_key: "test",
          field_type: "text",
          appearance: editor
            ? ({ addons: [], editor, parameters: {} } as any)
            : (undefined as any),
        });

        const generator = factory.createGenerator({ field });
        const methodCall = generator.generateMethodCall();
        expect(methodCall).toContain(`.${generator.getMethodCallName()}(`);
      });
    });

    it("all json generators can generate method calls", () => {
      const editors = [
        "string_multi_select",
        "string_checkbox_group",
        undefined,
      ];

      editors.forEach((editor) => {
        const field = createMockField({
          label: "Test",
          api_key: "test",
          field_type: "json",
          appearance: editor
            ? ({ addons: [], editor, parameters: {} } as any)
            : (undefined as any),
        });

        const generator = factory.createGenerator({ field });
        const methodCall = generator.generateMethodCall();
        expect(methodCall).toContain(`.${generator.getMethodCallName()}(`);
      });
    });

    it("all string generators can generate method calls", () => {
      const testCases = [
        { validators: { format: { predefined_pattern: "email" } } },
        { validators: { format: { predefined_pattern: "url" } } },
        { editor: "single_line" },
        { editor: "string_radio_group" },
        { editor: "string_select" },
        { editor: undefined },
      ];

      testCases.forEach(({ validators, editor }) => {
        const field = createMockField({
          label: "Test",
          api_key: "test",
          field_type: "string",
          ...(validators && { validators: validators as any }),
          appearance: editor
            ? ({ addons: [], editor, parameters: {} } as any)
            : (undefined as any),
        });

        const generator = factory.createGenerator({ field });
        const methodCall = generator.generateMethodCall();
        expect(methodCall).toContain(`.${generator.getMethodCallName()}(`);
      });
    });
  });
});
