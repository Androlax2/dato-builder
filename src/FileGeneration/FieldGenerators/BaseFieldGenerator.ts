import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";

export interface FieldGeneratorConfig {
  field: Field;
  needsAsync: boolean;
  itemTypeReferences: Map<string, ItemType>;
}

export abstract class BaseFieldGenerator {
  protected field: Field;
  protected needsAsync: boolean;
  protected itemTypeReferences: Map<string, ItemType>;

  constructor(config: FieldGeneratorConfig) {
    this.field = config.field;
    this.needsAsync = config.needsAsync;
    this.itemTypeReferences = config.itemTypeReferences;
  }

  /**
   * Generate the method call for this field type
   * @returns The method call string (e.g., ".addText(...)")
   */
  abstract generateMethodCall(): string;

  /**
   * Get the method name for this field type
   */
  abstract getMethodName(): string;

  /**
   * Generate the field configuration object
   */
  protected generateConfig(): any {
    const config: any = {
      label: this.field.label || this.field.api_key,
    };

    // Add field-specific options
    const fieldOptions = this.generateFieldOptions();
    if (fieldOptions && Object.keys(fieldOptions).length > 0) {
      Object.assign(config, fieldOptions);
    }

    // Add body configuration
    const body = this.generateBody();
    if (body && Object.keys(body).length > 0) {
      config.body = body;
    }

    return config;
  }

  /**
   * Generate field-specific options (to be overridden by subclasses)
   */
  protected generateFieldOptions(): any {
    return {};
  }

  /**
   * Generate the body configuration for the field
   */
  protected generateBody(): any {
    const body: any = {};

    if (this.field.localized !== undefined) {
      body.localized = this.field.localized;
    }

    if (this.field.hint) {
      body.hint = this.field.hint;
    }

    // Process validators
    if (this.field.validators) {
      body.validators = this.processValidators(this.field.validators);
    }

    // Handle async block references
    this.handleAsyncBlockReferences(body);

    return body;
  }

  /**
   * Process field validators
   */
  protected processValidators(validators: Record<string, any>): any {
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

  /**
   * Handle async block references for fields that support them
   */
  protected handleAsyncBlockReferences(body: any): void {
    if (!this.needsAsync || !this.fieldReferencesOtherItems()) {
      return;
    }

    const referencedItemIds = this.getReferencedItemIds();
    const asyncCalls = this.generateAsyncCalls(referencedItemIds);

    if (asyncCalls.length > 0) {
      if (!body.validators) body.validators = {};

      // Apply async calls based on field type
      this.applyAsyncCalls(body, asyncCalls);
    }
  }

  /**
   * Check if this field references other items (to be overridden by subclasses that support it)
   */
  protected fieldReferencesOtherItems(): boolean {
    return false;
  }

  /**
   * Get referenced item IDs (to be overridden by subclasses that support it)
   */
  protected getReferencedItemIds(): string[] {
    return [];
  }

  /**
   * Apply async calls to the body based on field type
   */
  protected applyAsyncCalls(body: any, asyncCalls: string[]): void {
    // Default implementation - to be overridden by subclasses
  }

  /**
   * Generate async calls for referenced items
   */
  protected generateAsyncCalls(referencedItemIds: string[]): string[] {
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

  /**
   * Convert object to formatted string representation
   */
  protected objectToString(obj: any, indent = 0): string {
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

  /**
   * Convert string to PascalCase
   */
  protected toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  }
}
