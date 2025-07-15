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

  private processDateRangeValidator(
    validators: NonNullable<
      NonNullable<MethodNameToConfig<"addDate">["body"]>["validators"]
    >,
  ): void {
    // Use base class generic range validator with date-only string preservation logic
    this.processRangeValidator(validators, "date_range", (dateString: string) =>
      this.isDateOnlyString(dateString),
    );
  }

  private isDateOnlyString(dateString: string): boolean {
    return DateFieldGenerator.DATE_ONLY_PATTERN.test(dateString);
  }
}
