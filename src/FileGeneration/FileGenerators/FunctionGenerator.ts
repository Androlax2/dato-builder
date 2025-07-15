import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import type { UsedFunctions } from "@/FileGeneration/FileGenerators/BlockReferenceAnalyzer";
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
    usedFunctions: UsedFunctions,
    itemType: ItemType,
    type: "block" | "model",
    fields: Field[],
  ): string {
    this.validateInputs(functionName, builderClass, itemType);

    const functionSignature = this.createFunctionSignature(
      functionName,
      needsAsync,
      usedFunctions,
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
    usedFunctions: UsedFunctions,
  ): string {
    const asyncKeyword = needsAsync ? "async " : "";

    // Build parameter list based on what's actually used
    const params = ["config"];
    if (usedFunctions.needsGetBlock) {
      params.push("getBlock");
    }
    if (usedFunctions.needsGetModel) {
      params.push("getModel");
    }

    const paramString = `{ ${params.join(", ")} }`;
    return `export default ${asyncKeyword}function ${functionName}(${paramString}: BuilderContext)`;
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
