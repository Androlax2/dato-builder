import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import type { BuilderConfigGenerator } from "@/FileGeneration/FileGenerators/BuilderConfigGenerator";
import type { FieldMethodGenerator } from "@/FileGeneration/FileGenerators/FieldMethodGenerator";

export class FunctionGenerator {
  constructor(
    private readonly builderConfigGenerator: BuilderConfigGenerator,
    private readonly fieldMethodGenerator: FieldMethodGenerator,
  ) {}

  generateFunction(
    functionName: string,
    builderClass: string,
    needsAsync: boolean,
    itemType: ItemType,
    type: "block" | "model",
    fields: Field[],
  ): string {
    const asyncKeyword = needsAsync ? "async " : "";
    const params = needsAsync ? "{ config, getBlock, getModel }" : "{ config }";
    const builderConfig = this.builderConfigGenerator.generateBuilderConfig(
      itemType,
      type,
    );
    const fieldMethods = this.fieldMethodGenerator.generateFieldMethods(fields);

    return `/**
 * Build a "${itemType.name}" ${type} in DatoCMS.
 * Generated from DatoCMS API on ${new Date().toISOString()}
 * API Key: ${itemType.api_key}
 */
export default ${asyncKeyword}function ${functionName}(${params}: BuilderContext) {
  return new ${builderClass}(${builderConfig})${fieldMethods};
}`;
  }
}
