import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { DateGenerator } from "@/FileGeneration/FieldGenerators/DateGenerator";
import type {
  FieldGenerator,
  FieldGeneratorConfig,
} from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { ItemTypeBuilderAddMethods } from "@/types/ItemTypeBuilderFields";

type FieldGeneratorConstructor = new (
  config: FieldGeneratorConfig,
) => FieldGenerator<ItemTypeBuilderAddMethods>;

export class FieldGeneratorFactory {
  /**
   * Main factory method that determines the correct generator based on field type and appearance
   */
  createGenerator(
    config: FieldGeneratorConfig,
  ): FieldGenerator<ItemTypeBuilderAddMethods> {
    const field = config.field;

    const GeneratorClass = this.getGeneratorClass(field);
    return new GeneratorClass(config);
  }

  /**
   * Complex mapping logic to determine the correct generator class
   */
  private getGeneratorClass(field: Field): FieldGeneratorConstructor {
    const generatorMap: Record<Field["field_type"], FieldGeneratorConstructor> =
      {
        date: DateGenerator,
      };

    const generatorClass = generatorMap[field.field_type];

    if (!generatorClass) {
      throw new Error(`No generator found for field type: ${field.field_type}`);
    }

    return generatorClass;
  }
}
