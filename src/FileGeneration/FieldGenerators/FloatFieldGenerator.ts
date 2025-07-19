import { NumberFieldGenerator } from "@/FileGeneration/FieldGenerators/NumberFieldGenerator";

/**
 * Generates ItemTypeBuilder.addFloat() method calls.
 */
export class FloatFieldGenerator extends NumberFieldGenerator<"addFloat"> {
  getMethodCallName() {
    return "addFloat" as const;
  }
}
