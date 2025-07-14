import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import {
  BaseFieldGenerator,
  type FieldGeneratorConfig,
} from "./BaseFieldGenerator";
import { ImageFieldGenerator } from "./ImageFieldGenerator";
import { TextFieldGenerator } from "./TextFieldGenerator";

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
  private static readonly FIELD_GENERATORS: Record<
    string,
    typeof BaseFieldGenerator
  > = {
    string: TextFieldGenerator,
    file: ImageFieldGenerator,
  };

  static createGenerator(config: FieldGeneratorConfig): BaseFieldGenerator {
    const GeneratorClass =
      FieldGeneratorFactory.FIELD_GENERATORS[config.field.field_type] ||
      DefaultFieldGenerator;
    return new GeneratorClass(config);
  }

  /**
   * Register a new field generator for a specific field type
   */
  static registerGenerator(
    fieldType: string,
    generatorClass: typeof BaseFieldGenerator,
  ): void {
    FieldGeneratorFactory.FIELD_GENERATORS[fieldType] = generatorClass;
  }

  /**
   * Get all registered field types
   */
  static getRegisteredFieldTypes(): string[] {
    return Object.keys(FieldGeneratorFactory.FIELD_GENERATORS);
  }
}
