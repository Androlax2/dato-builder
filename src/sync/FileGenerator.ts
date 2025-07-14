import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";

type BlockValidatorMap = {
  rich_text_blocks?: { item_types: string[] };
  single_block?: { item_types: string[] };
  structured_text_blocks?: { item_types: string[] };
  [other: string]: unknown;
};

export class FileGenerator {
  private readonly itemTypeReferences: Map<string, ItemType> = new Map();

  /**
   * Set references to all item types for resolving dependencies
   */
  setItemTypeReferences(itemTypes: ItemType[]): void {
    this.itemTypeReferences.clear();
    for (const itemType of itemTypes) {
      this.itemTypeReferences.set(itemType.id, itemType);
    }
  }

  /**
   * Generate a TypeScript file for a block or model using simple string templates
   */
  generateFile(
    itemType: ItemType,
    fields: Field[],
    type: "block" | "model",
  ): string {
    const builderClass = type === "block" ? "BlockBuilder" : "ModelBuilder";
    const functionName = `build${this.toPascalCase(itemType.name)}`;
    const needsAsync = this.hasBlockReferences(fields);

    return this.buildFileContent(
      functionName,
      type,
      itemType,
      fields,
      builderClass,
      needsAsync,
    );
  }

  private buildFileContent(
    functionName: string,
    type: "block" | "model",
    itemType: ItemType,
    fields: Field[],
    builderClass: string,
    needsAsync: boolean,
  ): string {
    const imports = this.generateImports(builderClass);
    const functionDef = this.generateFunction(
      functionName,
      type,
      itemType,
      fields,
      builderClass,
      needsAsync,
    );

    return `${imports}\n\n${functionDef}`;
  }

  private generateImports(builderClass: string): string {
    return `import ${builderClass} from "../../${builderClass}";
import type { BuilderContext } from "../../types/BuilderContext";`;
  }

  private generateFunction(
    functionName: string,
    type: "block" | "model",
    itemType: ItemType,
    fields: Field[],
    builderClass: string,
    needsAsync: boolean,
  ): string {
    const asyncKeyword = needsAsync ? "async " : "";
    const params = needsAsync ? "{ config, getBlock, getModel }" : "{ config }";
    const builderConfig = this.generateBuilderConfig(type, itemType);
    const fieldMethods = this.generateFieldMethods(fields, needsAsync);

    return `/**
 * Build a "${itemType.name}" ${type} in DatoCMS.
 * Generated from DatoCMS API on ${new Date().toISOString()}
 * API Key: ${itemType.api_key}
 */
export default ${asyncKeyword}function ${functionName}(${params}: BuilderContext) {
  return new ${builderClass}(${builderConfig})${fieldMethods};
}`;
  }

  private generateBuilderConfig(
    type: "block" | "model",
    itemType: ItemType,
  ): string {
    if (type === "model") {
      return `{
      name: '${itemType.name}',
      config,
      body: {
        singleton: ${itemType.singleton || false},
        sortable: ${itemType.sortable || false},
        draft_mode_active: ${itemType.draft_mode_active || false},
        all_locales_required: ${itemType.all_locales_required || false},
      },
    }`;
    } else {
      return `{
      name: '${itemType.name}',
      config,
      options: {
        api_key: '${itemType.api_key}',
        hint: '${itemType.hint || ""}',
      },
    }`;
    }
  }

  private generateFieldMethods(fields: Field[], needsAsync: boolean): string {
    const sortedFields = [...fields].sort(
      (a, b) => (a.position || 0) - (b.position || 0),
    );

    return sortedFields
      .map((field) => {
        const methodName = this.getFieldMethodName(field.field_type);
        const config = this.generateFieldConfig(field, needsAsync);
        return `\n    .${methodName}(${config})`;
      })
      .join("");
  }

  private generateFieldConfig(field: Field, needsAsync: boolean): string {
    const config: any = {
      label: field.label || field.api_key,
    };

    // Add field-specific options
    const fieldOptions = this.generateFieldTypeOptions(field);
    if (fieldOptions) {
      Object.assign(config, fieldOptions);
    }

    // Add body configuration
    const body = this.generateFieldBody(field, needsAsync);
    if (body && Object.keys(body).length > 0) {
      config.body = body;
    }

    return this.objectToString(config, 2);
  }

  private generateFieldTypeOptions(field: Field): any {
    const options: any = {};

    // Handle field-specific configurations
    switch (field.field_type) {
      case "slug":
        if (field.appearance?.url_prefix) {
          options.url_prefix = field.appearance.url_prefix;
        }
        if (field.appearance?.placeholder) {
          options.placeholder = field.appearance.placeholder;
        }
        break;

      case "seo":
        if (field.appearance?.seo_fields) {
          options.fields = field.appearance.seo_fields;
        }
        if (field.appearance?.previews) {
          options.previews = field.appearance.previews;
        }
        break;

      case "rich_text":
      case "text":
        if (field.appearance?.toolbar) {
          options.toolbar = field.appearance.toolbar;
        }
        break;

      case "structured_text":
        if (field.appearance?.nodes) {
          options.nodes = field.appearance.nodes;
        }
        if (field.appearance?.marks) {
          options.marks = field.appearance.marks;
        }
        break;

      case "single_block":
        if (field.appearance?.start_collapsed !== undefined) {
          options.start_collapsed = field.appearance.start_collapsed;
        }
        break;
    }

    // Handle common appearance options
    if (field.appearance?.placeholder && !options.placeholder) {
      if (field.field_type === "text" || field.field_type === "string") {
        options.placeholder = field.appearance.placeholder;
      }
    }

    return Object.keys(options).length > 0 ? options : null;
  }

  private generateFieldBody(field: Field, needsAsync: boolean): any {
    const body: any = {};

    if (field.localized !== undefined) {
      body.localized = field.localized;
    }

    if (field.hint) {
      body.hint = field.hint;
    }

    // Process validators
    if (field.validators) {
      body.validators = this.processValidators(field.validators);
    }

    // Handle block references with async resolution
    if (needsAsync && this.fieldReferencesOtherItems(field)) {
      const referencedItemIds = this.getReferencedItemIds(field);
      const asyncCalls = this.generateAsyncCalls(referencedItemIds);

      if (asyncCalls.length > 0) {
        if (field.field_type === "rich_text") {
          if (!body.validators) body.validators = {};
          if (!body.validators.rich_text_blocks)
            body.validators.rich_text_blocks = {};
          body.validators.rich_text_blocks.item_types = `[${asyncCalls.join(", ")}]`;
        } else if (field.field_type === "single_block") {
          if (!body.validators) body.validators = {};
          if (!body.validators.single_block) body.validators.single_block = {};
          body.validators.single_block.item_types = `[${asyncCalls.join(", ")}]`;
        } else if (field.field_type === "structured_text") {
          if (!body.validators) body.validators = {};
          if (!body.validators.structured_text_blocks)
            body.validators.structured_text_blocks = {};
          body.validators.structured_text_blocks.item_types = `[${asyncCalls.join(", ")}]`;
        }
      }
    }

    return body;
  }

  private processValidators(validators: Record<string, any>): any {
    const processed: any = {};

    for (const [key, value] of Object.entries(validators)) {
      switch (key) {
        case "required":
          if (value) processed.required = true;
          break;
        case "unique":
          if (value) processed.unique = true;
          break;
        case "length":
        case "format":
        case "number_range":
        case "date_range":
          if (value && typeof value === "object") {
            processed[key] = value;
          }
          break;
        default:
          processed[key] = value;
      }
    }

    return Object.keys(processed).length > 0 ? processed : undefined;
  }

  private generateAsyncCalls(referencedItemIds: string[]): string[] {
    const asyncCalls: string[] = [];

    for (const itemId of referencedItemIds) {
      const itemType = this.itemTypeReferences.get(itemId);
      if (itemType) {
        const getterMethod = itemType.modular_block ? "getBlock" : "getModel";
        asyncCalls.push(
          `await ${getterMethod}('${this.toPascalCase(itemType.name)}')`,
        );
      }
    }

    return asyncCalls;
  }

  private fieldReferencesOtherItems(field: Field): boolean {
    return (
      (field.field_type === "rich_text" ||
        field.field_type === "single_block" ||
        field.field_type === "structured_text") &&
      this.getReferencedItemIds(field).length > 0
    );
  }

  private getReferencedItemIds(field: Field): string[] {
    const itemIds: string[] = [];

    const validators = field.validators as BlockValidatorMap;

    if (validators.rich_text_blocks?.item_types) {
      itemIds.push(...validators.rich_text_blocks.item_types);
    }
    if (validators.single_block?.item_types) {
      itemIds.push(...validators.single_block.item_types);
    }
    if (validators.structured_text_blocks?.item_types) {
      itemIds.push(...validators.structured_text_blocks.item_types);
    }

    return itemIds;
  }

  private getFieldMethodName(fieldType: Field["field_type"]): string {
    const fieldTypeMap: Record<Field["field_type"], string> = {
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

    return fieldTypeMap[fieldType] || "addSingleLineString";
  }

  private hasBlockReferences(fields: Field[]): boolean {
    return fields.some((field) => this.fieldReferencesOtherItems(field));
  }

  private objectToString(obj: any, indent = 0): string {
    const spaces = "  ".repeat(indent);
    const innerSpaces = "  ".repeat(indent + 1);

    if (typeof obj !== "object" || obj === null) {
      return JSON.stringify(obj);
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return "[]";

      const items = obj
        .map((item) => {
          if (typeof item === "string" && item.includes("await ")) {
            return `${innerSpaces}${item}`;
          }
          return typeof item === "object"
            ? `${innerSpaces}${this.objectToString(item, indent + 1)}`
            : `${innerSpaces}${JSON.stringify(item)}`;
        })
        .join(",\n");

      return `[\n${items},\n${spaces}]`;
    }

    const entries = Object.entries(obj);
    if (entries.length === 0) return "{}";

    const props = entries
      .map(([key, value]) => {
        const keyStr = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
          ? key
          : JSON.stringify(key);

        let valueStr: string;
        if (typeof value === "string" && value.includes("await ")) {
          valueStr = value;
        } else if (typeof value === "object") {
          valueStr = this.objectToString(value, indent + 1);
        } else {
          valueStr = JSON.stringify(value);
        }

        return `${innerSpaces}${keyStr}: ${valueStr},`;
      })
      .join("\n");

    return `{\n${props}\n${spaces}}`;
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  }
}
