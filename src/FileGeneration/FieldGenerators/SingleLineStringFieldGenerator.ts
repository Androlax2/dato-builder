import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

export class SingleLineStringFieldGenerator extends FieldGenerator<"addSingleLineString"> {
  getMethodCallName() {
    return "addSingleLineString" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addSingleLineString"> {
    const config = this.generateTemplateConfig();

    // Extract appearance parameters using new template method
    const options = this.extractAppearanceParameters<
      NonNullable<MethodNameToConfig<"addSingleLineString">["options"]>
    >({
      heading: { type: "boolean" },
      placeholder: { type: "string" },
    });

    if (Object.keys(options).length > 0) {
      config.options = options;
    }

    return config;
  }

  protected override addFieldSpecificValidators(validators: any): void {
    // SingleLineString uses standard validators, so delegate to base class
    this.processEnumValidator(validators);
  }
}
