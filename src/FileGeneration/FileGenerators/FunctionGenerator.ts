import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import type { BuilderConfigGenerator } from "@/FileGeneration/FileGenerators/BuilderConfigGenerator";
import type { FieldMethodGenerator } from "@/FileGeneration/FileGenerators/FieldMethodGenerator";

interface FunctionGenerationContext {
  functionName: string;
  builderClass: string;
  needsAsync: boolean;
  itemType: ItemType;
  type: "block" | "model";
  fields: Field[];
}

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
    this.validateInputs(functionName, builderClass, itemType);

    const functionSignature = this.createFunctionSignature(
      functionName,
      needsAsync,
    );
    const documentation = this.createDocumentation(itemType, type);
    const builderConfig = this.builderConfigGenerator.generateBuilderConfig(
      itemType,
      type,
    );
    const fieldMethods = this.fieldMethodGenerator.generateFieldMethods(fields);
    const functionBody = this.createFunctionBody(
      builderClass,
      builderConfig,
      fieldMethods,
    );

    return `${documentation}
${functionSignature} {
  ${functionBody}
}`;
  }

  private validateInputs(
    functionName: string,
    builderClass: string,
    itemType: ItemType,
  ): void {
    if (!functionName)
      throw new Error("functionName cannot be null or undefined");
    if (!builderClass)
      throw new Error("builderClass cannot be null or undefined");
    if (!itemType) throw new Error("itemType cannot be null or undefined");
  }

  private createFunctionSignature(
    functionName: string,
    needsAsync: boolean,
  ): string {
    const asyncKeyword = needsAsync ? "async " : "";
    const params = needsAsync ? "{ config, getBlock, getModel }" : "{ config }";
    return `export default ${asyncKeyword}function ${functionName}(${params}: BuilderContext)`;
  }

  private createDocumentation(itemType: ItemType, type: string): string {
    const escapedName = itemType.name
      .replace(/'/g, "\\''")
      .replace(/"/g, '\\"');
    return `/**
 * Build a "${escapedName}" ${type} in DatoCMS.
 * Generated from DatoCMS API on ${new Date().toISOString()}
 * API Key: ${itemType.api_key.replace(/'/g, "\\''").replace(/"/g, '\\"')}
 */`;
  }

  private createFunctionBody(
    builderClass: string,
    builderConfig: string,
    fieldMethods: string,
  ): string {
    return `return new ${builderClass}(${builderConfig})${fieldMethods};`;
  }
}
