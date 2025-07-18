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
    const parameters = this.extractAppearanceParameters<{
      positive_radio?: { label?: string; hint?: string };
      negative_radio?: { label?: string; hint?: string };
    }>({
      positive_radio: { type: "object" },
      negative_radio: { type: "object" },
    });

    const positive_radio = {
      label: parameters.positive_radio?.label || "Yes",
      ...(parameters.positive_radio?.hint && {
        hint: parameters.positive_radio.hint,
      }),
    };

    const negative_radio = {
      label: parameters.negative_radio?.label || "No",
      ...(parameters.negative_radio?.hint && {
        hint: parameters.negative_radio.hint,
      }),
    };

    return { positive_radio, negative_radio };
  }
}
