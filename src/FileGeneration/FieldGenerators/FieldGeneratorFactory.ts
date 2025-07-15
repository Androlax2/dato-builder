import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { ColorPickerFieldGenerator } from "@/FileGeneration/FieldGenerators/ColorPickerFieldGenerator";
import { DateFieldGenerator } from "@/FileGeneration/FieldGenerators/DateFieldGenerator";
import { DateTimeFieldGenerator } from "@/FileGeneration/FieldGenerators/DateTimeFieldGenerator";
import { ExternalVideoFieldGenerator } from "@/FileGeneration/FieldGenerators/ExternalVideoFieldGenerator";
import type {
  FieldGenerator,
  FieldGeneratorConfig,
} from "@/FileGeneration/FieldGenerators/FieldGenerator";
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
import type { ItemTypeBuilderAddMethods } from "@/types/ItemTypeBuilderFields";

type FieldGeneratorConstructor = new (
  config: FieldGeneratorConfig,
) => FieldGenerator<ItemTypeBuilderAddMethods>;

// TODO: Remove the Partial type when all field types are implemented

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

    const generatorMap: Partial<
      Record<Field["field_type"], FieldGeneratorConstructor>
    > = {
      color: ColorPickerFieldGenerator,
      date: DateFieldGenerator,
      date_time: DateTimeFieldGenerator,
      file: SingleAssetFieldGenerator,
      float: FloatFieldGenerator,
      gallery: GalleryFieldGenerator,
      integer: IntegerFieldGenerator,
      lat_lon: LocationFieldGenerator,
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
}
