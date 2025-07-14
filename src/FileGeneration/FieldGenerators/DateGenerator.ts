import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

type DateValidators = NonNullable<
  NonNullable<MethodNameToConfig<"addDate">["body"]>["validators"]
>;
type DateBody = NonNullable<MethodNameToConfig<"addDate">["body"]>;
type DateConfig = MethodNameToConfig<"addDate">;

export class DateGenerator extends FieldGenerator<"addDate"> {
  private static readonly DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

  getMethodCallName() {
    return "addDate" as const;
  }

  generateBuildConfig(): DateConfig {
    const config: DateConfig = {
      label: this.field.label,
    };

    const body = this.buildBody();
    if (Object.keys(body).length > 0) {
      config.body = body;
    }

    return config;
  }

  private buildBody(): DateBody {
    const body: DateBody = {
      api_key: this.field.api_key,
    };

    this.addHintIfPresent(body);
    this.addValidatorsIfPresent(body);
    this.addDefaultValueIfPresent(body);

    return body;
  }

  private addHintIfPresent(body: DateBody): void {
    if (this.field.hint) {
      body.hint = this.field.hint;
    }
  }

  private addValidatorsIfPresent(body: DateBody): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators: DateValidators = {};

    this.addRequiredValidator(validators);
    this.addDateRangeValidator(validators);

    body.validators = validators;
  }

  private addDefaultValueIfPresent(body: DateBody): void {
    if (this.field.default_value) {
      body.default_value = this.field.default_value;
    }
  }

  private hasValidators(): boolean {
    return (
      this.field.validators && Object.keys(this.field.validators).length > 0
    );
  }

  private addRequiredValidator(validators: DateValidators): void {
    if (this.field.validators?.required) {
      validators.required = true;
    }
  }

  private addDateRangeValidator(validators: DateValidators): void {
    const dateRange = this.field.validators?.date_range as
      | {
          min?: string;
          max?: string;
        }
      | undefined;

    if (!dateRange) {
      return;
    }

    const rangeValidator: { min?: Date; max?: Date } = {};

    if (dateRange.min) {
      rangeValidator.min = this.createDateValue(dateRange.min);
    }

    if (dateRange.max) {
      rangeValidator.max = this.createDateValue(dateRange.max);
    }

    validators.date_range = rangeValidator;
  }

  private createDateValue(
    dateString: string,
  ): Date & { _originalString?: string } {
    const date = new Date(dateString) as Date & { _originalString?: string };

    // Preserve original format for date-only strings (YYYY-MM-DD)
    if (DateGenerator.DATE_ONLY_PATTERN.test(dateString)) {
      date._originalString = dateString;
    }

    return date;
  }
}
