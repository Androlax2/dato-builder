import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

/**
 * Generates ItemTypeBuilder.addDateTime() method calls.
 */
export class DateTimeFieldGenerator extends FieldGenerator<"addDateTime"> {
  getMethodCallName() {
    return "addDateTime" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addDateTime"> {
    const config = this.createBaseConfig() as MethodNameToConfig<"addDateTime">;
    const body = this.buildDateTimeFieldBody();

    if (this.hasBodyContent(body)) {
      config.body = body;
    }

    return config;
  }

  private buildDateTimeFieldBody(): NonNullable<
    MethodNameToConfig<"addDateTime">["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<"addDateTime">["body"]
    >;

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addDateTimeValidators(body);

    return body;
  }

  private addDateTimeValidators(
    body: NonNullable<MethodNameToConfig<"addDateTime">["body"]>,
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<MethodNameToConfig<"addDateTime">["body"]>["validators"]
    >;

    this.processRequiredValidator(validators);
    this.processDateTimeRangeValidator(validators);

    if (Object.keys(validators).length > 0) {
      body.validators = validators;
    }
  }

  private processRequiredValidator(
    validators: NonNullable<
      NonNullable<MethodNameToConfig<"addDateTime">["body"]>["validators"]
    >,
  ): void {
    if (this.field.validators?.required) {
      validators.required = true;
    }
  }

  private processDateTimeRangeValidator(
    validators: NonNullable<
      NonNullable<MethodNameToConfig<"addDateTime">["body"]>["validators"]
    >,
  ): void {
    const dateTimeRange = this.getDateTimeRangeFromField();

    if (!dateTimeRange) {
      return;
    }

    const rangeValidator = this.buildDateTimeRangeValidator(dateTimeRange);

    if (Object.keys(rangeValidator).length > 0) {
      validators.date_time_range = rangeValidator;
    }
  }

  private getDateTimeRangeFromField():
    | { min?: string; max?: string }
    | undefined {
    return this.field.validators?.date_time_range as
      | { min?: string; max?: string }
      | undefined;
  }

  private buildDateTimeRangeValidator(dateTimeRange: {
    min?: string;
    max?: string;
  }): {
    min?: Date;
    max?: Date;
  } {
    const rangeValidator: { min?: Date; max?: Date } = {};

    if (dateTimeRange.min) {
      rangeValidator.min = this.createPreservedDateValue(dateTimeRange.min);
    }

    if (dateTimeRange.max) {
      rangeValidator.max = this.createPreservedDateValue(dateTimeRange.max);
    }

    return rangeValidator;
  }

  /**
   * Create a Date object while preserving the original string format for code generation.
   * ISO datetime strings are preserved as-is to maintain timezone information.
   */
  private createPreservedDateValue(
    dateString: string,
  ): Date & { _originalString?: string } {
    const date = new Date(dateString) as Date & { _originalString?: string };

    // For datetime fields, always preserve the original string to maintain timezone info
    date._originalString = dateString;

    return date;
  }

  private hasBodyContent(
    body: NonNullable<MethodNameToConfig<"addDateTime">["body"]>,
  ): boolean {
    // Always include body if it has any properties (including api_key)
    return Object.keys(body).length > 0;
  }
}
