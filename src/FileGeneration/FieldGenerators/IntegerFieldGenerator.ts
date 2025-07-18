import { NumberFieldGenerator } from "@/FileGeneration/FieldGenerators/NumberFieldGenerator";

/**
 * Generates ItemTypeBuilder.addInteger() method calls.
 */
export class IntegerFieldGenerator extends NumberFieldGenerator<"addInteger"> {
  getMethodCallName() {
    return "addInteger" as const;
  }
}
