import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

/**
 * Generates ItemTypeBuilder.addDate() method calls.
 */
export class DateFieldGenerator extends FieldGenerator<"addDate"> {
  private static readonly DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

  getMethodCallName() {
    return "addDate" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addDate"> {
    const config = this.createBaseConfig() as MethodNameToConfig<"addDate">;
    const body = this.buildDateFieldBody();

    if (this.hasBodyContent(body)) {
      config.body = body;
    }

    return config;
  }

  private buildDateFieldBody(): NonNullable<
    MethodNameToConfig<"addDate">["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<"addDate">["body"]
    >;

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addDateValidators(body);

    return body;
  }

  private addDateValidators(
    body: NonNullable<MethodNameToConfig<"addDate">["body"]>,
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<MethodNameToConfig<"addDate">["body"]>["validators"]
    >;

    this.processRequiredValidator(validators);
    this.processDateRangeValidator(validators);

    if (Object.keys(validators).length > 0) {
      body.validators = validators;
    }
  }

  private processRequiredValidator(
    validators: NonNullable<
      NonNullable<MethodNameToConfig<"addDate">["body"]>["validators"]
    >,
  ): void {
    if (this.field.validators?.required) {
      validators.required = true;
    }
  }

  private processDateRangeValidator(
    validators: NonNullable<
      NonNullable<MethodNameToConfig<"addDate">["body"]>["validators"]
    >,
  ): void {
    const dateRange = this.getDateRangeFromField();

    if (!dateRange) {
      return;
    }

    const rangeValidator = this.buildDateRangeValidator(dateRange);

    if (Object.keys(rangeValidator).length > 0) {
      validators.date_range = rangeValidator;
    }
  }

  private getDateRangeFromField(): { min?: string; max?: string } | undefined {
    return this.field.validators?.date_range as
      | { min?: string; max?: string }
      | undefined;
  }

  private buildDateRangeValidator(dateRange: { min?: string; max?: string }): {
    min?: Date;
    max?: Date;
  } {
    const rangeValidator: { min?: Date; max?: Date } = {};

    if (dateRange.min) {
      rangeValidator.min = this.createPreservedDateValue(dateRange.min);
    }

    if (dateRange.max) {
      rangeValidator.max = this.createPreservedDateValue(dateRange.max);
    }

    return rangeValidator;
  }

  /**
   * Create a Date object while preserving the original string format for code generation.
   * Date-only strings (YYYY-MM-DD) are preserved as-is to avoid timezone issues.
   */
  private createPreservedDateValue(
    dateString: string,
  ): Date & { _originalString?: string } {
    const date = new Date(dateString) as Date & { _originalString?: string };

    if (this.isDateOnlyString(dateString)) {
      date._originalString = dateString;
    }

    return date;
  }

  private isDateOnlyString(dateString: string): boolean {
    return DateFieldGenerator.DATE_ONLY_PATTERN.test(dateString);
  }

  private hasBodyContent(
    body: NonNullable<MethodNameToConfig<"addDate">["body"]>,
  ): boolean {
    // Always include body if it has any properties (including api_key)
    return Object.keys(body).length > 0;
  }
}
