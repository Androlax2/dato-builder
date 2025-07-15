import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";
import { FieldGenerator } from "./FieldGenerator";

export class BooleanRadioGroupFieldGenerator extends FieldGenerator<"addBooleanRadioGroup"> {
  getMethodCallName() {
    return "addBooleanRadioGroup" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addBooleanRadioGroup"> {
    const config = this.createBaseConfig();
    const body = this.createBaseBody();

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);

    const { positive_radio, negative_radio } = this.extractRadioLabels();

    return {
      ...config,
      positive_radio,
      negative_radio,
      ...(this.hasBodyContent(body) && { body }),
    };
  }

  private extractRadioLabels() {
    const parameters = this.field.appearance?.parameters as any;

    const positive_radio = {
      label: parameters?.positive_radio?.label || "Yes",
      ...(parameters?.positive_radio?.hint && {
        hint: parameters.positive_radio.hint,
      }),
    };

    const negative_radio = {
      label: parameters?.negative_radio?.label || "No",
      ...(parameters?.negative_radio?.hint && {
        hint: parameters.negative_radio.hint,
      }),
    };

    return { positive_radio, negative_radio };
  }
}
