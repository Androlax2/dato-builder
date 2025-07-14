import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import type { FieldGeneratorFactory } from "@/FileGeneration/FieldGenerators/FieldGeneratorFactory";

export class FieldMethodGenerator {
  constructor(private readonly fieldGeneratorFactory: FieldGeneratorFactory) {}

  generateFieldMethods(fields: Field[]): string {
    const sortedFields = [...fields].sort(
      (a, b) => (a.position || 0) - (b.position || 0),
    );

    return sortedFields
      .map((field) => {
        const generator = this.fieldGeneratorFactory.createGenerator({
          field,
        });
        return generator.generateMethodCall();
      })
      .join("");
  }
}
