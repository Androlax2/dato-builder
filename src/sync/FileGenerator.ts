import type { ConsoleLogger } from "../logger";
import type { DatoBuilderConfig } from "../types/DatoBuilderConfig";

export class FileGenerator {
  private config: Required<DatoBuilderConfig>;
  private logger: ConsoleLogger;

  constructor(config: Required<DatoBuilderConfig>, logger: ConsoleLogger) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Generate a TypeScript file for a block or model
   */
  async generateFile(
    itemType: any,
    fields: any[],
    type: "block" | "model",
  ): Promise<string> {
    this.logger.trace(`Generating file for ${type}: ${itemType.name}`);

    const builderClass = type === "block" ? "BlockBuilder" : "ModelBuilder";
    const functionName = `build${this.toPascalCase(itemType.name)}`;

    // Generate imports
    const imports = this.generateImports(type, fields);

    // Generate function body
    const functionBody = this.generateFunctionBody(
      itemType,
      fields,
      builderClass,
    );

    // Combine everything
    const fileContent = `${imports}

${this.generateFileHeader(itemType, type)}
export default function ${functionName}({ config }: BuilderContext) {
${functionBody}
}
`;

    return fileContent;
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
   * Generate the main function body
   */
  private generateFunctionBody(
    itemType: any,
    fields: any[],
    builderClass: string,
  ): string {
    const fieldCalls = this.generateFieldCalls(fields);

    return `  return new ${builderClass}({
    name: '${itemType.name}',
    config,${this.generateBuilderBodyOptions(itemType)}
  })${fieldCalls};`;
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
    config,${this.generateBuilderBodyOptions(itemType)}
  })`;
  }

  /**
   * Generate additional builder body options
   */
  private generateBuilderBodyOptions(itemType: any): string {
    const options = [];

    if (itemType.singleton !== undefined) {
      options.push(`\n    body: {\n      singleton: ${itemType.singleton}`);
    }

    if (itemType.sortable !== undefined && !itemType.singleton) {
      if (options.length === 0) {
        options.push(`\n    body: {\n      sortable: ${itemType.sortable}`);
      } else {
        options[0] += `,\n      sortable: ${itemType.sortable}`;
      }
    }

    if (itemType.draft_mode_active !== undefined) {
      if (options.length === 0) {
        options.push(
          `\n    body: {\n      draft_mode_active: ${itemType.draft_mode_active}`,
        );
      } else {
        options[0] += `,\n      draft_mode_active: ${itemType.draft_mode_active}`;
      }
    }

    if (itemType.all_locales_required !== undefined) {
      if (options.length === 0) {
        options.push(
          `\n    body: {\n      all_locales_required: ${itemType.all_locales_required}`,
        );
      } else {
        options[0] += `,\n      all_locales_required: ${itemType.all_locales_required}`;
      }
    }

    if (options.length > 0) {
      options[0] += "\n    }";
      return options.join("");
    }

    return "";
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
    const fieldConfig = this.generateFieldConfig(field);

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

      return `[\n${items}\n${spaces}]`;
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
