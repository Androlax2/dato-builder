import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

/**
 * Generates ItemTypeBuilder.addEmail() method calls.
 * Uses base class template methods for standard behavior.
 */
export class EmailFieldGenerator extends FieldGenerator<"addEmail"> {
  getMethodCallName() {
    return "addEmail" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addEmail"> {
    return this.generateTemplateConfig();
  }
}
