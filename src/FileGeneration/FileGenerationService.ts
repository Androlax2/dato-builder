import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { FieldGeneratorFactory } from "@/FileGeneration/FieldGenerators/FieldGeneratorFactory";
import { FileGenerator } from "@/FileGeneration/FileGenerator";

type FileGenerationItem = {
  itemType: ItemType;
  fields: Field[];
  type: "block" | "model";
};

export class FileGenerationService {
  private readonly itemTypeReferences: Map<string, ItemType> = new Map();

  /**
   * Set references to all item types for resolving dependencies
   */
  public setItemTypeReferences(itemTypes: ItemType[]): void {
    this.itemTypeReferences.clear();
    for (const itemType of itemTypes) {
      this.itemTypeReferences.set(itemType.id, itemType);
    }
  }

  /**
   * Generate a TypeScript file for a block or model
   */
  public async generateFile({
    itemType,
    fields,
    type,
  }: FileGenerationItem): Promise<string> {
    return new FileGenerator(
      {
        itemType,
        fields,
        type,
        itemTypeReferences: this.itemTypeReferences,
      },
      new FieldGeneratorFactory(),
    ).generate();
  }
}
