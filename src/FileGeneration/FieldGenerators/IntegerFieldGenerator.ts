import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

/**
 * Generates ItemTypeBuilder.addInteger() method calls.
 */
export class IntegerFieldGenerator extends FieldGenerator<"addInteger"> {
  getMethodCallName() {
    return "addInteger" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addInteger"> {
    const config = this.createBaseConfig() as MethodNameToConfig<"addInteger">;
    const body = this.buildIntegerFieldBody();

    if (this.hasBodyContent(body)) {
      config.body = body;
    }

    return config;
  }

  private buildIntegerFieldBody(): NonNullable<
    MethodNameToConfig<"addInteger">["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<"addInteger">["body"]
    >;

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addIntegerValidators(body);

    return body;
  }

  private addIntegerValidators(
    body: NonNullable<MethodNameToConfig<"addInteger">["body"]>,
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<MethodNameToConfig<"addInteger">["body"]>["validators"]
    >;

    this.processRequiredValidator(validators);
    this.processIntegerValidators(validators);

    if (Object.keys(validators).length > 0) {
      body.validators = validators;
    }
  }

  private processIntegerValidators(
    validators: NonNullable<
      NonNullable<MethodNameToConfig<"addInteger">["body"]>["validators"]
    >,
  ): void {
    const fieldValidators = this.field.validators;
    if (!fieldValidators) return;

    // Handle integer-specific validators
    if (fieldValidators.number_range) {
      (validators as any).number_range = fieldValidators.number_range;
    }
  }
}
