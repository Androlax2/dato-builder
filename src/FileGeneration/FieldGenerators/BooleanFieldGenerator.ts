import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";
import { FieldGenerator } from "./FieldGenerator";

/**
 * Generates ItemTypeBuilder.addBoolean() method calls.
 * Uses base class template methods for standard behavior.
 */
export class BooleanFieldGenerator extends FieldGenerator<"addBoolean"> {
  getMethodCallName() {
    return "addBoolean" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addBoolean"> {
    return this.generateTemplateConfig();
  }
}
