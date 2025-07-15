import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

export class StringRadioGroupFieldGenerator extends FieldGenerator<"addStringRadioGroup"> {
  getMethodCallName() {
    return "addStringRadioGroup" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addStringRadioGroup"> {
    const config = this.createBaseConfig();
    const body = this.createBaseBody();

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addValidatorsToBody(body);

    const radios = this.extractRadios();

    return {
      ...config,
      radios,
      ...(this.hasBodyContent(body) && { body }),
    };
  }

  private extractRadios(): MethodNameToConfig<"addStringRadioGroup">["radios"] {
    const parameters = this.field.appearance?.parameters as any;
    const radios = parameters?.radios || [];

    return radios.map((radio: any) => ({
      label: radio.label || "",
      value: radio.value || "",
      ...(radio.hint && { hint: radio.hint }),
    }));
  }

  private addValidatorsToBody(
    body: NonNullable<MethodNameToConfig<"addStringRadioGroup">>["body"],
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<MethodNameToConfig<"addStringRadioGroup">>["body"]
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
