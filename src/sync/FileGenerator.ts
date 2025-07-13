import type { ConsoleLogger } from "../logger";
import type { DatoBuilderConfig } from "../types/DatoBuilderConfig";

interface ItemType {
  id: string;
  name: string;
  api_key: string;
  modular_block: boolean;
  singleton?: boolean;
  sortable?: boolean;
  draft_mode_active?: boolean;
  all_locales_required?: boolean;
  description?: string;
}

interface Field {
  id: string;
  label: string;
  api_key: string;
  field_type: string;
  localized?: boolean;
  hint?: string;
  position?: number;
  validators?: Record<string, any>;
  appearance?: Record<string, any>;
}

interface ItemTypeReference {
  id: string;
  api_key: string;
  name: string;
  modular_block: boolean;
}

interface Dependency {
  type: "block" | "model";
  functionName: string;
  apiKey: string;
}

export class FileGenerator {
  private config: Required<DatoBuilderConfig>;
  private logger: ConsoleLogger;
  private itemTypeReferences: Map<string, ItemTypeReference> = new Map();

  constructor(config: Required<DatoBuilderConfig>, logger: ConsoleLogger) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Set references to all item types for resolving dependencies
   */
  setItemTypeReferences(itemTypes: ItemTypeReference[]): void {
    this.itemTypeReferences.clear();
    for (const itemType of itemTypes) {
      this.itemTypeReferences.set(itemType.id, itemType);
    }
    this.logger.trace(`Set ${itemTypes.length} item type references`);
  }

  /**
   * Generate a TypeScript file for a block or model
   */
  async generateFile(
    itemType: ItemType,
    fields: Field[],
    type: "block" | "model",
  ): Promise<string> {
    this.logger.trace(`Generating file for ${type}: ${itemType.name}`);

    const builderClass = type === "block" ? "BlockBuilder" : "ModelBuilder";
    const functionName = `build${this.toPascalCase(itemType.name)}`;

    // Analyze dependencies
    const dependencies = this.analyzeDependencies(fields);
    const needsAsync = dependencies.length > 0;

    // Generate components
    const imports = this.generateImports(type, dependencies);
    const header = this.generateFileHeader(itemType, type);
    const functionSignature = this.generateFunctionSignature(
      functionName,
      needsAsync,
    );
    const functionBody = this.generateFunctionBody(
      itemType,
      fields,
      builderClass,
      dependencies,
    );

    // Format and combine everything
    return this.formatFile({
      imports,
      header,
      functionSignature,
      functionBody,
    });
  }

  /**
   * Generate import statements
   */
  private generateImports(type: "block" | "model", fields: any[]): string {
    const builderClass = type === "block" ? "BlockBuilder" : "ModelBuilder";

    let imports = `import ${builderClass} from '../../${builderClass}';
import type { BuilderContext } from '../../types/BuilderContext';`;

    // Add additional imports based on field types if needed
    const needsAsync = this.hasAsyncFields(fields);
    if (needsAsync) {
      imports +=
        "\n// Additional imports for async field dependencies may be needed";
    }

    return imports;
  }

  /**
   * Generate file header comment
   */
  private generateFileHeader(itemType: any, type: "block" | "model"): string {
    return `/**
 * Build a "${itemType.name}" ${type} in DatoCMS.
 * 
 * Generated from DatoCMS API on ${new Date().toISOString()}
 * API Key: ${itemType.api_key}
 * ${itemType.description ? `Description: ${itemType.description}` : ""}
 */`;
  }

  /**
   * Generate builder initialization options
   */
  private generateBuilderInitialization(
    itemType: any,
    builderClass: string,
  ): string {
    return `new ${builderClass}({
    name: '${itemType.name}',
    config,${this.generateBuilderBodyOptions(itemType, builderClass)}
  })`;
  }

  /**
   * Generate additional builder body options
   */
  private generateBuilderBodyOptions(
    itemType: any,
    builderClass: string,
  ): string {
    if (builderClass === "ModelBuilder") {
      return `\n    body: {\n      singleton: ${itemType.singleton || false},\n      sortable: ${itemType.sortable || false},\n      draft_mode_active: ${itemType.draft_mode_active || false},\n      all_locales_required: ${itemType.all_locales_required || false}\n    }`;
    } else {
      return `\n    options: {\n      api_key: '${itemType.api_key}',\n      hint: '${itemType.description || ""}'\n    }`;
    }
  }

  /**
   * Generate field method calls
   */
  private generateFieldCalls(fields: any[]): string {
    if (fields.length === 0) {
      return "";
    }

    // Sort fields by position
    const sortedFields = [...fields].sort(
      (a, b) => (a.position || 0) - (b.position || 0),
    );

    return sortedFields
      .map((field) => {
        return this.generateFieldCall(field);
      })
      .join("");
  }

  /**
   * Generate a single field method call
   */
  private generateFieldCall(field: any): string {
    const methodName = this.getFieldMethodName(field.field_type);
    const fieldConfig = this.generateEnhancedFieldConfig(field);

    return `\n    .${methodName}(${fieldConfig})`;
  }

  /**
   * Map DatoCMS field types to builder method names
   */
  private getFieldMethodName(fieldType: string): string {
    const fieldTypeMap: { [key: string]: string } = {
      string: "addSingleLineString",
      text: "addMultiLineText",
      wysiwyg: "addWysiwyg",
      markdown: "addMarkdown",
      integer: "addInteger",
      float: "addFloat",
      boolean: "addBoolean",
      date: "addDate",
      datetime: "addDateTime",
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
    };

    return fieldTypeMap[fieldType] || "addSingleLineString";
  }

  /**
   * Generate field configuration object
   */
  private generateFieldConfig(field: any): string {
    const config: any = {
      label: field.label || field.api_key,
    };

    // Add field-specific options
    const fieldOptions = this.generateFieldTypeOptions(field);
    if (fieldOptions) {
      Object.assign(config, fieldOptions);
    }

    // Add body configuration
    const bodyConfig = this.generateFieldBodyConfig(field);
    if (bodyConfig && Object.keys(bodyConfig).length > 0) {
      config.body = bodyConfig;
    }

    return this.objectToString(config);
  }

  /**
   * Generate field type specific options
   */
  private generateFieldTypeOptions(field: any): any {
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
      case "markdown":
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

    // Handle appearance-based options that are common
    if (field.appearance?.placeholder && !options.placeholder) {
      if (field.field_type === "text" || field.field_type === "string") {
        options.placeholder = field.appearance.placeholder;
      }
    }

    return Object.keys(options).length > 0 ? options : null;
  }

  /**
   * Generate field body configuration
   */
  private generateFieldBodyConfig(field: any): any {
    const body: any = {};

    // Add common field properties
    if (field.localized !== undefined) {
      body.localized = field.localized;
    }

    if (field.hint) {
      body.hint = field.hint;
    }

    // Add validators
    if (field.validators && Object.keys(field.validators).length > 0) {
      body.validators = this.processValidators(field.validators);
    }

    return body;
  }

  /**
   * Process field validators
   */
  private processValidators(validators: any): any {
    const processed: any = {};

    // Handle common validators
    for (const [key, value] of Object.entries(validators)) {
      switch (key) {
        case "required":
          if (value) {
            processed.required = true;
          }
          break;

        case "unique":
          if (value) {
            processed.unique = true;
          }
          break;

        case "length":
          if (value && typeof value === "object") {
            processed.length = value;
          }
          break;

        case "format":
          if (value && typeof value === "object") {
            processed.format = value;
          }
          break;

        case "number_range":
          if (value && typeof value === "object") {
            processed.number_range = value;
          }
          break;

        case "date_range":
          if (value && typeof value === "object") {
            processed.date_range = value;
          }
          break;

        // Add more validator mappings as needed
        default:
          processed[key] = value;
      }
    }

    return Object.keys(processed).length > 0 ? processed : undefined;
  }

  /**
   * Check if any fields require async handling
   */
  private hasAsyncFields(fields: any[]): boolean {
    return fields.some(
      (field) =>
        ["rich_text", "single_block", "structured_text"].includes(
          field.field_type,
        ) && field.validators?.rich_text_blocks?.item_types?.length > 0,
    );
  }

  /**
   * Convert object to string representation
   */
  private objectToString(obj: any, indent = 0): string {
    const spaces = "  ".repeat(indent);
    const innerSpaces = "  ".repeat(indent + 1);

    if (typeof obj !== "object" || obj === null) {
      return JSON.stringify(obj);
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return "[]";

      const items = obj
        .map((item) =>
          typeof item === "object"
            ? `${innerSpaces}${this.objectToString(item, indent + 1)}`
            : `${innerSpaces}${JSON.stringify(item)}`,
        )
        .join(",\n");

      return `\n${spaces}[\n${items}\n${spaces}]`;
    }

    const entries = Object.entries(obj);
    if (entries.length === 0) return "{}";

    const props = entries
      .map(([key, value]) => {
        const keyStr = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
          ? key
          : JSON.stringify(key);
        const valueStr =
          typeof value === "object"
            ? this.objectToString(value, indent + 1)
            : JSON.stringify(value);
        return `${innerSpaces}${keyStr}: ${valueStr}`;
      })
      .join(",\n");

    return `{\n${props}\n${spaces}}`;
  }

  /**
   * Analyze field dependencies to determine if async functions are needed
   */
  private analyzeDependencies(fields: Field[]): Dependency[] {
    const dependencies: Dependency[] = [];

    for (const field of fields) {
      if (this.fieldReferencesOtherItems(field)) {
        const referencedItemIds = this.getReferencedItemIds(field);

        for (const itemId of referencedItemIds) {
          const itemType = this.itemTypeReferences.get(itemId);
          if (itemType) {
            const type = itemType.modular_block ? "block" : "model";
            const functionName = `build${this.toPascalCase(itemType.name)}`;

            if (!dependencies.some((dep) => dep.apiKey === itemType.api_key)) {
              dependencies.push({
                type,
                functionName,
                apiKey: itemType.api_key,
              });
            }
          }
        }
      }
    }

    return dependencies;
  }

  /**
   * Check if a field references other item types
   */
  private fieldReferencesOtherItems(field: Field): boolean {
    return (
      (field.field_type === "rich_text" ||
        field.field_type === "single_block" ||
        field.field_type === "structured_text") &&
      this.getReferencedItemIds(field).length > 0
    );
  }

  /**
   * Extract referenced item IDs from field configuration
   */
  private getReferencedItemIds(field: Field): string[] {
    const itemIds: string[] = [];

    // Check validators for referenced item types
    if (field.validators?.rich_text_blocks?.item_types) {
      itemIds.push(...field.validators.rich_text_blocks.item_types);
    }

    if (field.validators?.single_block?.item_types) {
      itemIds.push(...field.validators.single_block.item_types);
    }

    if (field.validators?.structured_text_blocks?.item_types) {
      itemIds.push(...field.validators.structured_text_blocks.item_types);
    }

    return itemIds;
  }

  /**
   * Generate function signature (async if needed)
   */
  private generateFunctionSignature(
    functionName: string,
    needsAsync: boolean,
  ): string {
    const asyncKeyword = needsAsync ? "async " : "";
    const contextParam = needsAsync
      ? "{ config, getBlock, getModel }"
      : "{ config }";

    return `export default ${asyncKeyword}function ${functionName}(${contextParam}: BuilderContext)`;
  }

  /**
   * Generate enhanced function body with dependency resolution
   */
  private generateFunctionBody(
    itemType: ItemType,
    fields: Field[],
    builderClass: string,
    dependencies: Dependency[],
  ): string {
    let body = "";

    // Generate dependency resolution if needed
    if (dependencies.length > 0) {
      body += "  // Resolve dependencies\n";
      for (const dep of dependencies) {
        const getterMethod = dep.type === "block" ? "getBlock" : "getModel";
        body += `  const ${dep.functionName.toLowerCase()}Builder = await ${getterMethod}('${dep.apiKey}');\n`;
      }
      body += "\n";
    }

    // Generate field calls with proper dependency injection
    const fieldCalls = this.generateEnhancedFieldCalls(fields);

    body += `  return new ${builderClass}({\n`;
    body += `    name: '${itemType.name}',\n`;
    body += `    config,${this.generateBuilderBodyOptions(itemType, builderClass)}\n`;
    body += `  })${fieldCalls};`;

    return body;
  }

  /**
   * Generate field calls with dependency injection
   */
  private generateEnhancedFieldCalls(fields: Field[]): string {
    if (fields.length === 0) {
      return "";
    }

    // Sort fields by position
    const sortedFields = [...fields].sort(
      (a, b) => (a.position || 0) - (b.position || 0),
    );

    return sortedFields
      .map((field) => this.generateEnhancedFieldCall(field))
      .join("");
  }

  /**
   * Generate enhanced field call with dependency resolution
   */
  private generateEnhancedFieldCall(field: Field): string {
    const methodName = this.getFieldMethodName(field.field_type);
    const fieldConfig = this.generateEnhancedFieldConfig(field);

    return `\n    .${methodName}(${fieldConfig})`;
  }

  /**
   * Generate enhanced field configuration with dependency resolution
   */
  private generateEnhancedFieldConfig(field: Field): string {
    const config: any = {
      label: field.label || field.api_key,
    };

    // Add field-specific options
    const fieldOptions = this.generateFieldTypeOptions(field);
    if (fieldOptions) {
      Object.assign(config, fieldOptions);
    }

    // Add body configuration with dependency resolution
    const bodyConfig = this.generateEnhancedFieldBodyConfig(field);
    if (bodyConfig && Object.keys(bodyConfig).length > 0) {
      config.body = bodyConfig;
    }

    return this.objectToString(config, 1);
  }

  /**
   * Generate enhanced field body config with dependency resolution
   */
  private generateEnhancedFieldBodyConfig(field: Field): any {
    const body = this.generateFieldBodyConfig(field);

    // Handle referenced item types for rich_text, single_block, etc.
    if (this.fieldReferencesOtherItems(field)) {
      const referencedItemIds = this.getReferencedItemIds(field);
      const resolvedBuilders: string[] = [];

      for (const itemId of referencedItemIds) {
        const itemType = this.itemTypeReferences.get(itemId);
        if (itemType) {
          const functionName = `build${this.toPascalCase(itemType.name)}`;
          const varName = `${functionName.toLowerCase()}Builder`;
          resolvedBuilders.push(varName);
        }
      }

      if (resolvedBuilders.length > 0) {
        // Reference the resolved builders using async calls
        const asyncCalls: string[] = [];

        for (const itemId of referencedItemIds) {
          const itemType = this.itemTypeReferences.get(itemId);
          if (itemType) {
            const getterMethod = itemType.modular_block
              ? "getBlock"
              : "getModel";
            asyncCalls.push(`await ${getterMethod}('${itemType.api_key}')`);
          }
        }

        if (asyncCalls.length > 0) {
          if (field.field_type === "rich_text") {
            body.item_types = `[${asyncCalls.join(", ")}]`;
          } else if (field.field_type === "single_block") {
            body.item_types = `[${asyncCalls.join(", ")}]`;
          } else if (field.field_type === "structured_text") {
            body.blocks = `[${asyncCalls.join(", ")}]`;
          }
        }
      }
    }

    return body;
  }

  /**
   * Format the complete file with proper indentation
   */
  private formatFile(components: {
    imports: string;
    header: string;
    functionSignature: string;
    functionBody: string;
  }): string {
    const { imports, header, functionSignature, functionBody } = components;

    return [
      imports,
      "",
      header,
      `${functionSignature} {`,
      functionBody,
      "}",
      "",
    ].join("\n");
  }

  /**
   * Convert string to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  }
}
