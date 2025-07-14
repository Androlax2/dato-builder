import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";

export class DateGenerator extends FieldGenerator {
  getMethodCallName(): string {
    return "addDate";
  }
}
