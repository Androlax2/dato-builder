import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import type {
  ItemTypeBuilderAddMethods,
  MethodNameToConfig,
} from "@/types/ItemTypeBuilderFields";

export interface FieldGeneratorConfig {
  field: Field;
}

/**
 * Base class for generating ItemTypeBuilder method calls.
 *
 * Each subclass handles a specific field type and generates the appropriate
 * ItemTypeBuilder method call (e.g., .addDate(), .addText(), etc.)
 *
 * The method name and config types are automatically inferred from getMethodCallName()
 */
export abstract class FieldGenerator {
  protected field: Field;

  constructor(config: FieldGeneratorConfig) {
    this.field = config.field;
  }

  /**
   * Get the name of the ItemTypeBuilder method to call.
   * @example "addDate", "addText", "addBoolean"
   */
  abstract getMethodCallName(): ItemTypeBuilderAddMethods;

  /**
   * Generate the configuration object for the ItemTypeBuilder method.
   * Transform API field data into the format expected by ItemTypeBuilder.
   * Return type is inferred from getMethodCallName()
   */
  abstract generateBuildConfig(): MethodNameToConfig<
    ReturnType<this["getMethodCallName"]>
  >;

  /**
   * Generate the complete method call string for the ItemTypeBuilder.
   * @returns String like ".addDate({label: 'My Date', body: {...}})"
   */
  public generateMethodCall(): string {
    const methodName = this.getMethodCallName();
    const config = this.generateBuildConfig();

    return `.${methodName}(${this.serializeConfig(config)})`;
  }

  /**
   * Check if the field has any validators defined.
   */
  protected hasValidators(): boolean {
    return (
      this.field.validators && Object.keys(this.field.validators).length > 0
    );
  }

  /**
   * Add hint to body if present in the field.
   */
  protected addHintToBody<T extends Record<string, any>>(body: T): void {
    if (this.field.hint) {
      (body as any).hint = this.field.hint;
    }
  }

  /**
   * Add default value to body if present in the field.
   */
  protected addDefaultValueToBody<T extends Record<string, any>>(
    body: T,
  ): void {
    if (
      this.field.default_value !== null &&
      this.field.default_value !== undefined
    ) {
      (body as any).default_value = this.field.default_value;
    }
  }

  /**
   * Create base body object with common properties.
   */
  protected createBaseBody(): { api_key: string } {
    return {
      api_key: this.field.api_key,
    };
  }

  /**
   * Create base config object with label.
   */
  protected createBaseConfig(): { label: string } {
    return {
      label: this.field.label,
    };
  }

  private serializeConfig(obj: any): string {
    if (obj === null) return "null";
    if (obj === undefined) return "undefined";
    if (typeof obj === "string") return JSON.stringify(obj);
    if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
    if (obj instanceof Date) {
      // Check if this Date has an original string we should preserve
      const originalString = (obj as any)._originalString;
      if (originalString) {
        return `new Date(${JSON.stringify(originalString)})`;
      }
      return `new Date(${JSON.stringify(obj.toISOString())})`;
    }

    if (Array.isArray(obj)) {
      return `[${obj.map((item) => this.serializeConfig(item)).join(", ")}]`;
    }

    if (typeof obj === "object") {
      const entries = Object.entries(obj)
        .map(([key, value]) => `${key}: ${this.serializeConfig(value)}`)
        .join(", ");
      return `{ ${entries} }`;
    }

    return JSON.stringify(obj);
  }
}
