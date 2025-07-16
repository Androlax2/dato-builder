import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { BooleanFieldGenerator } from "@/FileGeneration/FieldGenerators/BooleanFieldGenerator";
import { BooleanRadioGroupFieldGenerator } from "@/FileGeneration/FieldGenerators/BooleanRadioGroupFieldGenerator";
import { ColorPickerFieldGenerator } from "@/FileGeneration/FieldGenerators/ColorPickerFieldGenerator";
import { DateFieldGenerator } from "@/FileGeneration/FieldGenerators/DateFieldGenerator";
import { DateTimeFieldGenerator } from "@/FileGeneration/FieldGenerators/DateTimeFieldGenerator";
import { EmailFieldGenerator } from "@/FileGeneration/FieldGenerators/EmailFieldGenerator";
import { ExternalVideoFieldGenerator } from "@/FileGeneration/FieldGenerators/ExternalVideoFieldGenerator";
import type {
  FieldGenerator,
  FieldGeneratorConfig,
} from "@/FileGeneration/FieldGenerators/FieldGenerator";
import { FloatFieldGenerator } from "@/FileGeneration/FieldGenerators/FloatFieldGenerator";
import { GalleryFieldGenerator } from "@/FileGeneration/FieldGenerators/GalleryFieldGenerator";
import { IntegerFieldGenerator } from "@/FileGeneration/FieldGenerators/IntegerFieldGenerator";
import { JsonFieldGenerator } from "@/FileGeneration/FieldGenerators/JsonFieldGenerator";
import { LinkFieldGenerator } from "@/FileGeneration/FieldGenerators/LinkFieldGenerator";
import { LinksFieldGenerator } from "@/FileGeneration/FieldGenerators/LinksFieldGenerator";
import { LocationFieldGenerator } from "@/FileGeneration/FieldGenerators/LocationFieldGenerator";
import { MarkdownFieldGenerator } from "@/FileGeneration/FieldGenerators/MarkdownFieldGenerator";
import { MultiLineTextFieldGenerator } from "@/FileGeneration/FieldGenerators/MultiLineTextFieldGenerator";
import { RichTextFieldGenerator } from "@/FileGeneration/FieldGenerators/RichTextFieldGenerator";
import { SeoFieldGenerator } from "@/FileGeneration/FieldGenerators/SeoFieldGenerator";
import { SingleAssetFieldGenerator } from "@/FileGeneration/FieldGenerators/SingleAssetFieldGenerator";
import { SingleBlockFieldGenerator } from "@/FileGeneration/FieldGenerators/SingleBlockFieldGenerator";
import { SingleLineStringFieldGenerator } from "@/FileGeneration/FieldGenerators/SingleLineStringFieldGenerator";
import { SlugFieldGenerator } from "@/FileGeneration/FieldGenerators/SlugFieldGenerator";
import { StringCheckboxGroupFieldGenerator } from "@/FileGeneration/FieldGenerators/StringCheckboxGroupFieldGenerator";
import { StringMultiSelectFieldGenerator } from "@/FileGeneration/FieldGenerators/StringMultiSelectFieldGenerator";
import { StringRadioGroupFieldGenerator } from "@/FileGeneration/FieldGenerators/StringRadioGroupFieldGenerator";
import { StringSelectFieldGenerator } from "@/FileGeneration/FieldGenerators/StringSelectFieldGenerator";
import { StructuredTextFieldGenerator } from "@/FileGeneration/FieldGenerators/StructuredTextFieldGenerator";
import { TextareaFieldGenerator } from "@/FileGeneration/FieldGenerators/TextareaFieldGenerator";
import { UrlFieldGenerator } from "@/FileGeneration/FieldGenerators/UrlFieldGenerator";
import { WysiwygFieldGenerator } from "@/FileGeneration/FieldGenerators/WysiwygFieldGenerator";
import type { ItemTypeBuilderAddMethods } from "@/types/ItemTypeBuilderFields";

type FieldGeneratorConstructor = new (
  config: FieldGeneratorConfig,
) => FieldGenerator<ItemTypeBuilderAddMethods>;

export class FieldGeneratorFactory {
  /**
   * Main factory method that determines the correct generator based on field type and appearance
   */
  createGenerator(
    config: FieldGeneratorConfig,
  ): FieldGenerator<ItemTypeBuilderAddMethods> {
    const field = config.field;

    const GeneratorClass = this.getGeneratorClass(field);
    return new GeneratorClass(config);
  }

  /**
   * Complex mapping logic to determine the correct generator class
   */
  private getGeneratorClass(field: Field): FieldGeneratorConstructor {
    // Handle text fields with special logic for appearance.editor
    if (field.field_type === "text") {
      return this.getTextFieldGenerator(field);
    }

    // Handle boolean fields with special logic for appearance.editor
    if (field.field_type === "boolean") {
      return this.getBooleanFieldGenerator(field);
    }

    // Handle string fields with special logic for appearance.editor and validators
    if (field.field_type === "string") {
      return this.getStringFieldGenerator(field);
    }

    // Handle json fields with special logic for appearance.editor
    if (field.field_type === "json") {
      return this.getJsonFieldGenerator(field);
    }

    const generatorMap: Record<
      Exclude<Field["field_type"], "text" | "boolean" | "string" | "json">,
      FieldGeneratorConstructor
    > = {
      color: ColorPickerFieldGenerator,
      date: DateFieldGenerator,
      date_time: DateTimeFieldGenerator,
      file: SingleAssetFieldGenerator,
      float: FloatFieldGenerator,
      gallery: GalleryFieldGenerator,
      integer: IntegerFieldGenerator,
      lat_lon: LocationFieldGenerator,
      link: LinkFieldGenerator,
      rich_text: RichTextFieldGenerator,
      single_block: SingleBlockFieldGenerator,
      structured_text: StructuredTextFieldGenerator,
      links: LinksFieldGenerator,
      seo: SeoFieldGenerator,
      slug: SlugFieldGenerator,
      video: ExternalVideoFieldGenerator,
    };

    const generatorClass = generatorMap[field.field_type];

    if (!generatorClass) {
      throw new Error(`No generator found for field type: ${field.field_type}`);
    }

    return generatorClass;
  }

  /**
   * Determine which text field generator to use based on appearance.editor
   */
  private getTextFieldGenerator(field: Field): FieldGeneratorConstructor {
    const editor = field.appearance?.editor;

    switch (editor) {
      case "markdown":
        return MarkdownFieldGenerator;
      case "wysiwyg":
        return WysiwygFieldGenerator;
      case "textarea":
        return TextareaFieldGenerator;
      default:
        return MultiLineTextFieldGenerator;
    }
  }

  /**
   * Determine which boolean field generator to use based on appearance.editor
   */
  private getBooleanFieldGenerator(field: Field): FieldGeneratorConstructor {
    const editor = field.appearance?.editor;

    switch (editor) {
      case "boolean_radio_group":
        return BooleanRadioGroupFieldGenerator;
      default:
        return BooleanFieldGenerator;
    }
  }

  /**
   * Determine which string field generator to use based on appearance.editor and validators
   */
  private getStringFieldGenerator(field: Field): FieldGeneratorConstructor {
    const editor = field.appearance?.editor;
    const validators = field.validators as any;

    // Check for email format validator
    if (validators?.format?.predefined_pattern === "email") {
      return EmailFieldGenerator;
    }

    // Check for URL format validator
    if (validators?.format?.predefined_pattern === "url") {
      return UrlFieldGenerator;
    }

    // Check appearance.editor for other string field types
    switch (editor) {
      case "single_line":
        return SingleLineStringFieldGenerator;
      case "string_radio_group":
        return StringRadioGroupFieldGenerator;
      case "string_select":
        return StringSelectFieldGenerator;
      default:
        // Default to SingleLineString for plain string fields
        return SingleLineStringFieldGenerator;
    }
  }

  /**
   * Determine which JSON field generator to use based on appearance.editor
   */
  private getJsonFieldGenerator(field: Field): FieldGeneratorConstructor {
    const editor = field.appearance?.editor;

    switch (editor) {
      case "string_multi_select":
        return StringMultiSelectFieldGenerator;
      case "string_checkbox_group":
        return StringCheckboxGroupFieldGenerator;
      default:
        return JsonFieldGenerator;
    }
  }
}
