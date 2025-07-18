import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { FieldGeneratorFactory } from "@/FileGeneration/FieldGenerators/FieldGeneratorFactory";
import { FileGenerator } from "@/FileGeneration/FileGenerator";

export type FileGenerationRequest = {
  itemType: ItemType;
  fields: Field[];
  type: "block" | "model";
  localDevelopment?: boolean;
};

/**
 * Service responsible for orchestrating file generation
 * Simplified to remove unnecessary abstractions
 */
export class FileGenerationService {
  private readonly itemTypeReferences: Map<string, ItemType> = new Map();
  private readonly fieldGeneratorFactory: FieldGeneratorFactory;

  constructor() {
    this.fieldGeneratorFactory = new FieldGeneratorFactory();
  }

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
  public async generateFile(request: FileGenerationRequest): Promise<string> {
    const fileGenerator = new FileGenerator(
      {
        itemType: request.itemType,
        fields: request.fields,
        type: request.type,
        itemTypeReferences: this.itemTypeReferences,
        localDevelopment: request.localDevelopment,
      },
      this.fieldGeneratorFactory,
    );

    return fileGenerator.generate();
  }
}
