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
    const config = this.generateTemplateConfig();

    // Extract appearance parameters using new template method
    const enable_alpha = this.extractAppearanceParameter<boolean>(
      "enable_alpha",
      "boolean",
    );
    const preset_colors = this.extractAppearanceParameter<string[]>(
      "preset_colors",
      "array",
    );

    if (enable_alpha !== undefined) {
      config.enable_alpha = enable_alpha;
    }

    if (preset_colors !== undefined) {
      config.preset_colors = preset_colors;
    }

    return config;
  }

  protected override addFieldSpecificValidators(_validators: any): void {
    // ColorPicker only uses standard validators, no custom ones
  }
}
