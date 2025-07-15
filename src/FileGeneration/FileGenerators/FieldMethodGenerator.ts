import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import type { FieldGeneratorFactory } from "@/FileGeneration/FieldGenerators/FieldGeneratorFactory";
export class FieldMethodGenerator {
  constructor(private readonly fieldGeneratorFactory: FieldGeneratorFactory) {}

  public generateFieldMethods(fields: Field[]): string {
    if (!fields) {
      throw new Error("Invalid input: fields cannot be null or undefined");
    }

    if (fields.length === 0) {
      return "";
    }

    const sortedFields = [...fields].sort(
      (a, b) => (a.position || 0) - (b.position || 0),
    );
    return this.generateMethodCalls(sortedFields);
  }

  private generateMethodCalls(fields: Field[]): string {
    return fields.map((field) => this.generateSingleMethodCall(field)).join("");
  }

  private generateSingleMethodCall(field: Field): string {
    const generator = this.fieldGeneratorFactory.createGenerator({ field });
    return generator.generateMethodCall();
  }
}
