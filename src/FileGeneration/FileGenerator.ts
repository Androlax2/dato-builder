import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import type { Options } from "prettier";
import type { FieldGeneratorFactory } from "@/FileGeneration/FieldGenerators/FieldGeneratorFactory";
import { BlockReferenceAnalyzer } from "@/FileGeneration/FileGenerators/BlockReferenceAnalyzer";
import { BuilderConfigGenerator } from "@/FileGeneration/FileGenerators/BuilderConfigGenerator";
import { FieldMethodGenerator } from "@/FileGeneration/FileGenerators/FieldMethodGenerator";
import { CodeFormatter } from "@/FileGeneration/FileGenerators/formatters/CodeFormatter";
import { ImportGenerator } from "@/FileGeneration/FileGenerators/ImportGenerator";
import { toPascalCase } from "@/utils/utils";
import { FunctionGenerator } from "./FileGenerators/FunctionGenerator";

export interface FileGeneratorConfig {
  itemType: ItemType;
  fields: Field[];
  type: "block" | "model";
  itemTypeReferences: Map<string, ItemType>;
  formatting?: Options;
}

/**
 * FileGenerator simplified without unnecessary interfaces
 * Maintains dependency injection but removes interface overhead
 */
export class FileGenerator {
  private readonly importGenerator: ImportGenerator;
  private readonly builderConfigGenerator: BuilderConfigGenerator;
  private readonly fieldMethodGenerator: FieldMethodGenerator;
  private readonly blockReferenceAnalyzer: BlockReferenceAnalyzer;
  private readonly functionGenerator: FunctionGenerator;
  private readonly codeFormatter: CodeFormatter;

  constructor(
    private readonly config: FileGeneratorConfig,
    fieldGeneratorFactory: FieldGeneratorFactory,
  ) {
    this.importGenerator = new ImportGenerator();
    this.builderConfigGenerator = new BuilderConfigGenerator();
    this.fieldMethodGenerator = new FieldMethodGenerator(fieldGeneratorFactory);
    this.blockReferenceAnalyzer = new BlockReferenceAnalyzer();
    this.functionGenerator = new FunctionGenerator(
      this.builderConfigGenerator,
      this.fieldMethodGenerator,
    );
    this.codeFormatter = new CodeFormatter(this.config.formatting);
  }

  /**
   * Generate a TypeScript file for a block or model
   * Simplified to follow KISS principle
   */
  public async generate(): Promise<string> {
    const context = this.createGenerationContext();
    const content = this.buildFileContent(context);
    return this.codeFormatter.format(content);
  }

  private createGenerationContext() {
    return {
      builderClass:
        this.config.type === "block" ? "BlockBuilder" : "ModelBuilder",
      functionName: `build${toPascalCase(this.config.itemType.name)}`,
      needsAsync: this.blockReferenceAnalyzer.hasBlockReferences(
        this.config.fields,
      ),
    };
  }

  private buildFileContent(context: {
    builderClass: string;
    functionName: string;
    needsAsync: boolean;
  }): string {
    const imports = this.importGenerator.generateImports(context.builderClass);
    const functionDef = this.functionGenerator.generateFunction(
      context.functionName,
      context.builderClass,
      context.needsAsync,
      this.config.itemType,
      this.config.type,
      this.config.fields,
    );

    return `${imports}\n\n${functionDef}`;
  }
}
