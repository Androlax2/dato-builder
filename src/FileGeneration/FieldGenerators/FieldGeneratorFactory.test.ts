import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { BooleanFieldGenerator } from "@/FileGeneration/FieldGenerators/BooleanFieldGenerator";
import { BooleanRadioGroupFieldGenerator } from "@/FileGeneration/FieldGenerators/BooleanRadioGroupFieldGenerator";
import { ColorPickerFieldGenerator } from "@/FileGeneration/FieldGenerators/ColorPickerFieldGenerator";
import { DateFieldGenerator } from "@/FileGeneration/FieldGenerators/DateFieldGenerator";
import { DateTimeFieldGenerator } from "@/FileGeneration/FieldGenerators/DateTimeFieldGenerator";
import { ExternalVideoFieldGenerator } from "@/FileGeneration/FieldGenerators/ExternalVideoFieldGenerator";
import { FieldGeneratorFactory } from "@/FileGeneration/FieldGenerators/FieldGeneratorFactory";
import { FloatFieldGenerator } from "@/FileGeneration/FieldGenerators/FloatFieldGenerator";
import { GalleryFieldGenerator } from "@/FileGeneration/FieldGenerators/GalleryFieldGenerator";
import { IntegerFieldGenerator } from "@/FileGeneration/FieldGenerators/IntegerFieldGenerator";
import { LocationFieldGenerator } from "@/FileGeneration/FieldGenerators/LocationFieldGenerator";
import { MarkdownFieldGenerator } from "@/FileGeneration/FieldGenerators/MarkdownFieldGenerator";
import { MultiLineTextFieldGenerator } from "@/FileGeneration/FieldGenerators/MultiLineTextFieldGenerator";
import { SeoFieldGenerator } from "@/FileGeneration/FieldGenerators/SeoFieldGenerator";
import { SingleAssetFieldGenerator } from "@/FileGeneration/FieldGenerators/SingleAssetFieldGenerator";
import { SlugFieldGenerator } from "@/FileGeneration/FieldGenerators/SlugFieldGenerator";
import { TextareaFieldGenerator } from "@/FileGeneration/FieldGenerators/TextareaFieldGenerator";
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
  });
});
