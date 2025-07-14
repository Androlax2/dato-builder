import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { AssetGalleryGenerator } from "./AssetGalleryGenerator";
// Asset generators
import { AssetGenerator } from "./AssetGenerator";
import {
  BaseFieldGenerator,
  type FieldGeneratorConfig,
} from "./BaseFieldGenerator";
import { ImageGenerator } from "./ImageGenerator";
import { MarkdownGenerator } from "./MarkdownGenerator";
import { MultiLineTextGenerator } from "./MultiLineTextGenerator";
import { SingleAssetGenerator } from "./SingleAssetGenerator";
import { SingleLineStringGenerator } from "./SingleLineStringGenerator";
import { TextareaGenerator } from "./TextareaGenerator";
// Text generators
import { TextGenerator } from "./TextGenerator";
import { WysiwygGenerator } from "./WysiwygGenerator";

/**
 * Default field generator for field types that don't have specialized generators
 */
export class DefaultFieldGenerator extends BaseFieldGenerator {
  private static readonly FIELD_TYPE_MAP: Record<Field["field_type"], string> =
    {
      string: "addSingleLineString",
      text: "addMultiLineText",
      integer: "addInteger",
      float: "addFloat",
      boolean: "addBoolean",
      date: "addDate",
      file: "addSingleAsset",
      gallery: "addAssetGallery",
      video: "addExternalVideo",
      link: "addLink",
      links: "addLinks",
      slug: "addSlug",
      seo: "addSeo",
      lat_lon: "addLocation",
      color: "addColorPicker",
      json: "addJson",
      structured_text: "addStructuredText",
      single_block: "addSingleBlock",
      rich_text: "addModularContent",
      date_time: "addDateTime",
    };

  getMethodName(): string {
    return (
      DefaultFieldGenerator.FIELD_TYPE_MAP[this.field.field_type] ||
      "addSingleLineString"
    );
  }

  generateMethodCall(): string {
    const config = this.generateConfig();
    return `\n    .${this.getMethodName()}(${this.objectToString(config, 2)})`;
  }

  protected generateFieldOptions(): any {
    const options: any = {};

    // Handle field-specific configurations based on field type
    switch (this.field.field_type) {
      case "slug":
        if (this.field.appearance?.url_prefix) {
          options.url_prefix = this.field.appearance.url_prefix;
        }
        if (this.field.appearance?.placeholder) {
          options.placeholder = this.field.appearance.placeholder;
        }
        break;

      case "seo":
        if (this.field.appearance?.seo_fields) {
          options.fields = this.field.appearance.seo_fields;
        }
        if (this.field.appearance?.previews) {
          options.previews = this.field.appearance.previews;
        }
        break;

      case "rich_text":
      case "text":
        if (this.field.appearance?.toolbar) {
          options.toolbar = this.field.appearance.toolbar;
        }
        break;

      case "structured_text":
        if (this.field.appearance?.nodes) {
          options.nodes = this.field.appearance.nodes;
        }
        if (this.field.appearance?.marks) {
          options.marks = this.field.appearance.marks;
        }
        break;

      case "single_block":
        if (this.field.appearance?.start_collapsed !== undefined) {
          options.start_collapsed = this.field.appearance.start_collapsed;
        }
        break;
    }

    // Handle common appearance options
    if (this.field.appearance?.placeholder && !options.placeholder) {
      if (
        this.field.field_type === "text" ||
        this.field.field_type === "string"
      ) {
        options.placeholder = this.field.appearance.placeholder;
      }
    }

    return options;
  }

  protected fieldReferencesOtherItems(): boolean {
    return (
      (this.field.field_type === "rich_text" ||
        this.field.field_type === "single_block" ||
        this.field.field_type === "structured_text") &&
      this.getReferencedItemIds().length > 0
    );
  }

  protected getReferencedItemIds(): string[] {
    const itemIds: string[] = [];
    const validators = this.field.validators as any;

    if (validators?.rich_text_blocks?.item_types) {
      itemIds.push(...validators.rich_text_blocks.item_types);
    }
    if (validators?.single_block?.item_types) {
      itemIds.push(...validators.single_block.item_types);
    }
    if (validators?.structured_text_blocks?.item_types) {
      itemIds.push(...validators.structured_text_blocks.item_types);
    }

    return itemIds;
  }

  protected applyAsyncCalls(body: any, asyncCalls: string[]): void {
    if (this.field.field_type === "rich_text") {
      if (!body.validators.rich_text_blocks)
        body.validators.rich_text_blocks = {};
      body.validators.rich_text_blocks.item_types = `[${asyncCalls.join(", ")}]`;
    } else if (this.field.field_type === "single_block") {
      if (!body.validators.single_block) body.validators.single_block = {};
      body.validators.single_block.item_types = `[${asyncCalls.join(", ")}]`;
    } else if (this.field.field_type === "structured_text") {
      if (!body.validators.structured_text_blocks)
        body.validators.structured_text_blocks = {};
      body.validators.structured_text_blocks.item_types = `[${asyncCalls.join(", ")}]`;
    }
  }
}

export class FieldGeneratorFactory {
  private static readonly customGenerators: Map<
    string,
    typeof BaseFieldGenerator
  > = new Map();

  /**
   * Main factory method that determines the correct generator based on field type and appearance
   */
  static createGenerator(config: FieldGeneratorConfig): BaseFieldGenerator {
    const field = config.field;
    const fieldType = field.field_type;

    // Check for custom registered generators first
    if (FieldGeneratorFactory.customGenerators.has(fieldType)) {
      const GeneratorClass =
        FieldGeneratorFactory.customGenerators.get(fieldType)!;
      return new GeneratorClass(config);
    }

    // Use built-in mapping logic
    const GeneratorClass = FieldGeneratorFactory.getGeneratorClass(field);
    return new GeneratorClass(config);
  }

  /**
   * Complex mapping logic to determine the correct generator class
   */
  private static getGeneratorClass(field: Field): typeof BaseFieldGenerator {
    switch (field.field_type) {
      case "string":
        return SingleLineStringGenerator;

      case "text":
        return FieldGeneratorFactory.getTextGenerator(field);

      case "file":
        return FieldGeneratorFactory.getFileGenerator(field);

      case "gallery":
        return AssetGalleryGenerator;

      default:
        return DefaultFieldGenerator;
    }
  }

  /**
   * Determine the correct text generator based on appearance
   */
  private static getTextGenerator(field: Field): typeof BaseFieldGenerator {
    const editor = field.appearance?.editor;

    switch (editor) {
      case "textarea":
        return TextareaGenerator;
      case "markdown":
        return MarkdownGenerator;
      case "wysiwyg":
        return WysiwygGenerator;
      default:
        return MultiLineTextGenerator;
    }
  }

  /**
   * Determine the correct file generator based on validators
   */
  private static getFileGenerator(field: Field): typeof BaseFieldGenerator {
    const extension = field.validators?.extension;

    // Check if it's specifically constrained to images
    if (extension) {
      if (extension.predefined_list === "image") {
        return ImageGenerator;
      }

      // Check if all custom extensions are image types
      if (Array.isArray(extension.values)) {
        const imageExtensions = [
          "jpg",
          "jpeg",
          "png",
          "gif",
          "webp",
          "svg",
          "bmp",
          "tiff",
        ];
        const allImagesExtensions = extension.values.every((ext) =>
          imageExtensions.includes(ext.toLowerCase()),
        );

        if (allImagesExtensions) {
          return ImageGenerator;
        }
      }
    }

    // Default to generic single asset
    return SingleAssetGenerator;
  }

  /**
   * Register a custom field generator for a specific field type
   */
  static registerGenerator(
    fieldType: string,
    generatorClass: typeof BaseFieldGenerator,
  ): void {
    FieldGeneratorFactory.customGenerators.set(fieldType, generatorClass);
  }

  /**
   * Register a custom generator with appearance-based conditions
   */
  static registerGeneratorWithCondition(
    fieldType: string,
    condition: (field: Field) => boolean,
    generatorClass: typeof BaseFieldGenerator,
  ): void {
    // Create a wrapper that applies the condition
    class ConditionalGenerator extends BaseFieldGenerator {
      static condition = condition;

      constructor(config: FieldGeneratorConfig) {
        if (condition(config.field)) {
          return new generatorClass(config);
        }
        super(config);
      }

      getMethodName(): string {
        return "addSingleLineString";
      }

      generateMethodCall(): string {
        const config = this.generateConfig();
        return `\n    .${this.getMethodName()}(${this.objectToString(config, 2)})`;
      }
    }

    FieldGeneratorFactory.customGenerators.set(fieldType, ConditionalGenerator);
  }

  /**
   * Get all registered field types
   */
  static getRegisteredFieldTypes(): string[] {
    return Array.from(FieldGeneratorFactory.customGenerators.keys());
  }

  /**
   * Clear all custom generators (useful for testing)
   */
  static clearCustomGenerators(): void {
    FieldGeneratorFactory.customGenerators.clear();
  }

  /**
   * Get the generator class that would be used for a field (for debugging)
   */
  static getGeneratorClassForField(field: Field): typeof BaseFieldGenerator {
    if (FieldGeneratorFactory.customGenerators.has(field.field_type)) {
      return FieldGeneratorFactory.customGenerators.get(field.field_type)!;
    }
    return FieldGeneratorFactory.getGeneratorClass(field);
  }
}
