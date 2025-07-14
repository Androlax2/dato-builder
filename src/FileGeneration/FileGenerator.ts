import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import type { FieldGeneratorFactory } from "@/FileGeneration/FieldGenerators/FieldGeneratorFactory";
import { BlockReferenceAnalyzer } from "@/FileGeneration/FileGenerators/BlockReferenceAnalyzer";
import { BuilderConfigGenerator } from "@/FileGeneration/FileGenerators/BuilderConfigGenerator";
import { FieldMethodGenerator } from "@/FileGeneration/FileGenerators/FieldMethodGenerator";
import {
  CodeFormatter,
  type FormatterConfig,
} from "@/FileGeneration/FileGenerators/formatters/CodeFormatter";
import { ImportGenerator } from "@/FileGeneration/FileGenerators/ImportGenerator";
import { toPascalCase } from "@/utils/utils";
import { FunctionGenerator } from "./FileGenerators/FunctionGenerator";

export interface FileGeneratorConfig {
  itemType: ItemType;
  fields: Field[];
  type: "block" | "model";
  itemTypeReferences: Map<string, ItemType>;
  formatting?: Partial<FormatterConfig>;
}

export class FileGenerator {
  private readonly importGenerator = new ImportGenerator();
  private readonly builderConfigGenerator = new BuilderConfigGenerator();
  private readonly fieldMethodGenerator: FieldMethodGenerator;
  private readonly blockReferenceAnalyzer = new BlockReferenceAnalyzer();
  private readonly functionGenerator: FunctionGenerator;
  private readonly codeFormatter: CodeFormatter;

  constructor(
    private readonly config: FileGeneratorConfig,
    fieldGeneratorFactory: FieldGeneratorFactory,
  ) {
    this.fieldMethodGenerator = new FieldMethodGenerator(fieldGeneratorFactory);
    this.functionGenerator = new FunctionGenerator(
      this.builderConfigGenerator,
      this.fieldMethodGenerator,
    );
    this.codeFormatter = new CodeFormatter(config.formatting);
  }

  /**
   * Generate a TypeScript file for a block or model
   */
  public async generate(): Promise<string> {
    const builderClass =
      this.config.type === "block" ? "BlockBuilder" : "ModelBuilder";
    const functionName = `build${toPascalCase(this.config.itemType.name)}`;
    const needsAsync = this.blockReferenceAnalyzer.hasBlockReferences(
      this.config.fields,
    );

    return await this.codeFormatter.format(
      this.buildFileContent(functionName, builderClass, needsAsync),
    );
  }

  private buildFileContent(
    functionName: string,
    builderClass: string,
    needsAsync: boolean,
  ): string {
    const imports = this.importGenerator.generateImports(builderClass);
    const functionDef = this.functionGenerator.generateFunction(
      functionName,
      builderClass,
      needsAsync,
      this.config.itemType,
      this.config.type,
      this.config.fields,
    );

    return `${imports}\n\n${functionDef}`;
  }
}
