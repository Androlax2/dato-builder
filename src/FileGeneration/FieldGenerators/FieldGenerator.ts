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
 * Types are automatically inferred from the TMethodName generic parameter.
 * This ensures compile-time safety when ItemTypeBuilder signatures change.
 */
export abstract class FieldGenerator<
  TMethodName extends ItemTypeBuilderAddMethods,
> {
  protected field: Field;

  constructor(config: FieldGeneratorConfig) {
    this.field = config.field;
  }

  /**
   * Get the name of the ItemTypeBuilder method to call.
   * @example "addDate", "addText", "addBoolean"
   */
  abstract getMethodCallName(): TMethodName;

  /**
   * Generate the configuration object for the ItemTypeBuilder method.
   * Transform API field data into the format expected by ItemTypeBuilder.
   * Return type is automatically inferred from TMethodName.
   */
  abstract generateBuildConfig(): MethodNameToConfig<TMethodName>;

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

  /**
   * Process required validator if present.
   * Sets validators.required = true if the field has a required validator.
   * Generic to maintain type safety with specific validator types.
   */
  protected processRequiredValidator<T extends { required?: any }>(
    validators: T,
  ): void {
    if (this.field.validators?.required) {
      (validators as any).required = true;
    }
  }

  /**
   * Check if body has any content (typically used to decide whether to include body property).
   * Generic to maintain type safety with specific body types.
   */
  protected hasBodyContent<T extends Record<string, any>>(body: T): boolean {
    return Object.keys(body).length > 0;
  }

  /**
   * Create a Date object with preserved original string for code generation.
   * Allows specifying when to preserve the original string format.
   */
  protected createPreservedDateValue(
    dateString: string,
    shouldPreserveString: boolean = true,
  ): Date & { _originalString?: string } {
    const date = new Date(dateString) as Date & { _originalString?: string };

    if (shouldPreserveString) {
      date._originalString = dateString;
    }

    return date;
  }

  /**
   * Generic helper to process range validators for date-like fields.
   * Handles both date_range and date_time_range validators.
   * Generic to maintain type safety - requires the range key to exist in validator type.
   */
  protected processRangeValidator<
    T extends Record<string, any>,
    K extends keyof T,
  >(
    validators: T,
    rangeValidatorKey: K,
    shouldPreserveString: boolean | ((dateString: string) => boolean) = true,
  ): void {
    const rangeData = this.field.validators?.[rangeValidatorKey as string] as
      | { min?: string; max?: string }
      | undefined;

    if (!rangeData) {
      return;
    }

    const rangeValidator: { min?: Date; max?: Date } = {};

    if (rangeData.min) {
      const preserve =
        typeof shouldPreserveString === "function"
          ? shouldPreserveString(rangeData.min)
          : shouldPreserveString;
      rangeValidator.min = this.createPreservedDateValue(
        rangeData.min,
        preserve,
      );
    }

    if (rangeData.max) {
      const preserve =
        typeof shouldPreserveString === "function"
          ? shouldPreserveString(rangeData.max)
          : shouldPreserveString;
      rangeValidator.max = this.createPreservedDateValue(
        rangeData.max,
        preserve,
      );
    }

    if (Object.keys(rangeValidator).length > 0) {
      validators[rangeValidatorKey] = rangeValidator as T[K];
    }
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
