import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

/**
 * Generates ItemTypeBuilder.addFloat() method calls.
 */
export class FloatFieldGenerator extends FieldGenerator<"addFloat"> {
  getMethodCallName() {
    return "addFloat" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addFloat"> {
    const config = this.createBaseConfig() as MethodNameToConfig<"addFloat">;
    const body = this.buildFloatFieldBody();

    if (this.hasBodyContent(body)) {
      config.body = body;
    }

    return config;
  }

  private buildFloatFieldBody(): NonNullable<
    MethodNameToConfig<"addFloat">["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<"addFloat">["body"]
    >;

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addFloatValidators(body);

    return body;
  }

  private addFloatValidators(
    body: NonNullable<MethodNameToConfig<"addFloat">["body"]>,
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<MethodNameToConfig<"addFloat">["body"]>["validators"]
    >;

    this.processRequiredValidator(validators);
    this.processFloatValidators(validators);

    if (Object.keys(validators).length > 0) {
      body.validators = validators;
    }
  }

  private processFloatValidators(
    validators: NonNullable<
      NonNullable<MethodNameToConfig<"addFloat">["body"]>["validators"]
    >,
  ): void {
    const fieldValidators = this.field.validators;
    if (!fieldValidators) return;

    // Handle float-specific validators
    if (fieldValidators.number_range) {
      (validators as any).number_range = fieldValidators.number_range;
    }
  }
}
