import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import type {
  ItemTypeBuilderAddMethods,
  MethodNameToConfig,
} from "@/types/ItemTypeBuilderFields";

export interface FieldGeneratorConfig {
  field: Field;
  itemTypeReferences?: Map<string, ItemType>;
}

/**
 * Custom error for field generator operations
 */
export class FieldGeneratorError extends Error {
  constructor(
    message: string,
    public readonly fieldApiKey: string,
    public readonly fieldType: string,
    public readonly cause?: Error,
  ) {
    super(`Field ${fieldApiKey} (${fieldType}): ${message}`);
    this.name = "FieldGeneratorError";
  }
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
  protected itemTypeReferences?: Map<string, ItemType>;

  constructor(config: FieldGeneratorConfig) {
    this.field = config.field;
    this.itemTypeReferences = config.itemTypeReferences;
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
   * Template method for building field body. Subclasses can override for custom logic.
   * This provides a default implementation that works for most field types.
   */
  protected buildFieldBody(): NonNullable<
    MethodNameToConfig<TMethodName>["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<TMethodName>["body"]
    >;

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addValidatorsToBody(body);

    return body;
  }

  /**
   * Template method for adding validators to body. Subclasses can override for specific validators.
   */
  protected addValidatorsToBody(
    body: NonNullable<MethodNameToConfig<TMethodName>["body"]>,
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as Record<string, unknown>;

    this.processRequiredValidator(validators);
    this.processUniqueValidator(validators);
    this.processFormatValidator(validators);
    this.processLengthValidator(validators);
    this.processNumberRangeValidator(validators);
    this.processEnumValidator(validators);

    // Allow subclasses to add specific validators
    this.addFieldSpecificValidators(validators);

    if (Object.keys(validators).length > 0) {
      this.addOptionalProperty(body, "validators", validators);
    }
  }

  /**
   * Hook for subclasses to add field-specific validators.
   * Default implementation does nothing.
   */
  protected addFieldSpecificValidators(
    _validators: Record<string, unknown>,
  ): void {
    // Default: no field-specific validators
  }

  /**
   * Template method for generating configuration. Provides default implementation.
   */
  protected generateTemplateConfig(): MethodNameToConfig<TMethodName> {
    const config = this.createBaseConfig() as MethodNameToConfig<TMethodName>;
    const body = this.buildFieldBody();

    if (this.hasBodyContent(body)) {
      this.addOptionalProperty(config, "body", body);
    }

    return this.customizeConfig(config);
  }

  /**
   * Hook for subclasses to customize the final configuration.
   * Default implementation returns config as-is.
   */
  protected customizeConfig(
    config: MethodNameToConfig<TMethodName>,
  ): MethodNameToConfig<TMethodName> {
    return config;
  }

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
  protected addHintToBody<T extends Record<string, unknown>>(body: T): void {
    if (this.field.hint) {
      (body as any).hint = this.field.hint;
    }
  }

  /**
   * Add default value to body if present in the field.
   */
  protected addDefaultValueToBody<T extends Record<string, unknown>>(
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
  protected processRequiredValidator<T extends { required?: unknown }>(
    validators: T,
  ): void {
    if (this.field.validators?.["required"]) {
      this.addOptionalProperty(validators, "required", true);
    }
  }

  /**
   * Process unique validator if present.
   * Sets validators.unique = true if the field has a unique validator.
   * Generic to maintain type safety with specific validator types.
   */
  protected processUniqueValidator<T extends { unique?: unknown }>(
    validators: T,
  ): void {
    if (this.field.validators?.["unique"]) {
      this.addOptionalProperty(validators, "unique", true);
    }
  }

  /**
   * Process format validator if present, converting string patterns to RegExp.
   * Handles custom_pattern conversion from string to RegExp.
   * Generic to maintain type safety with specific validator types.
   */
  protected processFormatValidator<T extends { format?: unknown }>(
    validators: T,
  ): void {
    const formatValidator = this.field.validators?.["format"] as any;
    if (!formatValidator) {
      return;
    }

    const processedFormat: any = {};

    // Copy predefined patterns as-is
    if (formatValidator.predefined_pattern) {
      processedFormat.predefined_pattern = formatValidator.predefined_pattern;
    }

    // Convert custom_pattern from string to RegExp
    if (formatValidator.custom_pattern) {
      try {
        // If it's already a RegExp, keep it
        if (formatValidator.custom_pattern instanceof RegExp) {
          processedFormat.custom_pattern = formatValidator.custom_pattern;
        } else if (
          typeof formatValidator.custom_pattern === "string" &&
          formatValidator.custom_pattern.trim()
        ) {
          // Convert string to RegExp
          processedFormat.custom_pattern = new RegExp(
            formatValidator.custom_pattern,
          );
        } else if (
          typeof formatValidator.custom_pattern === "object" &&
          Object.keys(formatValidator.custom_pattern).length === 0
        ) {
          // Skip empty objects {} that come from DatoCMS API when RegExp isn't properly stored
          console.warn(
            `Skipping empty custom_pattern object for field ${this.field.api_key}`,
          );
        } else {
          // If it's something else, skip it completely
          console.warn(
            `Skipping invalid custom_pattern for field ${this.field.api_key}: not a string or RegExp, got:`,
            typeof formatValidator.custom_pattern,
          );
        }
      } catch (error) {
        // If RegExp conversion fails, log error and skip
        console.warn(
          `Failed to convert custom_pattern to RegExp for field ${this.field.api_key}:`,
          error,
        );
      }
    }

    // Copy description if present
    if (formatValidator.description) {
      processedFormat.description = formatValidator.description;
    }

    if (Object.keys(processedFormat).length > 0) {
      this.addOptionalProperty(validators, "format", processedFormat);
    }
  }

  /**
   * Process length validator if present.
   * Copies length validator data as-is since it's already in correct format.
   */
  protected processLengthValidator<T extends { length?: unknown }>(
    validators: T,
  ): void {
    if (this.field.validators?.["length"]) {
      this.addOptionalProperty(
        validators,
        "length",
        this.field.validators["length"],
      );
    }
  }

  /**
   * Process number_range validator if present.
   * Copies number_range validator data as-is since it's already in correct format.
   */
  protected processNumberRangeValidator<T extends { number_range?: unknown }>(
    validators: T,
  ): void {
    if (this.field.validators?.["number_range"]) {
      this.addOptionalProperty(
        validators,
        "number_range",
        this.field.validators["number_range"],
      );
    }
  }

  /**
   * Process enum validator if present.
   * Copies enum validator data as-is since it's already in correct format.
   */
  protected processEnumValidator<T extends { enum?: unknown }>(
    validators: T,
  ): void {
    if (this.field.validators?.["enum"]) {
      this.addOptionalProperty(
        validators,
        "enum",
        this.field.validators["enum"],
      );
    }
  }

  /**
   * Check if body has any content (typically used to decide whether to include body property).
   * Generic to maintain type safety with specific body types.
   */
  protected hasBodyContent<T extends Record<string, unknown>>(
    body: T,
  ): boolean {
    return Object.keys(body).length > 0;
  }

  /**
   * Type-safe helper to add optional properties to objects
   */
  protected addOptionalProperty<T extends object, K extends string>(
    obj: T,
    key: K,
    value: unknown,
  ): void {
    if (value !== null && value !== undefined) {
      (obj as any)[key] = value;
    }
  }

  /**
   * Validate field configuration before processing
   */
  protected validateField(): void {
    if (!this.field.api_key) {
      throw new FieldGeneratorError(
        "Field must have an api_key",
        this.field.api_key || "unknown",
        this.field.field_type,
      );
    }

    if (!this.field.label) {
      throw new FieldGeneratorError(
        "Field must have a label",
        this.field.api_key,
        this.field.field_type,
      );
    }
  }

  /**
   * Extract appearance parameters with type safety
   */
  protected extractAppearanceParameter<T>(
    parameterName: string,
    expectedType: "string" | "boolean" | "number" | "array" | "object",
    defaultValue?: T,
  ): T | undefined {
    const parameters = this.field.appearance?.parameters as any;
    if (!parameters || !(parameterName in parameters)) {
      return defaultValue;
    }

    const value = parameters[parameterName];

    // Type validation
    switch (expectedType) {
      case "string":
        return (
          typeof value === "string" && value.trim() ? value : defaultValue
        ) as T | undefined;
      case "boolean":
        return (typeof value === "boolean" ? value : defaultValue) as
          | T
          | undefined;
      case "number":
        return (typeof value === "number" ? value : defaultValue) as
          | T
          | undefined;
      case "array":
        return (Array.isArray(value) ? value : defaultValue) as T | undefined;
      case "object":
        return (
          value && typeof value === "object" && !Array.isArray(value)
            ? value
            : defaultValue
        ) as T | undefined;
      default:
        return (value ?? defaultValue) as T | undefined;
    }
  }

  /**
   * Extract multiple appearance parameters efficiently
   */
  protected extractAppearanceParameters<T extends Record<string, any>>(
    parameterMap: Record<
      keyof T,
      {
        type: "string" | "boolean" | "number" | "array" | "object";
        default?: any;
      }
    >,
  ): Partial<T> {
    const result: Partial<T> = {};

    for (const [key, config] of Object.entries(parameterMap)) {
      const value = this.extractAppearanceParameter(
        key,
        config.type,
        config.default,
      );
      if (value !== undefined) {
        result[key as keyof T] = value;
      }
    }

    return result;
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
    T extends Record<string, unknown>,
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

  // biome-ignore lint/suspicious/noExplicitAny: Serialization method needs to handle any type of configuration object
  private serializeConfig(obj: any): string {
    if (obj === null) return "null";
    if (obj === undefined) return "undefined";
    if (typeof obj === "string") return JSON.stringify(obj);
    if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
    if (obj instanceof RegExp) {
      return obj.toString();
    }
    if (obj instanceof Date) {
      // Check if this Date has an original string we should preserve
      // biome-ignore lint/suspicious/noExplicitAny: Date object may have custom _originalString property
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
      // Handle async call markers
      if (obj.__async_call) {
        return obj.__async_call;
      }

      // Skip empty objects that might be invalid RegExp patterns
      if (Object.keys(obj).length === 0) {
        return "{}";
      }

      const entries = Object.entries(obj)
        .map(([key, value]) => `${key}: ${this.serializeConfig(value)}`)
        .join(", ");
      return `{ ${entries} }`;
    }

    return JSON.stringify(obj);
  }

  /**
   * Convert item type IDs to getModel() or getBlock() calls
   */
  protected convertItemTypeIdsToGetCalls(
    itemTypeIds: string[],
  ): Array<{ __async_call: string }> {
    if (!this.itemTypeReferences) {
      // Throw error if no references available
      throw new FieldGeneratorError(
        "Cannot resolve item type references - references not available",
        this.field.api_key,
        this.field.field_type,
      );
    }

    return itemTypeIds.map((id) => {
      const itemType = this.itemTypeReferences!.get(id);
      if (!itemType) {
        // Throw error if item type not found
        throw new FieldGeneratorError(
          `Item type with ID "${id}" not found in references`,
          this.field.api_key,
          this.field.field_type,
        );
      }

      const functionName = itemType.modular_block ? "getBlock" : "getModel";
      const apiKey = this.toPascalCase(itemType.name);
      return { __async_call: `await ${functionName}("${apiKey}")` };
    });
  }

  /**
   * Convert a string to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
        return word.toUpperCase();
      })
      .replace(/\s+/g, "");
  }
}
