import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

/**
 * Generates ItemTypeBuilder.addUrl() method calls.
 * Uses base class template methods for standard behavior.
 */
export class UrlFieldGenerator extends FieldGenerator<"addUrl"> {
  getMethodCallName() {
    return "addUrl" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addUrl"> {
    return this.generateTemplateConfig();
  }
}
