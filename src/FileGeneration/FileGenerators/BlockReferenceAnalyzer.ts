import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";

export interface UsedFunctions {
  needsGetBlock: boolean;
  needsGetModel: boolean;
}

export class BlockReferenceAnalyzer {
  hasBlockReferences(fields: Field[]): boolean {
    return fields.some((field) => this.fieldReferencesOtherItems(field));
  }

  getUsedFunctions(
    fields: Field[],
    itemTypeReferences?: Map<string, ItemType>,
  ): UsedFunctions {
    let needsGetBlock = false;
    let needsGetModel = false;

    if (!itemTypeReferences) {
      // If no references available, assume both might be needed
      const hasReferences = this.hasBlockReferences(fields);
      return {
        needsGetBlock: hasReferences,
        needsGetModel: hasReferences,
      };
    }

    for (const field of fields) {
      if (this.fieldReferencesOtherItems(field)) {
        const referencedIds = this.getReferencedItemIds(field);
        for (const id of referencedIds) {
          const itemType = itemTypeReferences.get(id);
          if (itemType) {
            if (itemType.modular_block) {
              needsGetBlock = true;
            } else {
              needsGetModel = true;
            }
          }
        }
      }
    }

    return { needsGetBlock, needsGetModel };
  }

  private fieldReferencesOtherItems(field: Field): boolean {
    return (
      (field.field_type === "rich_text" ||
        field.field_type === "single_block" ||
        field.field_type === "structured_text" ||
        field.field_type === "link" ||
        field.field_type === "links") &&
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
    if (validators?.item_item_type?.item_types) {
      itemIds.push(...validators.item_item_type.item_types);
    }
    if (validators?.items_item_type?.item_types) {
      itemIds.push(...validators.items_item_type.item_types);
    }

    return itemIds;
  }
}
