import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

export class StringRadioGroupFieldGenerator extends FieldGenerator<"addStringRadioGroup"> {
  getMethodCallName() {
    return "addStringRadioGroup" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addStringRadioGroup"> {
    const config =
      this.createBaseConfig() as MethodNameToConfig<"addStringRadioGroup">;
    const body = this.buildStringRadioGroupFieldBody();

    const radios = this.extractRadios();

    config.radios = radios;

    if (this.hasBodyContent(body)) {
      config.body = body;
    }

    return config;
  }

  private buildStringRadioGroupFieldBody(): NonNullable<
    MethodNameToConfig<"addStringRadioGroup">["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<"addStringRadioGroup">["body"]
    >;

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addStringRadioGroupValidators(body);

    return body;
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

  private addStringRadioGroupValidators(
    body: NonNullable<MethodNameToConfig<"addStringRadioGroup">["body"]>,
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<
        MethodNameToConfig<"addStringRadioGroup">["body"]
      >["validators"]
    >;

    // Process each validator type individually to ensure proper conversion
    this.processRequiredValidator(validators);
    this.processUniqueValidator(validators);

    if (Object.keys(validators).length > 0) {
      body.validators = validators;
    }
  }
}
