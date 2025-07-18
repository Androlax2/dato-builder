import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

export class EmailFieldGenerator extends FieldGenerator<"addEmail"> {
  getMethodCallName() {
    return "addEmail" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addEmail"> {
    const config = this.createBaseConfig() as MethodNameToConfig<"addEmail">;
    const body = this.buildEmailFieldBody();

    if (this.hasBodyContent(body)) {
      config.body = body;
    }

    return config;
  }

  private buildEmailFieldBody(): NonNullable<
    MethodNameToConfig<"addEmail">["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<"addEmail">["body"]
    >;

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addEmailValidators(body);

    return body;
  }

  private addEmailValidators(
    body: NonNullable<MethodNameToConfig<"addEmail">["body"]>,
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<MethodNameToConfig<"addEmail">["body"]>["validators"]
    >;

    // Process each validator type individually to ensure proper conversion
    this.processRequiredValidator(validators);
    this.processUniqueValidator(validators);
    this.processLengthValidator(validators);
    this.processFormatValidator(validators);

    if (Object.keys(validators).length > 0) {
      body.validators = validators;
    }
  }
}
