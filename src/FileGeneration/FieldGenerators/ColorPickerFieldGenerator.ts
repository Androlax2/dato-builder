import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

/**
 * Generates ItemTypeBuilder.addColorPicker() method calls.
 */
export class ColorPickerFieldGenerator extends FieldGenerator<"addColorPicker"> {
  getMethodCallName() {
    return "addColorPicker" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addColorPicker"> {
    const config =
      this.createBaseConfig() as MethodNameToConfig<"addColorPicker">;
    const body = this.buildColorPickerFieldBody();

    // Extract appearance parameters for the top-level config
    this.addAppearanceParameters(config);

    if (this.hasBodyContent(body)) {
      config.body = body;
    }

    return config;
  }

  private buildColorPickerFieldBody(): NonNullable<
    MethodNameToConfig<"addColorPicker">["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<"addColorPicker">["body"]
    >;

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addColorPickerValidators(body);

    return body;
  }

  private addAppearanceParameters(
    config: MethodNameToConfig<"addColorPicker">,
  ): void {
    const appearance = this.field.appearance;

    if (appearance?.parameters) {
      const { enable_alpha, preset_colors } = appearance.parameters;

      if (typeof enable_alpha === "boolean") {
        config.enable_alpha = enable_alpha;
      }

      if (Array.isArray(preset_colors)) {
        config.preset_colors = preset_colors;
      }
    }
  }

  private addColorPickerValidators(
    body: NonNullable<MethodNameToConfig<"addColorPicker">["body"]>,
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<MethodNameToConfig<"addColorPicker">["body"]>["validators"]
    >;

    this.processRequiredValidator(validators);

    if (Object.keys(validators).length > 0) {
      body.validators = validators;
    }
  }
}
