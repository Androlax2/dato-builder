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

  private processDateTimeRangeValidator(
    validators: NonNullable<
      NonNullable<MethodNameToConfig<"addDateTime">["body"]>["validators"]
    >,
  ): void {
    // Use base class generic range validator - always preserve strings for datetime fields
    this.processRangeValidator(validators, "date_time_range", true);
  }
}
