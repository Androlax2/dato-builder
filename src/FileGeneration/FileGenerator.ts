import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import type { FieldGeneratorFactory } from "@/FileGeneration/FieldGenerators/FieldGeneratorFactory";

export interface FileGeneratorConfig {
  itemType: ItemType;
  fields: Field[];
  type: "block" | "model";
  itemTypeReferences: Map<string, ItemType>;
}

export class FileGenerator {
  constructor(
    private readonly config: FileGeneratorConfig,
    private readonly fieldGeneratorFactory: FieldGeneratorFactory,
  ) {}

  /**
   * Generate a TypeScript file for a block or model
   */
  public generate(): string {
    const builderClass =
      this.config.type === "block" ? "BlockBuilder" : "ModelBuilder";
    const functionName = `build${this.toPascalCase(this.config.itemType.name)}`;
    const needsAsync = this.hasBlockReferences(this.config.fields);

    return this.buildFileContent(functionName, builderClass, needsAsync);
  }

  private buildFileContent(
    functionName: string,
    builderClass: string,
    needsAsync: boolean,
  ): string {
    const imports = this.generateImports(builderClass);
    const functionDef = this.generateFunction(
      functionName,
      builderClass,
      needsAsync,
    );

    return `${imports}\n\n${functionDef}`;
  }

  private generateImports(builderClass: string): string {
    return `import ${builderClass} from "../../${builderClass}";
import type { BuilderContext } from "../../types/BuilderContext";`;
  }

  private generateFunction(
    functionName: string,
    builderClass: string,
    needsAsync: boolean,
  ): string {
    const asyncKeyword = needsAsync ? "async " : "";
    const params = needsAsync ? "{ config, getBlock, getModel }" : "{ config }";
    const builderConfig = this.generateBuilderConfig();
    const fieldMethods = this.generateFieldMethods(needsAsync);

    return `/**
 * Build a "${this.config.itemType.name}" ${this.config.type} in DatoCMS.
 * Generated from DatoCMS API on ${new Date().toISOString()}
 * API Key: ${this.config.itemType.api_key}
 */
export default ${asyncKeyword}function ${functionName}(${params}: BuilderContext) {
  return new ${builderClass}(${builderConfig})${fieldMethods};
}`;
  }

  private generateBuilderConfig(): string {
    if (this.config.type === "model") {
      return `{
      name: '${this.config.itemType.name}',
      config,
      body: {
        singleton: ${this.config.itemType.singleton || false},
        sortable: ${this.config.itemType.sortable || false},
        draft_mode_active: ${this.config.itemType.draft_mode_active || false},
        all_locales_required: ${this.config.itemType.all_locales_required || false},
      },
    }`;
    } else {
      return `{
      name: '${this.config.itemType.name}',
      config,
      options: {
        api_key: '${this.config.itemType.api_key}',
        hint: '${this.config.itemType.hint || ""}',
      },
    }`;
    }
  }

  private generateFieldMethods(needsAsync: boolean): string {
    const sortedFields = [...this.config.fields].sort(
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

  private hasBlockReferences(fields: Field[]): boolean {
    return fields.some((field) => this.fieldReferencesOtherItems(field));
  }

  private fieldReferencesOtherItems(field: Field): boolean {
    return (
      (field.field_type === "rich_text" ||
        field.field_type === "single_block" ||
        field.field_type === "structured_text") &&
      this.getReferencedItemIds(field).length > 0
    );
  }

  private getReferencedItemIds(field: Field): string[] {
    const itemIds: string[] = [];
    const validators = field.validators as any;

    if (validators?.rich_text_blocks?.item_types) {
      itemIds.push(...validators.rich_text_blocks.item_types);
    }
    if (validators?.single_block?.item_types) {
      itemIds.push(...validators.single_block.item_types);
    }
    if (validators?.structured_text_blocks?.item_types) {
      itemIds.push(...validators.structured_text_blocks.item_types);
    }

    return itemIds;
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  }
}
