import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

/**
 * Generates ItemTypeBuilder.addExternalVideo() method calls.
 */
export class ExternalVideoFieldGenerator extends FieldGenerator<"addExternalVideo"> {
  getMethodCallName() {
    return "addExternalVideo" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addExternalVideo"> {
    const config =
      this.createBaseConfig() as MethodNameToConfig<"addExternalVideo">;
    const body = this.buildExternalVideoFieldBody();

    if (this.hasBodyContent(body)) {
      config.body = body;
    }

    return config;
  }

  private buildExternalVideoFieldBody(): NonNullable<
    MethodNameToConfig<"addExternalVideo">["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<"addExternalVideo">["body"]
    >;

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addExternalVideoValidators(body);

    return body;
  }

  private addExternalVideoValidators(
    body: NonNullable<MethodNameToConfig<"addExternalVideo">["body"]>,
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<MethodNameToConfig<"addExternalVideo">["body"]>["validators"]
    >;

    this.processRequiredValidator(validators);

    if (Object.keys(validators).length > 0) {
      body.validators = validators;
    }
  }
}
