import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

export class UrlFieldGenerator extends FieldGenerator<"addUrl"> {
  getMethodCallName() {
    return "addUrl" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addUrl"> {
    const config = this.createBaseConfig() as MethodNameToConfig<"addUrl">;
    const body = this.buildUrlFieldBody();

    if (this.hasBodyContent(body)) {
      config.body = body;
    }

    return config;
  }

  private buildUrlFieldBody(): NonNullable<
    MethodNameToConfig<"addUrl">["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<"addUrl">["body"]
    >;

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addUrlValidators(body);

    return body;
  }

  private addUrlValidators(
    body: NonNullable<MethodNameToConfig<"addUrl">["body"]>,
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<MethodNameToConfig<"addUrl">["body"]>["validators"]
    >;

    this.processRequiredValidator(validators);

    // Copy all validators from field to body
    if (this.field.validators) {
      Object.assign(validators, this.field.validators);
    }

    if (Object.keys(validators).length > 0) {
      body.validators = validators;
    }
  }
}
