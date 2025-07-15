import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

export class StringSelectFieldGenerator extends FieldGenerator<"addStringSelect"> {
  getMethodCallName() {
    return "addStringSelect" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addStringSelect"> {
    const config = this.createBaseConfig();
    const body = this.createBaseBody();

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addValidatorsToBody(body);

    const options = this.extractOptions();

    return {
      ...config,
      options,
      ...(this.hasBodyContent(body) && { body }),
    };
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

  private addValidatorsToBody(
    body: NonNullable<MethodNameToConfig<"addStringSelect">>["body"],
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<MethodNameToConfig<"addStringSelect">>["body"]
    >["validators"];

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
