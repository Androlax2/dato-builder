import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { ColorPickerFieldGenerator } from "@/FileGeneration/FieldGenerators/ColorPickerFieldGenerator";
import { DateFieldGenerator } from "@/FileGeneration/FieldGenerators/DateFieldGenerator";
import { DateTimeFieldGenerator } from "@/FileGeneration/FieldGenerators/DateTimeFieldGenerator";
import type {
  FieldGenerator,
  FieldGeneratorConfig,
} from "@/FileGeneration/FieldGenerators/FieldGenerator";
import { LocationFieldGenerator } from "@/FileGeneration/FieldGenerators/LocationFieldGenerator";
import { SeoFieldGenerator } from "@/FileGeneration/FieldGenerators/SeoFieldGenerator";
import type { ItemTypeBuilderAddMethods } from "@/types/ItemTypeBuilderFields";

type FieldGeneratorConstructor = new (
  config: FieldGeneratorConfig,
) => FieldGenerator<ItemTypeBuilderAddMethods>;

// TODO: Remove the Partial type when all field types are implemented

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
    const generatorMap: Partial<
      Record<Field["field_type"], FieldGeneratorConstructor>
    > = {
      color: ColorPickerFieldGenerator,
      date: DateFieldGenerator,
      date_time: DateTimeFieldGenerator,
      lat_lon: LocationFieldGenerator,
      seo: SeoFieldGenerator,
    };

    const generatorClass = generatorMap[field.field_type];

    if (!generatorClass) {
      throw new Error(`No generator found for field type: ${field.field_type}`);
    }

    return generatorClass;
  }
}
