import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";

export class DateGenerator extends FieldGenerator<"addDate"> {
  getMethodCallName() {
    return "addDate" as const;
  }

  generateBuildConfig() {
    throw new Error("generateBuildConfig not implemented in DateGenerator");
  }
}
