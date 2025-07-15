import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

export class StringSelectFieldGenerator extends FieldGenerator<"addStringSelect"> {
  getMethodCallName() {
    return "addStringSelect" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addStringSelect"> {
    const config =
      this.createBaseConfig() as MethodNameToConfig<"addStringSelect">;
    const body = this.buildStringSelectFieldBody();

    const options = this.extractOptions();

    config.options = options;

    if (this.hasBodyContent(body)) {
      config.body = body;
    }

    return config;
  }

  private buildStringSelectFieldBody(): NonNullable<
    MethodNameToConfig<"addStringSelect">["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<"addStringSelect">["body"]
    >;

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addStringSelectValidators(body);

    return body;
  }

  private extractOptions(): MethodNameToConfig<"addStringSelect">["options"] {
    const parameters = this.field.appearance?.parameters as any;
    const options = parameters?.options || [];

    return options.map((option: any) => ({
      label: option.label || "",
      value: option.value || "",
      ...(option.hint && { hint: option.hint }),
    }));
  }

  private addStringSelectValidators(
    body: NonNullable<MethodNameToConfig<"addStringSelect">["body"]>,
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<MethodNameToConfig<"addStringSelect">["body"]>["validators"]
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
